import {
  KIND_NAME,
  parseSquare,
  type DiagramaCanonico,
  type PieceKind,
  type Square,
} from "@/lib/b8/types";
import { cellAriaLabel } from "@/lib/b8/types";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

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

type Props = {
  diagram: DiagramaCanonico;
  focused: Square;
  onFocus: (square: Square) => void;
  onCycle: (square: Square) => void;
  size?: "md" | "sm";
  hint?: { from: Square; to: Square };
};

export function BoardGrid({ diagram, focused, onFocus, onCycle, size = "md", hint }: Props) {
  const cell = size === "sm" ? "h-9 w-9 text-xl" : "h-12 w-12 text-[1.65rem]";
  const fileW = size === "sm" ? "w-9" : "w-12";
  const rankH = size === "sm" ? "h-9 w-5" : "h-12 w-6";
  function neighbor(square: Square, dx: number, dy: number): Square | null {
    const { fileIndex, rank } = parseSquare(square);
    const nx = fileIndex + dx;
    const ny = rank + dy;
    if (nx < 0 || nx > 7 || ny < 1 || ny > 8) return null;
    return `${FILES[nx]}${ny}` as Square;
  }

  function onKeyDown(square: Square, e: React.KeyboardEvent) {
    const map: Record<string, Square | null> = {
      ArrowLeft: neighbor(square, -1, 0),
      ArrowRight: neighbor(square, 1, 0),
      ArrowUp: neighbor(square, 0, 1),
      ArrowDown: neighbor(square, 0, -1),
    };
    const next = map[e.key];
    if (next) {
      e.preventDefault();
      onFocus(next);
      requestAnimationFrame(() => {
        document.getElementById(`sq-${next}`)?.focus();
      });
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onCycle(square);
    }
    if (e.key === "Home") {
      e.preventDefault();
      const home = `${FILES[0]}${parseSquare(square).rank}` as Square;
      onFocus(home);
      requestAnimationFrame(() => document.getElementById(`sq-${home}`)?.focus());
    }
    if (e.key === "End") {
      e.preventDefault();
      const end = `${FILES[7]}${parseSquare(square).rank}` as Square;
      onFocus(end);
      requestAnimationFrame(() => document.getElementById(`sq-${end}`)?.focus());
    }
  }

  return (
    <div className="inline-block">
      <div className="mb-1 ml-7 flex gap-0" aria-hidden="true">
        {FILES.map((file) => (
          <span key={file} className={`${fileW} text-center text-xs font-semibold uppercase text-[#5c5348]`}>
            {file}
          </span>
        ))}
      </div>
      <div className="flex">
        <div className="mr-1 flex flex-col" aria-hidden="true">
          {RANKS.map((rank) => (
            <span
              key={rank}
              className={`flex ${rankH} items-center justify-end pr-1 text-xs font-semibold text-[#5c5348]`}
            >
              {rank}
            </span>
          ))}
        </div>
        <div
          role="grid"
          aria-label="Tablero de ajedrez, ocho por ocho. Flechas para mover. Inicio y Fin para extremos de fila. Enter para cambiar la pieza. También puedes dictar."
          className="overflow-hidden rounded-lg shadow-[0_8px_30px_rgba(26,23,20,0.18)] ring-1 ring-[#c4b8a1]"
        >
          {RANKS.map((rank) => (
            <div key={rank} role="row" className="flex">
              {FILES.map((file) => {
                const square = `${file}${rank}` as Square;
                const piece = diagram.pieces.find((p) => p.square === square);
                const highlight = diagram.highlights.find((h) => h.square === square);
                const light = (file.charCodeAt(0) + rank) % 2 === 1;
                const glyph = piece ? GLYPH[`${piece.color}-${piece.kind}`] : "";
                const kindName = piece
                  ? `${KIND_NAME[piece.kind as PieceKind].singular} ${piece.color === "white" ? "blanco" : "negro"}`
                  : "Vacía";
                return (
                  <button
                    key={square}
                    id={`sq-${square}`}
                    type="button"
                    role="gridcell"
                    aria-label={cellAriaLabel(diagram, square)}
                    title={`${square} · ${kindName}`}
                    tabIndex={focused === square ? 0 : -1}
                    onClick={() => onFocus(square)}
                    onKeyDown={(e) => onKeyDown(square, e)}
                    className={[
                      "flex items-center justify-center leading-none",
                      cell,
                      light ? "square-light" : "square-dark",
                      highlight?.color === "yellow" ? "square-yellow" : "",
                      highlight?.color === "red" ? "square-red" : "",
                      focused === square ? "ring-2 ring-[#0b5cab] ring-inset" : "",
                      hint?.from === square ? "ring-2 ring-amber-500 ring-inset" : "",
                      hint?.to === square ? "ring-2 ring-orange-600 ring-inset" : "",
                    ].join(" ")}
                  >
                    <span aria-hidden="true">{glyph}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
