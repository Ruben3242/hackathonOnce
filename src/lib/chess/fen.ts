import type { Color, DiagramaCanonico, PieceKind, PieceOnSquare, Square } from "@/lib/b8/types";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

const TO_FEN: Record<`${Color}-${PieceKind}`, string> = {
  "white-R": "K",
  "white-D": "Q",
  "white-A": "B",
  "white-C": "N",
  "white-T": "R",
  "white-P": "P",
  "black-R": "k",
  "black-D": "q",
  "black-A": "b",
  "black-C": "n",
  "black-T": "r",
  "black-P": "p",
};

export function occupancy(diagram: DiagramaCanonico): Map<Square, PieceOnSquare[]> {
  const map = new Map<Square, PieceOnSquare[]>();
  for (const piece of diagram.pieces) {
    const list = map.get(piece.square) ?? [];
    list.push(piece);
    map.set(piece.square, list);
  }
  return map;
}

function castling(map: Map<Square, PieceOnSquare[]>): string {
  const has = (square: Square, kind: PieceKind, color: Color) =>
    map.get(square)?.some((p) => p.kind === kind && p.color === color) ?? false;
  let rights = "";
  if (has("e1", "R", "white")) {
    if (has("h1", "T", "white")) rights += "K";
    if (has("a1", "T", "white")) rights += "Q";
  }
  if (has("e8", "R", "black")) {
    if (has("h8", "T", "black")) rights += "k";
    if (has("a8", "T", "black")) rights += "q";
  }
  return rights || "-";
}

export function diagramToFen(diagram: DiagramaCanonico, turn: Color): string {
  const map = occupancy(diagram);
  const ranks: string[] = [];
  for (let rank = 8; rank >= 1; rank--) {
    let empty = 0;
    let row = "";
    for (const file of FILES) {
      const square = `${file}${rank}` as Square;
      const here = map.get(square);
      if (!here?.length) {
        empty += 1;
        continue;
      }
      if (empty) {
        row += String(empty);
        empty = 0;
      }
      const piece = here[0];
      row += TO_FEN[`${piece.color}-${piece.kind}`];
    }
    if (empty) row += String(empty);
    ranks.push(row);
  }
  const side = turn === "white" ? "w" : "b";
  return `${ranks.join("/")} ${side} ${castling(map)} - 0 1`;
}
