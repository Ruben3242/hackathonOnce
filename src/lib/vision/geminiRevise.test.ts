import { describe, expect, it } from "vitest";
import { geminiConfigured, parseGeminiDiagram } from "./geminiRevise";

describe("parseGeminiDiagram", () => {
  it("acepta notación ONCE y descarta casillas inválidas", () => {
    const d = parseGeminiDiagram({
      pieces: [
        { square: "e1", kind: "R", color: "white" },
        { square: "e8", kind: "K", color: "black" },
        { square: "z9", kind: "P", color: "white" },
      ],
      highlights: [{ square: "g3", color: "yellow" }],
      arrows: [{ from: "d4", to: "d1" }],
    });
    expect(d?.pieces).toEqual([
      { square: "e1", kind: "R", color: "white" },
      { square: "e8", kind: "R", color: "black" },
    ]);
    expect(d?.highlights).toEqual([{ square: "g3", color: "yellow" }]);
    expect(d?.arrows).toEqual([{ from: "d4", to: "d1" }]);
  });
});

describe("geminiConfigured", () => {
  it("rechaza claves AQ. y vacías; acepta AIza…", () => {
    const prev = process.env.GEMINI_API_KEY;
    try {
      process.env.GEMINI_API_KEY = "";
      expect(geminiConfigured()).toBe(false);
      process.env.GEMINI_API_KEY = "AQ.token-de-prueba-no-valido";
      expect(geminiConfigured()).toBe(false);
      process.env.GEMINI_API_KEY = "AIzaSyDummyKeyForTests1234567890abcd";
      expect(geminiConfigured()).toBe(true);
    } finally {
      if (prev === undefined) delete process.env.GEMINI_API_KEY;
      else process.env.GEMINI_API_KEY = prev;
    }
  });
});
