import type { PieceKind } from "./types";

/** Ciclo Enter en el tablero táctil: vacía → blancas → negras. */
export const PIECE_CYCLE: Array<{ kind: PieceKind; color: "white" | "black" } | null> = [
  null,
  { kind: "P", color: "white" },
  { kind: "C", color: "white" },
  { kind: "A", color: "white" },
  { kind: "T", color: "white" },
  { kind: "D", color: "white" },
  { kind: "R", color: "white" },
  { kind: "P", color: "black" },
  { kind: "C", color: "black" },
  { kind: "A", color: "black" },
  { kind: "T", color: "black" },
  { kind: "D", color: "black" },
  { kind: "R", color: "black" },
];
