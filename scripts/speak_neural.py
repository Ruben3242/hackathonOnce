"""Sintetiza MP3 con voces neurales de Microsoft (paquete edge-tts)."""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from edge_tts import Communicate


async def main() -> None:
    if len(sys.argv) < 3:
        print("uso: speak_neural.py VOZ SALIDA.mp3 < texto", file=sys.stderr)
        sys.exit(2)
    voice = sys.argv[1]
    out = Path(sys.argv[2])
    text = sys.stdin.read().strip()
    if not text:
        sys.exit(3)
    await Communicate(text, voice).save(str(out))


if __name__ == "__main__":
    asyncio.run(main())
