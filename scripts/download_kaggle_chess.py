"""Descarga smallchess/kaggle-chess-positions (fuera de git)."""

from huggingface_hub import snapshot_download
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "kaggle-chess-positions"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("Descargando dataset en", OUT)
    snapshot_download(
        repo_id="smallchess/kaggle-chess-positions",
        repo_type="dataset",
        local_dir=str(OUT),
        max_workers=8,
    )
    print("Listo.")


if __name__ == "__main__":
    main()
