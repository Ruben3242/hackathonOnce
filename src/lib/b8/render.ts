import {
  KIND_LETTER,
  KIND_NAME,
  KIND_ORDER,
  algebraicSpoken,
  parseSquare,
  rankToBraille,
  type Arrow,
  type Color,
  type DiagramaCanonico,
  type Highlight,
  type PieceKind,
  type PieceOnSquare,
} from "./types";

function sortPieces(pieces: PieceOnSquare[]): PieceOnSquare[] {
  return [...pieces].sort((a, b) => {
    const ka = KIND_ORDER.indexOf(a.kind);
    const kb = KIND_ORDER.indexOf(b.kind);
    if (ka !== kb) return ka - kb;
    const fa = parseSquare(a.square);
    const fb = parseSquare(b.square);
    if (fa.fileIndex !== fb.fileIndex) return fa.fileIndex - fb.fileIndex;
    return fa.rank - fb.rank;
  });
}

function tokenFor(piece: PieceOnSquare): string {
  const { file, rank } = parseSquare(piece.square);
  return `${KIND_LETTER[piece.kind]}${file}${rankToBraille(rank)}`;
}

function joinTokens(pieces: PieceOnSquare[]): string {
  return sortPieces(pieces).map(tokenFor).join(" ");
}

function formatSquareList(squares: string[]): string {
  if (squares.length === 0) return "";
  if (squares.length === 1) return squares[0];
  if (squares.length === 2) return `${squares[0]} y ${squares[1]}`;
  return `${squares.slice(0, -1).join(", ")} y ${squares[squares.length - 1]}`;
}

function highlightBlock(highlights: Highlight[]): string {
  if (highlights.length === 0) return "";
  const yellow = highlights
    .filter((h) => h.color === "yellow")
    .map((h) => {
      const { file, rank } = parseSquare(h.square);
      return `${file}${rankToBraille(rank)}`;
    });
  const red = highlights
    .filter((h) => h.color === "red")
    .map((h) => {
      const { file, rank } = parseSquare(h.square);
      return `${file}${rankToBraille(rank)}`;
    });
  const parts: string[] = [];
  if (yellow.length) {
    parts.push(`Resaltadas en amarillo las casillas ${formatSquareList(yellow)}`);
  }
  if (red.length) {
    const intro = yellow.length ? "y, en rojo," : "Resaltadas en rojo las casillas";
    const noun = red.length === 1 && yellow.length ? "la casilla" : "";
    if (yellow.length) {
      parts.push(`${intro} ${noun} ${formatSquareList(red)}`.replace(/\s+/g, " ").trim());
    } else {
      parts.push(`${intro} ${formatSquareList(red)}`);
    }
  }
  return `)${parts.join(" ")}(`;
}

function arrowGlyph(): string {
  return "⠒⠕";
}

function squareB8(square: PieceOnSquare["square"]): string {
  const { file, rank } = parseSquare(square);
  return `${file}${rankToBraille(rank)}`;
}

function arrowBlock(arrows: Arrow[]): string {
  if (arrows.length === 0) return "";
  return arrows
    .map((a) => `${squareB8(a.from)}¬${arrowGlyph()}¬${squareB8(a.to)}`)
    .join("\n");
}

export function renderBraille(diagram: DiagramaCanonico): string {
  const white = diagram.pieces.filter((p) => p.color === "white");
  const black = diagram.pieces.filter((p) => p.color === "black");
  const lines = [
    "Tablero:",
    `Blancas: ${joinTokens(white)}`,
    `Negras: ${joinTokens(black)}`,
  ];
  const notes = highlightBlock(diagram.highlights);
  if (notes) lines.push(notes);
  const arrows = arrowBlock(diagram.arrows);
  if (arrows) lines.push(arrows);
  return lines.join("\n");
}

function groupAudio(pieces: PieceOnSquare[]): string {
  const byKind = new Map<PieceKind, PieceOnSquare[]>();
  for (const kind of KIND_ORDER) {
    const group = sortPieces(pieces.filter((p) => p.kind === kind));
    if (group.length) byKind.set(kind, group);
  }
  const clauses: string[] = [];
  for (const [kind, group] of byKind) {
    const squares = group.map((p) => algebraicSpoken(p.square));
    const names = KIND_NAME[kind];
    if (group.length === 1) {
      clauses.push(`${names.singular} en ${squares[0]}`);
    } else if (group.length === 2) {
      clauses.push(`${names.plural} en ${squares[0]} y ${squares[1]}`);
    } else {
      clauses.push(
        `${names.plural} en ${squares.slice(0, -1).join(", ")} y ${squares[squares.length - 1]}`,
      );
    }
  }
  return clauses.join(", ") + ".";
}

function spokenHighlights(highlights: Highlight[]): string {
  if (highlights.length === 0) return "";
  const yellow = highlights
    .filter((h) => h.color === "yellow")
    .map((h) => algebraicSpoken(h.square));
  const red = highlights
    .filter((h) => h.color === "red")
    .map((h) => algebraicSpoken(h.square));
  const bits: string[] = [];
  if (yellow.length) bits.push(`casillas en amarillo: ${formatSquareList(yellow)}`);
  if (red.length) bits.push(`casillas en rojo: ${formatSquareList(red)}`);
  return bits.join(". ") + ".";
}

function spokenArrows(arrows: Arrow[]): string {
  if (arrows.length === 0) return "";
  return (
    arrows
      .map(
        (a) =>
          `Flecha de ${algebraicSpoken(a.from)} a ${algebraicSpoken(a.to)}.`,
      )
      .join(" ")
  );
}

export function renderAudio(diagram: DiagramaCanonico): string {
  const white = diagram.pieces.filter((p) => p.color === "white");
  const black = diagram.pieces.filter((p) => p.color === "black");
  const parts = [
    `Blancas: ${groupAudio(white)}`,
    `Negras: ${groupAudio(black)}`,
  ];
  const hi = spokenHighlights(diagram.highlights);
  if (hi) parts.push(hi);
  const ar = spokenArrows(diagram.arrows);
  if (ar) parts.push(ar);
  return parts.join(" ");
}

export function renderFullOutput(diagram: DiagramaCanonico): string {
  const c = countElements(diagram);
  const flechas = c.arrows === 1 ? "1 flecha" : `${c.arrows} flechas`;
  const resaltes = c.highlights === 1 ? "1 resalte" : `${c.highlights} resaltes`;
  return [
    `Diagrama: ${diagram.title}`,
    `Tipo: tablero de libro 8x8.`,
    `Elementos: ${c.pieces} piezas, ${resaltes}, ${flechas}.`,
    "",
    renderBraille(diagram),
    "",
    "Audio:",
    renderAudio(diagram),
  ].join("\n");
}

export function countElements(diagram: DiagramaCanonico): {
  pieces: number;
  highlights: number;
  arrows: number;
} {
  return {
    pieces: diagram.pieces.length,
    highlights: diagram.highlights.length,
    arrows: diagram.arrows.length,
  };
}

export function emptyBoardId(): DiagramaCanonico {
  return { id: "empty", title: "Vacío", pieces: [], highlights: [], arrows: [] };
}

export function replacePiece(
  diagram: DiagramaCanonico,
  square: PieceOnSquare["square"],
  next: { kind: PieceKind; color: Color } | null,
): DiagramaCanonico {
  const pieces = diagram.pieces.filter((p) => p.square !== square);
  if (next) pieces.push({ square, kind: next.kind, color: next.color });
  return { ...diagram, pieces };
}
