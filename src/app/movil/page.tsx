"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DIAGRAMAS } from "@/fixtures/once/diagramas";
import { PIECE_CYCLE } from "@/lib/b8/pieceCycle";
import type { DictationResult } from "@/lib/b8/parseDictation";
import {
  countElements,
  renderAudio,
  renderBraille,
  renderFullOutput,
  replacePiece,
} from "@/lib/b8/render";
import { cellAriaLabel, type DiagramaCanonico, type Square } from "@/lib/b8/types";
import { BoardGrid } from "../BoardGrid";
import { CameraCapture } from "../CameraCapture";
import { ChessIntel } from "../ChessIntel";
import { DictationPanel } from "../DictationPanel";
import { GeminiReviseToggle } from "../GeminiReviseToggle";
import { PrimaryActions } from "../PrimaryActions";
import { analyzeImage } from "../analyzeClient";
import { useSpeech } from "../useSpeech";

function focusResult() {
  requestAnimationFrame(() => {
    document.getElementById("salida")?.focus();
  });
}

export default function MovilPage() {
  const [diagram, setDiagram] = useState<DiagramaCanonico | null>(null);
  const [focused, setFocused] = useState<Square>("e1");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Elige vídeo o foto y apunta al tablero.");
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState<{ from: Square; to: Square } | undefined>();
  const [revise, setRevise] = useState<"off" | "auto" | "always">("auto");
  const speech = useSpeech();
  const dictationAnchor = useRef<HTMLDivElement | null>(null);
  const braille = useMemo(() => (diagram ? renderBraille(diagram) : ""), [diagram]);
  const audio = useMemo(() => (diagram ? renderAudio(diagram) : ""), [diagram]);
  const full = useMemo(() => (diagram ? renderFullOutput(diagram) : ""), [diagram]);
  const counts = diagram ? countElements(diagram) : null;

  const applyDictation = useCallback((result: DictationResult) => {
    if (!result.ok) {
      setStatus(result.error);
      return;
    }
    setDiagram((prev) => {
      if (!prev) return prev;
      return replacePiece(prev, result.square, result.piece);
    });
    setFocused(result.square);
    setStatus(result.spoken);
    requestAnimationFrame(() => document.getElementById(`sq-${result.square}`)?.focus());
  }, []);

  async function onCapture(file: File) {
    setBusy(true);
    setStatus("Analizando… reduciendo la foto y buscando el tablero.");
    const result = await analyzeImage(file, { revise });
    setBusy(false);
    if (!result.diagram) {
      setStatus(result.error ?? "No reconocí esa imagen.");
      return;
    }
    setDiagram(result.diagram);
    setCopied(false);
    setStatus(
      `Captura analizada (${result.matched}${result.source === "gemini" ? ", Gemini" : ""}). ${result.diagram.pieces.length} piezas. Puedes oír o corregir pieza.`,
    );
    focusResult();
  }

  function cycleSquare(square: Square) {
    if (!diagram) return;
    const current = diagram.pieces.find((p) => p.square === square);
    const idx = PIECE_CYCLE.findIndex((c) => {
      if (!c && !current) return true;
      return c?.kind === current?.kind && c?.color === current?.color;
    });
    const next = PIECE_CYCLE[(idx + 1) % PIECE_CYCLE.length];
    const updated = replacePiece(diagram, square, next);
    setDiagram(updated);
    setStatus(`Casilla ${square}: ${cellAriaLabel(updated, square)}.`);
  }

  async function copyOut() {
    if (!full) return;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setStatus("Transcripción copiada.");
  }

  return (
    <main id="contenido-principal" className="mx-auto max-w-lg px-3 py-4 pb-24">
      <p className="text-sm font-semibold tracking-[0.14em] text-[#0066a1] uppercase">
        Vista móvil
      </p>
      <h1 className="display mt-1 text-3xl font-semibold">Cámara al diagrama</h1>
      <p className="mt-2 text-sm text-[#5c5348]">
        Encaja el tablero en el recuadro. Luego oye, copia o corrige pieza.{" "}
        <Link className="font-semibold text-[#0066a1] underline" href="/instalar">
          Instalar PWA o APK
        </Link>
        .
      </p>

      <CameraCapture busy={busy} onCapture={(f) => void onCapture(f)} />
      <details className="mt-3 rounded-xl bg-white px-3 py-2">
        <summary className="cursor-pointer text-sm font-semibold">Opciones avanzadas</summary>
        <GeminiReviseToggle value={revise} onChange={setRevise} />
      </details>

      <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Ejemplos del enunciado">
        {DIAGRAMAS.map((d, i) => (
          <button
            key={d.id}
            type="button"
            className="min-h-11 rounded-xl border border-[#d4cbb8] bg-white px-2 py-2 text-sm font-semibold"
            onClick={() => {
              setDiagram(structuredClone(d));
              setCopied(false);
              setStatus(`Ejemplo ${d.title}. Pulsa Oír o corrige pieza.`);
              focusResult();
            }}
          >
            Ej. {i + 1}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {status}
        {speech.status ? ` ${speech.status}` : ""}
      </p>
      <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm" aria-hidden="true">
        {status}
      </p>

      <div ref={dictationAnchor} className="mt-4" id="corregir">
        <DictationPanel enabled={Boolean(diagram)} onParsed={applyDictation} onStatus={setStatus} />
      </div>

      {diagram ? (
        <div id="resultado" className="mt-4 space-y-4" aria-busy={busy}>
          <div className="overflow-x-auto rounded-2xl border border-[#d4cbb8] bg-[var(--panel)] p-3">
            <h2 id="salida" className="mb-2 text-lg font-semibold" tabIndex={-1}>
              Tablero táctil
            </h2>
            <BoardGrid
              diagram={diagram}
              focused={focused}
              onFocus={setFocused}
              onCycle={cycleSquare}
              hint={hint}
              size="sm"
            />
            {counts ? (
              <p className="mt-2 text-xs text-[#5c5348]">
                {counts.pieces} piezas · {counts.highlights} resaltes · {counts.arrows} flechas
              </p>
            ) : null}
          </div>
          <pre
            className="braille-block max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-[#1a1714] p-3 text-base text-[#f4efe6]"
            aria-hidden="true"
          >
            {braille}
          </pre>
          {audio ? (
            <p className="sr-only">Texto equivalente para el lector de pantalla. {audio}</p>
          ) : null}
          <ChessIntel diagram={diagram} compact onHint={setHint} />
        </div>
      ) : (
        <div id="resultado" className="sr-only">
          <h2 id="salida" tabIndex={-1}>
            Resultado
          </h2>
        </div>
      )}

      <PrimaryActions
        hasDiagram={Boolean(diagram)}
        speaking={speech.speaking}
        copied={copied}
        onHear={() => {
          speech.speak(audio);
          setStatus("Leyendo la transcripción.");
        }}
        onStop={() => {
          speech.stop();
          setStatus("Audio detenido.");
        }}
        onCopy={() => void copyOut()}
        onDictateFocus={() => {
          dictationAnchor.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          requestAnimationFrame(() => {
            document.getElementById("corregir")?.querySelector<HTMLInputElement>("input")?.focus();
          });
        }}
      />
    </main>
  );
}
