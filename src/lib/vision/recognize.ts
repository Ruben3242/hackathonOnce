import { readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import type { Color, DiagramaCanonico, Highlight, PieceKind, PieceOnSquare, Square } from "@/lib/b8/types";
import { checkerboardScore, findBoardRect } from "./findBoard";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
/** Tablero normalizado: 8 casillas × tile → mismo pipeline que el train (PIL resize 16). */
const GRID = 128;

type LogregFile = {
  type?: string;
  tile: number;
  channels?: number;
  classes: string[];
  mean?: number[];
  scale?: number[];
  coef?: number[][];
  intercept?: number[];
  centroids?: number[][];
};

const FEN_TO_KIND: Record<string, { kind: PieceKind; color: Color }> = {
  P: { kind: "P", color: "white" },
  N: { kind: "C", color: "white" },
  B: { kind: "A", color: "white" },
  R: { kind: "T", color: "white" },
  Q: { kind: "D", color: "white" },
  K: { kind: "R", color: "white" },
  p: { kind: "P", color: "black" },
  n: { kind: "C", color: "black" },
  b: { kind: "A", color: "black" },
  r: { kind: "T", color: "black" },
  q: { kind: "D", color: "black" },
  k: { kind: "R", color: "black" },
};

function loadModel(): LogregFile {
  const p = join(process.cwd(), "models", "piece-centroids.json");
  return JSON.parse(readFileSync(p, "utf8")) as LogregFile;
}

function predictLogreg(vec: number[], model: LogregFile): string {
  const mean = model.mean!;
  const scale = model.scale!;
  const coef = model.coef!;
  const intercept = model.intercept!;
  const x = vec.map((v, j) => (v - mean[j]) / scale[j]);
  let best = 0;
  let bestZ = Number.NEGATIVE_INFINITY;
  for (let k = 0; k < coef.length; k++) {
    let z = intercept[k];
    const row = coef[k];
    for (let j = 0; j < x.length; j++) z += row[j] * x[j];
    if (z > bestZ) {
      bestZ = z;
      best = k;
    }
  }
  return model.classes[best]!;
}

function nearest(vec: number[], model: LogregFile): string {
  let best = 0;
  let bestD = Number.POSITIVE_INFINITY;
  const cents = model.centroids!;
  for (let i = 0; i < cents.length; i++) {
    const c = cents[i]!;
    let d = 0;
    for (let j = 0; j < vec.length; j++) {
      const t = vec[j]! - c[j]!;
      d += t * t;
    }
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return model.classes[best]!;
}

export function isPlausibleBoard(pieces: PieceOnSquare[]): boolean {
  const wk = pieces.filter((p) => p.kind === "R" && p.color === "white").length;
  const bk = pieces.filter((p) => p.kind === "R" && p.color === "black").length;
  return wk === 1 && bk === 1 && pieces.length >= 2 && pieces.length <= 32;
}

function boardQuality(pieces: PieceOnSquare[]): number {
  const wk = pieces.filter((p) => p.kind === "R" && p.color === "white").length;
  const bk = pieces.filter((p) => p.kind === "R" && p.color === "black").length;
  let score = 0;
  if (wk === 1) score += 50;
  else score -= Math.abs(wk - 1) * 25;
  if (bk === 1) score += 50;
  else score -= Math.abs(bk - 1) * 25;
  if (pieces.length >= 2 && pieces.length <= 32) score += 15;
  for (const kind of ["D", "R", "T", "A", "C", "P"] as PieceKind[]) {
    for (const color of ["white", "black"] as Color[]) {
      const n = pieces.filter((p) => p.kind === kind && p.color === color).length;
      const max = kind === "D" || kind === "R" ? 1 : kind === "P" ? 8 : 2;
      if (n > max) score -= (n - max) * 10;
    }
  }
  score += Math.min(pieces.length, 32);
  return score;
}

function clampCrop(
  left: number,
  top: number,
  size: number,
  width: number,
  height: number,
): { left: number; top: number; width: number; height: number } {
  let l = Math.max(0, Math.floor(left));
  let t = Math.max(0, Math.floor(top));
  let s = Math.floor(size);
  if (l + s > width) l = Math.max(0, width - s);
  if (t + s > height) t = Math.max(0, height - s);
  s = Math.min(s, width - l, height - t);
  return { left: l, top: t, width: Math.max(8, s), height: Math.max(8, s) };
}

/**
 * Misma geometría que train_piece_centroids.tile_vector:
 * tablero → gris 128×128 (8×16) → casilla 16×16 mean-centered → logreg.
 */
function classifyGrayGrid(gray: Buffer, model: LogregFile) {
  const tile = model.tile || 16;
  const side = tile * 8;
  const pieces: PieceOnSquare[] = [];
  const isLogreg = model.type === "logreg" && model.coef && model.mean && model.scale;

  for (let rankFromTop = 0; rankFromTop < 8; rankFromTop++) {
    for (let file = 0; file < 8; file++) {
      const rank = (8 - rankFromTop) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
      const square = `${FILES[file]}${rank}` as Square;
      const vec: number[] = [];
      let sum = 0;
      for (let py = 0; py < tile; py++) {
        const y = rankFromTop * tile + py;
        for (let px = 0; px < tile; px++) {
          const x = file * tile + px;
          const v = gray[y * side + x]! / 255;
          vec.push(v);
          sum += v;
        }
      }
      const mean = sum / vec.length;
      for (let i = 0; i < vec.length; i++) vec[i]! -= mean;

      const cls = isLogreg ? predictLogreg(vec, model) : nearest(vec, model);
      if (cls !== "empty") {
        const mapped = FEN_TO_KIND[cls];
        if (mapped) pieces.push({ square, kind: mapped.kind, color: mapped.color });
      }
    }
  }
  // Resaltes: no se estiman en local (falsos rojos en madera Kaggle). Fixtures / Gemini sí.
  return { pieces, highlights: [] as Highlight[] };
}

async function classifyCrop(
  source: Buffer,
  crop: { left: number; top: number; width: number; height: number },
  model: LogregFile,
) {
  const gray = await sharp(source)
    .extract(crop)
    .resize(GRID, GRID, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer();
  return classifyGrayGrid(gray, model);
}

export async function recognizeBoard(buffer: Buffer): Promise<DiagramaCanonico> {
  const model = loadModel();
  const rotated = await sharp(buffer).rotate().removeAlpha().toBuffer();
  const meta = await sharp(rotated).metadata();
  const origW = meta.width ?? 400;
  const origH = meta.height ?? 400;

  const preview = await sharp(rotated)
    .resize({ width: 360, height: 360, fit: "inside" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pw = preview.info.width;
  const ph = preview.info.height;
  const found = findBoardRect(preview.data, pw, ph);
  const scale = origW / pw;

  const minSide = Math.min(origW, origH);
  const fullSquare = clampCrop((origW - minSide) / 2, (origH - minSide) / 2, minSide, origW, origH);
  const foundCrop = clampCrop(found.left * scale, found.top * scale, found.size * scale, origW, origH);

  // Si la imagen ya es un tablero (formato Kaggle / SVG rasterizado), priorizar el marco completo.
  const fullPreviewScore = checkerboardScore(
    preview.data,
    pw,
    Math.floor((pw - Math.min(pw, ph)) / 2),
    Math.floor((ph - Math.min(pw, ph)) / 2),
    Math.min(pw, ph),
  );
  const preferFull = fullPreviewScore >= found.score * 0.92 || Math.max(origW, origH) / minSide <= 1.05;

  const candidates: Array<{ left: number; top: number; width: number; height: number }> = [];
  if (preferFull) candidates.push(fullSquare);
  candidates.push(foundCrop);
  if (!preferFull) candidates.push(fullSquare);
  const nearlySquare = Math.max(origW, origH) / minSide <= 1.12;
  if (nearlySquare) {
    candidates.push({ left: 0, top: 0, width: origW, height: origH });
  }

  let bestPieces: PieceOnSquare[] = [];
  let bestHighlights: Highlight[] = [];
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestTitle = "Diagrama reconocido (modelo local Kaggle)";

  // Formato Kaggle / diagrama digital: clasificar el marco completo primero y quedárselo
  // si es plausible (el findBoard a veces gana con un recorte peor).
  if (preferFull) {
    const full = await classifyCrop(rotated, fullSquare, model);
    if (isPlausibleBoard(full.pieces)) {
      return {
        id: "vision",
        title: "Diagrama reconocido (tablero completo, modelo Kaggle)",
        pieces: full.pieces,
        highlights: full.highlights,
        arrows: [],
      };
    }
    bestPieces = full.pieces;
    bestHighlights = full.highlights;
    bestScore = boardQuality(full.pieces) + 20;
  }

  const seen = new Set<string>(preferFull ? [`${fullSquare.left},${fullSquare.top},${fullSquare.width},${fullSquare.height}`] : []);
  for (const crop of candidates) {
    const key = `${crop.left},${crop.top},${crop.width},${crop.height}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const { pieces, highlights } = await classifyCrop(rotated, crop, model);
    const score = boardQuality(pieces);
    if (score > bestScore) {
      bestScore = score;
      bestPieces = pieces;
      bestHighlights = highlights;
      bestTitle = isPlausibleBoard(pieces)
        ? "Diagrama reconocido (tablero recortado, cualquier resolución)"
        : "Diagrama reconocido (recorte aproximado; revisa el tablero táctil)";
    }
  }

  return {
    id: "vision",
    title: bestTitle,
    pieces: bestPieces,
    highlights: bestHighlights,
    arrows: [],
  };
}
