import { describe, expect, it } from "vitest";
import { findBoardRect } from "./findBoard";

describe("findBoardRect", () => {
  it("encuentra un tablero 8×8 con margen alrededor", () => {
    const w = 96;
    const h = 96;
    const gray = new Uint8Array(w * h);
    gray.fill(190);
    for (let y = 16; y < 80; y++) {
      for (let x = 16; x < 80; x++) {
        const file = Math.floor((x - 16) / 8);
        const rank = Math.floor((y - 16) / 8);
        gray[y * w + x] = (file + rank) % 2 === 0 ? 230 : 30;
      }
    }
    const found = findBoardRect(gray, w, h);
    expect(found.size).toBeGreaterThanOrEqual(56);
    expect(found.size).toBeLessThanOrEqual(72);
    expect(found.left).toBeGreaterThanOrEqual(8);
    expect(found.left).toBeLessThanOrEqual(24);
    expect(found.top).toBeGreaterThanOrEqual(8);
    expect(found.top).toBeLessThanOrEqual(24);
  });
});
