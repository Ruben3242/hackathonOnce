import sharp from "sharp";
import type { Color, DiagramaCanonico, Highlight, PieceKind, PieceOnSquare, Square } from "@/lib/b8/types";

const FILES = "abcdefgh";
const KINDS = new Set<PieceKind>(["R", "D", "A", "C", "T", "P"]);
const FEN_KIND: Record<string, PieceKind> = {
  K: "R",
  Q: "D",
  B: "A",
  N: "C",
  R: "T",
  P: "P",
};

export type ReviseMode = "off" | "auto" | "always";

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    pieces: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          square: { type: "STRING" },
          kind: { type: "STRING" },
          color: { type: "STRING" },
        },
        required: ["square", "kind", "color"],
      },
    },
    highlights: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          square: { type: "STRING" },
          color: { type: "STRING" },
        },
        required: ["square", "color"],
      },
    },
    arrows: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          from: { type: "STRING" },
          to: { type: "STRING" },
        },
        required: ["from", "to"],
      },
    },
  },
  required: ["pieces"],
};

function isSquare(value: string): value is Square {
  return value.length === 2 && FILES.includes(value[0] ?? "") && "12345678".includes(value[1] ?? "");
}

function mapKind(raw: string): PieceKind | null {
  const t = raw.trim();
  if (KINDS.has(t as PieceKind)) return t as PieceKind;
  const fen = FEN_KIND[t.toUpperCase()];
  return fen ?? null;
}

function mapColor(raw: string, kindChar: string): Color | null {
  const t = raw.trim().toLowerCase();
  if (t === "white" || t === "blancas" || t === "blanco") return "white";
  if (t === "black" || t === "negras" || t === "negro") return "black";
  if (kindChar === kindChar.toUpperCase() && /[KQRBNP]/.test(kindChar)) return "white";
  if (kindChar === kindChar.toLowerCase() && /[kqrbnp]/.test(kindChar)) return "black";
  return null;
}

export function parseGeminiDiagram(raw: unknown): DiagramaCanonico | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as {
    pieces?: unknown[];
    highlights?: unknown[];
    arrows?: unknown[];
  };
  if (!Array.isArray(data.pieces)) return null;
  const pieces: PieceOnSquare[] = [];
  const seen = new Set<string>();
  for (const item of data.pieces) {
    if (!item || typeof item !== "object") continue;
    const row = item as { square?: unknown; kind?: unknown; color?: unknown };
    const square = String(row.square ?? "").toLowerCase();
    if (!isSquare(square) || seen.has(square)) continue;
    const kind = mapKind(String(row.kind ?? ""));
    const color = mapColor(String(row.color ?? ""), String(row.kind ?? ""));
    if (!kind || !color) continue;
    seen.add(square);
    pieces.push({ square, kind, color });
  }
  if (!pieces.length) return null;
  const highlights: Highlight[] = [];
  for (const item of data.highlights ?? []) {
    if (!item || typeof item !== "object") continue;
    const row = item as { square?: unknown; color?: unknown };
    const square = String(row.square ?? "").toLowerCase();
    const color = String(row.color ?? "").toLowerCase();
    if (!isSquare(square)) continue;
    if (color !== "yellow" && color !== "red") continue;
    highlights.push({ square, color });
  }
  const arrows: DiagramaCanonico["arrows"] = [];
  for (const item of data.arrows ?? []) {
    if (!item || typeof item !== "object") continue;
    const row = item as { from?: unknown; to?: unknown };
    const from = String(row.from ?? "").toLowerCase();
    const to = String(row.to ?? "").toLowerCase();
    if (isSquare(from) && isSquare(to) && from !== to) arrows.push({ from, to });
  }
  return {
    id: "vision-gemini",
    title: "Diagrama reconocido (revisión Gemini)",
    pieces,
    highlights,
    arrows,
  };
}

/** True only when a usable Google AI Studio key is present (AIza…). */
export function geminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim() ?? "";
  if (!key) return false;
  // Reject OAuth/app tokens (e.g. AQ.…) and short placeholders — they 401 and must not trigger revise.
  if (key.startsWith("AQ.")) return false;
  if (key.length < 20) return false;
  return true;
}

export async function reviseWithGemini(
  buffer: Buffer,
  local: DiagramaCanonico,
): Promise<DiagramaCanonico | null> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const jpeg = await sharp(buffer)
    .rotate()
    .resize({ width: 1024, height: 1024, fit: "inside" })
    .jpeg({ quality: 80 })
    .toBuffer();

  const prompt = `Eres un transcriptor de diagramas de ajedrez (libros ONCE / B8).
La imagen puede ser una foto de móvil, un libro o un tablero digital, no necesariamente estilo Chess.com.
Devuelve JSON con las piezas en notación ONCE:
- kind: R=rey, D=dama, A=alfil, C=caballo, T=torre, P=peón
- color: white o black
- square: a1…h8 (a1 es la esquina de las blancas, filas 1 abajo si el tablero no está girado; si el diagrama está visto desde blancas, fila 1 abajo)
También highlights yellow/red y arrows from/to si se ven.
No inventes piezas. Casillas vacías no se listan.
Borrador local (puede estar mal): ${JSON.stringify({ pieces: local.pieces, highlights: local.highlights, arrows: local.arrows })}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 28000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ac.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inline_data: { mime_type: "image/jpeg", data: jpeg.toString("base64") } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Gemini ${res.status}: ${errText.slice(0, 240)}`);
    }
    const payload = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return parseGeminiDiagram(JSON.parse(text));
  } finally {
    clearTimeout(timer);
  }
}
