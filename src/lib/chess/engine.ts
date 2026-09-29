import { Chess, validateFen, type Color as ChessColor, type Move, type Square as ChessSquare } from "chess.js";
import type { Color, DiagramaCanonico, Square } from "@/lib/b8/types";
import { KIND_NAME } from "@/lib/b8/types";
import { diagramToFen } from "./fen";
import { verifyDiagram, type PieceAlert } from "./verify";

export type MoveTag = "mate" | "check" | "capture" | "quiet";

export type ListedMove = {
  san: string;
  from: Square;
  to: Square;
  text: string;
  tag: MoveTag;
};

export type BestMove = {
  san: string;
  from: Square;
  to: Square;
  text: string;
  score: number;
};

export type PositionIntel = {
  fen: string;
  legal: boolean;
  illegalReason?: string;
  side: Color;
  alerts: PieceAlert[];
  inCheck: boolean;
  checkmate: boolean;
  stalemate: boolean;
  draw: boolean;
  best?: BestMove;
  precautions: string[];
  strategies: string[];
  moves: ListedMove[];
  moveCount: number;
};

const PIECE_ES: Record<string, string> = {
  p: "Peón",
  n: "Caballo",
  b: "Alfil",
  r: "Torre",
  q: "Dama",
  k: "Rey",
};

const VAL: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

function describeMove(m: Move): string {
  const name = PIECE_ES[m.piece] ?? m.piece;
  let text = `${name} ${m.from} → ${m.to}`;
  if (m.captured) text += ` (captura ${PIECE_ES[m.captured]?.toLowerCase() ?? m.captured})`;
  if (m.promotion) text += ` y promociona a ${PIECE_ES[m.promotion]?.toLowerCase() ?? m.promotion}`;
  if (m.san.includes("#")) text += ". Jaque mate";
  else if (m.san.includes("+")) text += ". Jaque";
  return text;
}

function tagMove(m: Move): MoveTag {
  if (m.san.includes("#")) return "mate";
  if (m.san.includes("+")) return "check";
  if (m.captured) return "capture";
  return "quiet";
}

function listed(m: Move): ListedMove {
  return {
    san: m.san,
    from: m.from as Square,
    to: m.to as Square,
    text: describeMove(m),
    tag: tagMove(m),
  };
}

function evaluate(chess: Chess): number {
  if (chess.isCheckmate()) return chess.turn() === "w" ? -100000 : 100000;
  if (chess.isDraw() || chess.isStalemate()) return 0;
  let score = 0;
  for (const row of chess.board()) {
    for (const cell of row) {
      if (!cell) continue;
      const v = VAL[cell.type] ?? 0;
      score += cell.color === "w" ? v : -v;
    }
  }
  const mobility = chess.moves().length;
  score += chess.turn() === "w" ? mobility * 2 : -mobility * 2;
  if (chess.inCheck()) score += chess.turn() === "w" ? -35 : 35;
  return score;
}

function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    const rank = (m: Move) =>
      (m.san.includes("#") ? 8000 : 0) +
      (m.captured ? (VAL[m.captured] ?? 0) - (VAL[m.piece] ?? 0) / 10 : 0) +
      (m.san.includes("+") ? 40 : 0);
    return rank(b) - rank(a);
  });
}

