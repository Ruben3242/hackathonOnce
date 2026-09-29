import type { Color, PieceKind, Square } from "./types";

export type DictationResult =
  | { ok: true; square: Square; piece: { kind: PieceKind; color: Color } | null; spoken: string }
  | { ok: false; error: string };

const KIND_PATTERNS: Array<{ re: RegExp; kind: PieceKind }> = [
  { re: /\b(rey|reyes)\b/i, kind: "R" },
  { re: /\b(dama|damas|reina|reinas)\b/i, kind: "D" },
  { re: /\b(torre|torres)\b/i, kind: "T" },
  { re: /\b(alfil|alfiles)\b/i, kind: "A" },
  { re: /\b(caballo|caballos)\b/i, kind: "C" },
  { re: /\b(pe[oó]n|peones)\b/i, kind: "P" },
];

function normalize(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSquareToken(text: string): Square | null {
  const spokenNum: Record<string, string> = {
    uno: "1",
    dos: "2",
    tres: "3",
    cuatro: "4",
    cinco: "5",
    seis: "6",
    siete: "7",
    ocho: "8",
  };
  // ASR a veces: «ene cuatro», «be cinco»
  const spokenFile: Record<string, string> = {
    a: "a",
    be: "b",
    ve: "b",
    ce: "c",
    de: "d",
    e: "e",
    ene: "e",
    efe: "f",
    ge: "g",
    hache: "h",
    ache: "h",
  };

  const m =
    text.match(/(?:^|[\s])([a-h])\s*([1-8])(?:\s|$)/i) ??
    text.match(/([a-h])([1-8])\s*$/i);
  if (m) return `${m[1].toLowerCase()}${m[2]}` as Square;

  const m2 = text.match(/\b([a-h])\s+(uno|dos|tres|cuatro|cinco|seis|siete|ocho)\b/);
  if (m2) return `${m2[1]}${spokenNum[m2[2]]}` as Square;

  const m3 = text.match(
    /\b(a|be|ve|ce|de|e|ene|efe|ge|hache|ache)\s+(uno|dos|tres|cuatro|cinco|seis|siete|ocho|[1-8])\b/,
  );
  if (m3) {
    const file = spokenFile[m3[1]];
    const rank = spokenNum[m3[2]] ?? m3[2];
    if (file && rank) return `${file}${rank}` as Square;
  }
  return null;
}

function parseColor(text: string): Color | null {
  if (/\b(blanc[oa]s?|blanco|blanca)\b/.test(text)) return "white";
  if (/\b(negr[oa]s?|negro|negra)\b/.test(text)) return "black";
  return null;
}

function parseKind(text: string): PieceKind | null {
  for (const { re, kind } of KIND_PATTERNS) {
    if (re.test(text)) return kind;
  }
  return null;
}

/**
 * Interpreta órdenes en español: «caballo negro en e4», «vaciar a2», «peón blanco d2».
 */
export function parseDictation(raw: string): DictationResult {
  const text = normalize(raw);
  if (!text) return { ok: false, error: "No oí ninguna orden." };

  const square = parseSquareToken(text);
  if (!square) {
    return {
      ok: false,
      error: "Di la casilla, por ejemplo: caballo negro en e4, o vaciar a2.",
    };
  }

  if (/\b(vaci[ae]r?|borrar|quitar|limpia[rt]?|vacia)\b/.test(text)) {
    return { ok: true, square, piece: null, spoken: `Casilla ${square} vacía.` };
  }

  const kind = parseKind(text);
  const color = parseColor(text);
  if (!kind || !color) {
    return {
      ok: false,
      error: `Oí la casilla ${square}, pero falta pieza y color. Ejemplo: torre blanca en a1.`,
    };
  }

  const colorWord = color === "white" ? "blanco" : "negro";
  const names: Record<PieceKind, string> = {
    R: "Rey",
    D: "Dama",
    T: "Torre",
    A: "Alfil",
    C: "Caballo",
    P: "Peón",
  };
  return {
    ok: true,
    square,
    piece: { kind, color },
    spoken: `${names[kind]} ${colorWord} en ${square}.`,
  };
}
