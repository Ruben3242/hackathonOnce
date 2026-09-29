import { describe, expect, it } from "vitest";
import { GOLD_BRAILLE, DIAGRAMAS } from "../../fixtures/once/diagramas";
import { renderAudio, renderBraille } from "./render";

function norm(s: string): string {
  return s.replace(/\r\n/g, "\n").trim();
}

describe("encoder B8 contra oro del PDF", () => {
  for (const diagram of DIAGRAMAS) {
    it(`${diagram.id} coincide con la adaptación Unicode`, () => {
      expect(norm(renderBraille(diagram))).toBe(norm(GOLD_BRAILLE[diagram.id]));
    });
  }
});

describe("encoder audio", () => {
  it("tablero 1 agrupa por bando y tipo", () => {
    const audio = renderAudio(DIAGRAMAS[0]);
    expect(audio).toContain("Blancas: Rey en E1");
    expect(audio).toContain("Torres en A1 y H1");
    expect(audio).toContain("Negras: Rey en E8");
    expect(audio).toContain("casillas en amarillo: G3 y H4");
  });

  it("tablero 2 incluye la flecha", () => {
    const audio = renderAudio(DIAGRAMAS[1]);
    expect(audio).toContain("Flecha de D4 a D1");
  });
});
