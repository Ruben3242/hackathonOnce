"""Evaluación: % de casillas acertadas en tableros no usados para muestrear el print de train."""

from __future__ import annotations

import json
import random
from pathlib import Path

import numpy as np
from PIL import Image

from train_piece_centroids import CLASSES, collect_images, expand_fen, fen_from_name, tile_vector

ROOT = Path(__file__).resolve().parents[1]
MODEL = json.loads((ROOT / "models" / "piece-centroids.json").read_text(encoding="utf-8"))


def predict(vec: np.ndarray) -> str:
    if MODEL.get("type") == "logreg":
        mean = np.array(MODEL["mean"], dtype=np.float32)
        scale = np.array(MODEL["scale"], dtype=np.float32)
        coef = np.array(MODEL["coef"], dtype=np.float32)
        intercept = np.array(MODEL["intercept"], dtype=np.float32)
        x = (vec - mean) / scale
        z = coef @ x + intercept
        return CLASSES[int(np.argmax(z))]
    cents = [np.array(c, dtype=np.float32) for c in MODEL["centroids"]]
    d = [np.sum((vec - c) ** 2) for c in cents]
    return CLASSES[int(np.argmin(d))]


def main() -> None:
    files = collect_images()
    random.seed(1)
    sample = random.sample(files, min(50, len(files)))
    ok = 0
    total = 0
    full = 0
    for path in sample:
        labels = expand_fen(fen_from_name(path))
        img = Image.open(path)
        hits = 0
        for sq in range(64):
            pred = predict(tile_vector(img, sq % 8, sq // 8))
            if pred == labels[sq]:
                hits += 1
            total += 1
        ok += hits
        if hits == 64:
            full += 1
    print(f"casillas {ok}/{total} = {100 * ok / total:.1f}%")
    print(f"tableros perfectos {full}/{len(sample)}")


if __name__ == "__main__":
    main()
