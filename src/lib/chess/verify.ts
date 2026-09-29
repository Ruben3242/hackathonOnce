import type { Color, DiagramaCanonico, PieceKind } from "@/lib/b8/types";
import { occupancy } from "./fen";

export type PieceAlert = {
  level: "error" | "warn" | "ok";
  code: string;
  text: string;
};

const START: Record<PieceKind, number> = { R: 1, D: 1, T: 2, A: 2, C: 2, P: 8 };

function countBy(diagram: DiagramaCanonico, color: Color): Record<PieceKind, number> {
  const n: Record<PieceKind, number> = { R: 0, D: 0, T: 0, A: 0, C: 0, P: 0 };
  for (const p of diagram.pieces) {
    if (p.color === color) n[p.kind] += 1;
  }
  return n;
}

export function verifyDiagram(diagram: DiagramaCanonico): PieceAlert[] {
  const alerts: PieceAlert[] = [];
  const map = occupancy(diagram);

  for (const [square, list] of map) {
    if (list.length > 1) {
      alerts.push({
        level: "error",
        code: "duplicate-square",
        text: `Casilla ${square}: ${list.length} piezas superpuestas. El reconocimiento o la corrección ha duplicado ficha.`,
      });
    }
  }

  for (const color of ["white", "black"] as const) {
    const side = color === "white" ? "blancas" : "negras";
    const n = countBy(diagram, color);
    const total = Object.values(n).reduce((a, b) => a + b, 0);

    if (n.R === 0) {
      alerts.push({
        level: "error",
        code: "missing-king",
        text: `No hay rey de ${side}. Un diagrama legal tiene exactamente uno; revisa la casilla o el recorte.`,
      });
    } else if (n.R > 1) {
      alerts.push({
        level: "error",
        code: "duplicate-king",
        text: `${n.R} reyes de ${side}. Pieza duplicada: el motor no puede fiarse de esta posición.`,
      });
    }

    if (total > 16) {
      alerts.push({
        level: "error",
        code: "too-many-pieces",
        text: `${total} fichas de ${side} (máximo 16). Sobran piezas: posible error de visión.`,
      });
    }

    if (n.P > 8) {
      alerts.push({
        level: "error",
        code: "too-many-pawns",
        text: `${n.P} peones de ${side} (máximo 8). Hay peones de más.`,
      });
    }

    const extraPromoted =
      Math.max(0, n.D - START.D) +
      Math.max(0, n.T - START.T) +
      Math.max(0, n.A - START.A) +
      Math.max(0, n.C - START.C);
    if (n.P + extraPromoted > 8) {
      alerts.push({
        level: "warn",
        code: "impossible-promotions",
        text: `Las ${side} tienen ${n.P} peones y ${extraPromoted} pieza(s) extra (damas/torres/alfiles/caballos de más). No cuadra con promociones: verifica duplicados.`,
      });
    }

    if (extraPromoted > 0 && n.P + extraPromoted <= 8) {
      alerts.push({
        level: "ok",
        code: "promotion-ok",
        text: `Las ${side} tienen ${extraPromoted} pieza(s) extra respecto al material inicial: puede ser promoción, no un error.`,
      });
    }
  }

  if (!alerts.length) {
    alerts.push({
      level: "ok",
      code: "material-ok",
      text: "Recuento de material coherente: un rey por bando y sin fichas de más evidentes.",
    });
  }

  return alerts;
}
