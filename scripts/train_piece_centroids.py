"""
Entrena un clasificador lineal de casillas con el dataset Kaggle (FEN en el nombre).
Guarda pesos en models/piece-centroids.json para inferencia en Node (sin Python).
"""

from __future__ import annotations

import json
import random
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image
from sklearn.linear_model import LogisticRegression

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "kaggle-chess-positions"
OUT = ROOT / "models" / "piece-centroids.json"

TILE = 16
MAX_BOARDS = 9000
MAX_PER_CLASS = 8000
HOLD_OUT = 100
CLASSES = [
    "empty",
    "P",
    "N",
    "B",
    "R",
    "Q",
    "K",
    "p",
    "n",
    "b",
    "r",
    "q",
    "k",
]
CLASS_INDEX = {c: i for i, c in enumerate(CLASSES)}


def fen_from_name(path: Path) -> str:
    stem = path.stem
    fen = stem.replace("-", "/")
    return fen.split()[0]


def expand_fen(fen: str) -> list[str]:
    squares: list[str] = []
    for rank in fen.split("/"):
        for ch in rank:
            if ch.isdigit():
                squares.extend(["empty"] * int(ch))
            else:
                squares.append(ch)
    if len(squares) != 64:
        raise ValueError(f"FEN inválido ({len(squares)}): {fen}")
    return squares


def tile_vector(img: Image.Image, file_i: int, rank_from_top: int) -> np.ndarray:
    w, h = img.size
    tw, th = w / 8, h / 8
    box = (
        int(file_i * tw),
        int(rank_from_top * th),
        int((file_i + 1) * tw),
        int((rank_from_top + 1) * th),
    )
    crop = img.crop(box).convert("L").resize((TILE, TILE))
    arr = np.asarray(crop, dtype=np.float32) / 255.0
    arr = arr - arr.mean()
    return arr.reshape(-1)


def collect_images() -> list[Path]:
    files: list[Path] = []
    for split in ("train", "test"):
        folder = DATA / split
        if folder.exists():
            files.extend(folder.glob("*.jpeg"))
            files.extend(folder.glob("*.jpg"))
    if not files:
        files = list(DATA.rglob("*.jpeg")) + list(DATA.rglob("*.jpg"))
    return files


def round_list(xs: np.ndarray, nd: int = 6) -> list[float]:
    return np.round(xs.astype(np.float64), nd).tolist()


def predict_batch(X: np.ndarray, mean: np.ndarray, scale: np.ndarray, coef: np.ndarray, intercept: np.ndarray) -> np.ndarray:
    z = ((X - mean) / scale) @ coef.T + intercept
    return np.argmax(z, axis=1)


def main() -> None:
    files = collect_images()
    if not files:
        raise SystemExit(
            "No hay imágenes. Ejecuta: python scripts/download_kaggle_chess.py",
        )
    random.seed(8)
    random.shuffle(files)
    hold = files[: min(HOLD_OUT, max(0, len(files) // 8))]
    train_files = files[len(hold) :]
    train_files = train_files[:MAX_BOARDS]
    print(f"Entrenando con {len(train_files)} tableros (hold-out {len(hold)})…")

    buckets: dict[str, list[np.ndarray]] = defaultdict(list)
    for i, path in enumerate(train_files):
        try:
            labels = expand_fen(fen_from_name(path))
            img = Image.open(path)
            for sq in range(64):
                lab = labels[sq]
                if len(buckets[lab]) >= MAX_PER_CLASS:
                    continue
                buckets[lab].append(tile_vector(img, sq % 8, sq // 8))
        except Exception as exc:  # noqa: BLE001
            print("salto", path.name, exc)
        if (i + 1) % 200 == 0:
            print(f"  {i + 1}/{len(train_files)}")

    X_list: list[np.ndarray] = []
    y_list: list[int] = []
    counts = [0] * len(CLASSES)
    for name in CLASSES:
        samples = buckets[name]
        if not samples:
            raise SystemExit(f"Clase sin ejemplos: {name}")
        counts[CLASS_INDEX[name]] = len(samples)
        print(f"  {name}: {len(samples)} casillas")
        X_list.extend(samples)
        y_list.extend([CLASS_INDEX[name]] * len(samples))

    X = np.stack(X_list)
    y = np.array(y_list, dtype=np.int32)
    mean = X.mean(axis=0)
    scale = X.std(axis=0)
    scale = np.where(scale < 1e-6, 1.0, scale)
    Xs = (X - mean) / scale

    clf = LogisticRegression(
        max_iter=400,
        class_weight="balanced",
        solver="lbfgs",
        C=1.0,
    )
    clf.fit(Xs, y)
    train_acc = float((clf.predict(Xs) == y).mean())
    print(f"acierto train (casillas muestreadas): {100 * train_acc:.1f}%")

    coef = clf.coef_.astype(np.float32)
    intercept = clf.intercept_.astype(np.float32)

    if hold:
        ok = 0
        total = 0
        full = 0
        for path in hold:
            try:
                labels = expand_fen(fen_from_name(path))
                img = Image.open(path)
            except Exception:
                continue
            hits = 0
            vecs = np.stack([tile_vector(img, sq % 8, sq // 8) for sq in range(64)])
            preds = predict_batch(vecs, mean, scale, coef, intercept)
            for sq in range(64):
                if CLASSES[int(preds[sq])] == labels[sq]:
                    hits += 1
                total += 1
            ok += hits
            if hits == 64:
                full += 1
        print(f"acierto hold-out: {ok}/{total} = {100 * ok / max(total, 1):.1f}%")
        print(f"tableros perfectos hold-out: {full}/{len(hold)}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "type": "logreg",
        "tile": TILE,
        "channels": 1,
        "classes": CLASSES,
        "counts": counts,
        "boards": len(train_files),
        "mean": round_list(mean),
        "scale": round_list(scale),
        "coef": [round_list(row) for row in coef],
        "intercept": round_list(intercept),
        "trainAcc": round(train_acc, 4),
    }
    OUT.write_text(json.dumps(payload), encoding="utf-8")
    print("Modelo guardado en", OUT)


if __name__ == "__main__":
    main()
