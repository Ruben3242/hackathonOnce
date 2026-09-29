import { describe, expect, it } from "vitest";
import { TABLERO_4 } from "../../fixtures/once/diagramas";
import { analyzePosition } from "./engine";
import { verifyDiagram } from "./verify";
import { diagramToFen } from "./fen";
import type { Color, DiagramaCanonico, PieceKind, Square } from "../b8/types";

function p(square: Square, kind: PieceKind, color: Color) {
  return { square, kind, color };
}

describe("FEN y verificación", () => {
  it("tablero 4 genera 8 filas y un rey por bando", () => {
    const fen = diagramToFen(TABLERO_4, "white");
    expect(fen.split(" ")[0].split("/")).toHaveLength(8);
    expect(fen).toContain("K");
    expect(fen).toContain("k");
  });

  it("detecta rey blanco duplicado", () => {
    const d: DiagramaCanonico = {
      ...TABLERO_4,
      pieces: [...TABLERO_4.pieces, p("e1", "R", "white")],
    };
    const alerts = verifyDiagram(d);
    expect(alerts.some((a) => a.code === "duplicate-king")).toBe(true);
  });

  it("detecta peones de más", () => {
    const d: DiagramaCanonico = {
      ...TABLERO_4,
      pieces: [
        ...TABLERO_4.pieces,
        p("d2", "P", "white"),
        p("e2", "P", "white"),
        p("e3", "P", "white"),
      ],
    };
    const alerts = verifyDiagram(d);
    expect(alerts.some((a) => a.code === "too-many-pawns")).toBe(true);
  });
});

describe("motor local", () => {
  it("tablero 4 es legal y sugiere una jugada", () => {
    const intel = analyzePosition(TABLERO_4, "white");
    expect(intel.legal).toBe(true);
    expect(intel.best?.san).toBeTruthy();
    expect(intel.moveCount).toBeGreaterThan(0);
  });

  it("reconoce mate con dama", () => {
    const mate: DiagramaCanonico = {
      id: "mate-test",
      title: "mate",
      pieces: [p("g6", "R", "white"), p("e7", "D", "white"), p("g8", "R", "black")],
      highlights: [],
      arrows: [],
    };
    const intel = analyzePosition(mate, "white");
    expect(intel.legal).toBe(true);
    expect(intel.moves.some((m) => m.tag === "mate") || intel.best?.san.includes("#")).toBe(true);
  });
});