function alphabeta(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
): { score: number; move?: Move } {
  if (depth === 0 || chess.isGameOver()) return { score: evaluate(chess) };
  const moves = orderMoves(chess.moves({ verbose: true }));
  if (!moves.length) return { score: evaluate(chess) };

  if (chess.turn() === "w") {
    let best: Move | undefined;
    let max = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const { score } = alphabeta(chess, depth - 1, alpha, beta);
      chess.undo();
      if (score > max) {
        max = score;
        best = move;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return { score: max, move: best };
  }

  let best: Move | undefined;
  let min = Infinity;
  for (const move of moves) {
    chess.move(move);
    const { score } = alphabeta(chess, depth - 1, alpha, beta);
    chess.undo();
    if (score < min) {
      min = score;
      best = move;
    }
    beta = Math.min(beta, score);
    if (beta <= alpha) break;
  }
  return { score: min, move: best };
}

function hangingPieces(chess: Chess, us: ChessColor): string[] {
  const opp: ChessColor = us === "w" ? "b" : "w";
  const side = us === "w" ? "blanca" : "negra";
  const out: string[] = [];
  for (const row of chess.board()) {
    for (const cell of row) {
      if (!cell || cell.color !== us || cell.type === "k") continue;
      const attacked = chess.isAttacked(cell.square as ChessSquare, opp);
      const defended = chess.isAttacked(cell.square as ChessSquare, us);
      if (attacked && !defended) {
        const name = KIND_NAME[
          cell.type === "q"
            ? "D"
            : cell.type === "r"
              ? "T"
              : cell.type === "b"
                ? "A"
                : cell.type === "n"
                  ? "C"
                  : "P"
        ].singular;
        out.push(`${name} ${side} en ${cell.square} está amenazada y no defendida.`);
      }
    }
  }
  return out;
}

function opponentMates(chess: Chess): Move[] {
  if (chess.isGameOver()) return [];
  const clone = new Chess(chess.fen());
  const reply = clone.moves({ verbose: true }).filter((m) => m.san.includes("#"));
  return reply;
}

export function analyzePosition(diagram: DiagramaCanonico, side: Color): PositionIntel {
  const alerts = verifyDiagram(diagram);
  const fen = diagramToFen(diagram, side);
  const check = validateFen(fen);
  const chess = new Chess();
  const precautions: string[] = [];
  const strategies: string[] = [];

  if (!check.ok) {
    return {
      fen,
      legal: false,
      illegalReason: check.error
        ? `FEN inválida: ${check.error}`
        : "El motor no carga esta posición. Corrige duplicados o reyes imposibles en el tablero táctil.",
      side,
      alerts,
      inCheck: false,
      checkmate: false,
      stalemate: false,
      draw: false,
      precautions: [
        "No calculo jugadas hasta que el recuento y las casillas sean legales. Usa Enter en el tablero para quitar duplicados.",
      ],
      strategies: [],
      moves: [],
      moveCount: 0,
    };
  }

  try {
    chess.load(fen);
  } catch {
    return {
      fen,
      legal: false,
      illegalReason:
        "Posición ilegal para el motor (jaque al bando que no juega, reyes adyacentes o material imposible). Corrige el tablero táctil.",
      side,
      alerts,
      inCheck: false,
      checkmate: false,
      stalemate: false,
      draw: false,
      precautions: [
        "No calculo jugadas hasta que la posición sea legal. Quita piezas de más o cambia el bando que juega.",
      ],
      strategies: [],
      moves: [],
      moveCount: 0,
    };
  }

  const verbose = chess.moves({ verbose: true });
  const moves = verbose.map(listed).sort((a, b) => {
    const order: Record<MoveTag, number> = { mate: 0, check: 1, capture: 2, quiet: 3 };
    return order[a.tag] - order[b.tag];
  });

  const depth = diagram.pieces.length <= 12 ? 3 : 2;
  const { move: bestRaw, score } = alphabeta(chess, depth, -Infinity, Infinity);
  const best = bestRaw
    ? {
        san: bestRaw.san,
        from: bestRaw.from as Square,
        to: bestRaw.to as Square,
        text: describeMove(bestRaw),
        score,
      }
    : undefined;

  if (chess.isCheckmate()) {
    precautions.push("Jaque mate. No hay jugadas: la partida ya está terminada en el diagrama.");
  } else if (chess.inCheck()) {
    precautions.push(
      side === "white"
        ? "El rey blanco está en jaque: cualquier plan empieza por salir del jaque."
        : "El rey negro está en jaque: cualquier plan empieza por salir del jaque.",
    );
  }

  if (chess.isStalemate()) {
    precautions.push("Ahogado: no hay jugadas legales y el rey no está en jaque. Tablas.");
  }

  const matesNow = moves.filter((m) => m.tag === "mate");
  if (matesNow.length) {
    strategies.push(
      `Puedes dar jaque mate ahora: ${matesNow.map((m) => m.san).join(", ")}.`,
    );
  }

  const cloneForOpp = new Chess(chess.fen());
  if (bestRaw) {
    cloneForOpp.move(bestRaw);
    const replies = opponentMates(cloneForOpp);
    if (replies.length) {
      precautions.push(
        `Cuidado: si juegas ${bestRaw.san}, el rival puede mate con ${replies.map((m) => m.san).join(", ")}. Elige otra línea.`,
      );
    }
  }

  if (!chess.isGameOver()) {
    const oppTurn = new Chess(chess.fen());
    const nullMates = oppTurn.turn() !== (side === "white" ? "w" : "b") ? opponentMates(oppTurn) : [];
    if (!nullMates.length) {
      const flipped = diagramToFen(diagram, side === "white" ? "black" : "white");
      try {
        const other = new Chess(flipped);
        const threat = other.moves({ verbose: true }).filter((m) => m.san.includes("#"));
        if (threat.length) {
          precautions.push(
            `Si le tocara al otro bando, habría mate con ${threat.map((m) => m.san).join(", ")}. No dejes esa red.`,
          );
        }
      } catch {
        /* FEN inválido al invertir el turno */
      }
    }
  }

  precautions.push(...hangingPieces(chess, chess.turn()));

  if (best && !matesNow.length) {
    strategies.push(`Mejor continuación local (${depth} plies): ${best.san} — ${best.text}.`);
    if (bestRaw?.captured) {
      strategies.push("Prioriza la captura: ganas material si la recaptura no compensa.");
    } else if (bestRaw?.san.includes("+")) {
      strategies.push("El jaque obliga al rival y puede ganar tiempo.");
    } else {
      strategies.push("Sin táctica forzada a este alcance: mejora el rey, un peón pasado o una pieza inactiva.");
    }
  }

  const checks = moves.filter((m) => m.tag === "check").length;
  const captures = moves.filter((m) => m.tag === "capture").length;
  if (checks) strategies.push(`${checks} jaque(s) legal(es) en esta posición.`);
  if (captures) strategies.push(`${captures} captura(s) disponibles para contrastar con el diagrama.`);

  return {
    fen,
    legal: true,
    side,
    alerts,
    inCheck: chess.inCheck(),
    checkmate: chess.isCheckmate(),
    stalemate: chess.isStalemate(),
    draw: chess.isDraw(),
    best,
    precautions,
    strategies,
    moves: moves.slice(0, 16),
    moveCount: moves.length,
  };
}
