import { NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { DIAGRAMAS, getDiagrama } from "@/fixtures/once/diagramas";
import type { DiagramaCanonico } from "@/lib/b8/types";
import {
  geminiConfigured,
  reviseWithGemini,
  type ReviseMode,
} from "@/lib/vision/geminiRevise";
import { isPlausibleBoard, recognizeBoard } from "@/lib/vision/recognize";

function clone(d: DiagramaCanonico): DiagramaCanonico {
  return structuredClone(d);
}

function matchName(name: string): DiagramaCanonico | undefined {
  const lower = name.toLowerCase();
  const hit = lower.match(/tablero[-_ ]?([1-6])/);
  if (hit) return getDiagrama(`tablero-${hit[1]}`);
  for (const d of DIAGRAMAS) {
    if (lower.includes(d.id)) return d;
  }
  return undefined;
}

function parseRevise(raw: FormDataEntryValue | null): ReviseMode {
  const v = String(raw ?? "auto");
  if (v === "off" || v === "always" || v === "auto") return v;
  return "auto";
}

export async function GET() {
  return NextResponse.json({
    gemini: geminiConfigured(),
    forcedLocal: false,
    keyPresent: Boolean(process.env.GEMINI_API_KEY?.trim()),
    model: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
  });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }

  const revise = parseRevise(form.get("revise"));

  const named = matchName(file.name);
  if (named) {
    return NextResponse.json({
      matched: named.id,
      source: "fixture-once",
      gemini: "skipped",
      diagram: clone(named),
    });
  }

  const modelPath = join(process.cwd(), "models", "piece-centroids.json");
  if (!existsSync(modelPath)) {
    return NextResponse.json(
      {
        error:
          "No hay modelo entrenado. Ejecuta python scripts/download_kaggle_chess.py y python scripts/train_piece_centroids.py",
      },
      { status: 503 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let local: DiagramaCanonico;
  try {
    local = await recognizeBoard(buffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al reconocer";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const localOk = isPlausibleBoard(local.pieces);
  const wantGemini = geminiConfigured() && revise !== "off";

  if (wantGemini) {
    try {
      const revised = await reviseWithGemini(buffer, local);
      if (revised?.pieces.length) {
        return NextResponse.json({
          matched: "vision-gemini",
          source: "gemini",
          gemini: "applied",
          localOk,
          diagram: revised,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gemini falló";
      return NextResponse.json({
        matched: "vision-kaggle",
        source: "kaggle-local",
        gemini: message,
        localOk,
        diagram: local,
      });
    }
  }

  return NextResponse.json({
    matched: "vision-kaggle",
    source: "kaggle-local",
    gemini: wantGemini
      ? "no-result"
      : revise === "off"
        ? "skipped"
        : geminiConfigured()
          ? "skipped"
          : "no-key",
    localOk,
    diagram: local,
  });
}
