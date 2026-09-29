import { DIAGRAMAS } from "../src/fixtures/once/diagramas";
import { parseSquare, type DiagramaCanonico, type PieceKind } from "../src/lib/b8/types";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const GLYPH: Record<string, string> = {
  "white-R": "♔",
  "white-D": "♕",
  "white-T": "♖",
  "white-A": "♗",
  "white-C": "♘",
  "white-P": "♙",
  "black-R": "♚",
  "black-D": "♛",
  "black-T": "♜",
  "black-A": "♝",
  "black-C": "♞",
  "black-P": "♟",
};

function svgFor(diagram: DiagramaCanonico): string {
  const size = 400;
  const cell = 50;
  let cells = "";
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const light = (f + (7 - r)) % 2 === 1;
      cells += `<rect x="${f * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="${light ? "#e8dcc4" : "#5a7348"}"/>`;
    }
  }
  for (const h of diagram.highlights) {
    const { fileIndex, rank } = parseSquare(h.square);
    const x = fileIndex * cell;
    const y = (8 - rank) * cell;
    const color = h.color === "yellow" ? "#f5d442" : "#d64545";
    cells += `<rect x="${x + 3}" y="${y + 3}" width="${cell - 6}" height="${cell - 6}" fill="none" stroke="${color}" stroke-width="5"/>`;
  }
  for (const p of diagram.pieces) {
    const { fileIndex, rank } = parseSquare(p.square);
    const x = fileIndex * cell + cell / 2;
    const y = (8 - rank) * cell + cell / 2 + 8;
    const g = GLYPH[`${p.color}-${p.kind as PieceKind}`];
    cells += `<text x="${x}" y="${y}" text-anchor="middle" font-size="32">${g}</text>`;
  }
  for (const a of diagram.arrows) {
    const from = parseSquare(a.from);
    const to = parseSquare(a.to);
    const x1 = from.fileIndex * cell + cell / 2;
    const y1 = (8 - from.rank) * cell + cell / 2;
    const x2 = to.fileIndex * cell + cell / 2;
    const y2 = (8 - to.rank) * cell + cell / 2;
    cells += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1d4ed8" stroke-width="4" marker-end="url(#arr)"/>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 z" fill="#1d4ed8"/>
    </marker>
  </defs>
  ${cells}
</svg>`;
}

const out = join(process.cwd(), "public", "diagramas");
mkdirSync(out, { recursive: true });
for (const d of DIAGRAMAS) {
  writeFileSync(join(out, `${d.id}.svg`), svgFor(d), "utf8");
  console.log("wrote", join(out, `${d.id}.svg`));
}
