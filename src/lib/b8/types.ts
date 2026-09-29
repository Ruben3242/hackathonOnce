export type Color = "white" | "black";
export type PieceKind = "R" | "D" | "A" | "C" | "T" | "P";
export type HighlightColor = "yellow" | "red";

export type Square = `${"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

export type PieceOnSquare = {
  square: Square;
  kind: PieceKind;
  color: Color;
};

export type Highlight = {
  square: Square;
  color: HighlightColor;
};

export type Arrow = {
  from: Square;
  to: Square;
};

export type DiagramaCanonico = {
  id: string;
  title: string;
  pieces: PieceOnSquare[];
  highlights: Highlight[];
  arrows: Arrow[];
};

export const BRAILLE_RANKS = ["⠂", "⠆", "⠒", "⠲", "⠢", "⠖", "⠶", "⠦"] as const;

export const KIND_LETTER: Record<PieceKind, string> = {
  R: "R",
  D: "D",
  A: "A",
  C: "C",
  T: "T",
  P: "",
};

export const KIND_ORDER: PieceKind[] = ["R", "D", "T", "C", "A", "P"];

export const KIND_NAME: Record<PieceKind, { singular: string; plural: string }> = {
  R: { singular: "Rey", plural: "Reyes" },
  D: { singular: "Dama", plural: "Damas" },
  T: { singular: "Torre", plural: "Torres" },
  A: { singular: "Alfil", plural: "Alfiles" },
  C: { singular: "Caballo", plural: "Caballos" },
  P: { singular: "Peón", plural: "Peones" },
};

export function squareOf(file: string, rank: number): Square {
  return `${file}${rank}` as Square;
}

export function parseSquare(square: Square): { file: string; rank: number; fileIndex: number } {
  const file = square[0];
  const rank = Number(square[1]);
  return { file, rank, fileIndex: file.charCodeAt(0) - 97 };
}

export function rankToBraille(rank: number): string {
  return BRAILLE_RANKS[rank - 1] ?? "";
}

export function brailleToRank(ch: string): number | null {
  const i = BRAILLE_RANKS.indexOf(ch as (typeof BRAILLE_RANKS)[number]);
  return i === -1 ? null : i + 1;
}

export function algebraicSpoken(square: Square): string {
  const { file, rank } = parseSquare(square);
  return `${file.toUpperCase()}${rank}`;
}

export function cellAriaLabel(diagram: DiagramaCanonico, square: Square): string {
  const piece = diagram.pieces.find((p) => p.square === square);
  const highlight = diagram.highlights.find((h) => h.square === square);
  const arrowsHere = diagram.arrows.filter((a) => a.from === square || a.to === square);
  const spoken = algebraicSpoken(square).toLowerCase();
  const parts = [spoken];
  if (piece) {
    const colorName = piece.color === "white" ? "blanco" : "negro";
    parts.push(`${KIND_NAME[piece.kind].singular.toLowerCase()} ${colorName}`);
  } else {
    parts.push("vacía");
  }
  if (highlight) {
    parts.push(highlight.color === "yellow" ? "resaltada en amarillo" : "resaltada en rojo");
  }
  for (const arrow of arrowsHere) {
    if (arrow.from === square) {
      parts.push(`flecha hacia ${algebraicSpoken(arrow.to).toLowerCase()}`);
    } else {
      parts.push(`flecha desde ${algebraicSpoken(arrow.from).toLowerCase()}`);
    }
  }
  return parts.join(", ");
}
