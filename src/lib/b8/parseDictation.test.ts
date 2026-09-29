import { describe, expect, it } from "vitest";
import { parseDictation } from "./parseDictation";

describe("parseDictation", () => {
  it("coloca pieza con color y casilla", () => {
    const r = parseDictation("caballo negro en e4");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.square).toBe("e4");
      expect(r.piece).toEqual({ kind: "C", color: "black" });
    }
  });

  it("acepta números hablados", () => {
    const r = parseDictation("torre blanca en a uno");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.square).toBe("a1");
      expect(r.piece).toEqual({ kind: "T", color: "white" });
    }
  });

  it("vacía una casilla", () => {
    const r = parseDictation("vaciar e4");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.square).toBe("e4");
      expect(r.piece).toBeNull();
    }
  });

  it("acepta casilla hablada ene cuatro", () => {
    const r = parseDictation("caballo negro ene cuatro");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.square).toBe("e4");
      expect(r.piece).toEqual({ kind: "C", color: "black" });
    }
  });

  it("falla sin casilla", () => {
    const r = parseDictation("caballo negro");
    expect(r.ok).toBe(false);
  });
});
