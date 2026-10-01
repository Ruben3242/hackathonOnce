"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { BoardGrid } from "./BoardGrid";
import { ChessIntel } from "./ChessIntel";
import { DictationPanel } from "./DictationPanel";
import { GeminiReviseToggle } from "./GeminiReviseToggle";
import { PrimaryActions } from "./PrimaryActions";
import { VoiceSettings } from "./VoiceSettings";
import { analyzeImage } from "./analyzeClient";
import { useSpeech } from "./useSpeech";

function focusResult() {
  requestAnimationFrame(() => {
    document.getElementById("salida")?.focus();
  });
}

export default function HomePage() {
  const [diagram, setDiagram] = useState<DiagramaCanonico | null>(null);
  const [focused, setFocused] = useState<Square>("e1");
  const [status, setStatus] = useState(
    "Empieza por un tablero de ejemplo o sube una imagen. Luego oye la transcripción.",
  );
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<{ from: Square; to: Square } | undefined>();
  const [revise, setRevise] = useState<"off" | "auto" | "always">("auto");
  const speech = useSpeech();
  const dictationAnchor = useRef<HTMLDivElement | null>(null);

  const braille = useMemo(() => (diagram ? renderBraille(diagram) : ""), [diagram]);
  const audio = useMemo(() => (diagram ? renderAudio(diagram) : ""), [diagram]);
  const full = useMemo(() => (diagram ? renderFullOutput(diagram) : ""), [diagram]);
  const counts = diagram ? countElements(diagram) : null;

  function announce(text: string) {
    setStatus(text);
  }

  const applyDictation = useCallback((result: DictationResult) => {
    if (!result.ok) {
      announce(result.error);
      return;
    }
    setDiagram((prev) => {
      if (!prev) return prev;
      return replacePiece(prev, result.square, result.piece);
    });
    setFocused(result.square);
    announce(result.spoken);
    requestAnimationFrame(() => document.getElementById(`sq-${result.square}`)?.focus());
  }, []);

  useEffect(() => {
    document.body.classList.toggle("has-diagram", Boolean(diagram));
  }, [diagram]);

  async function loadId(id: string) {
    const found = DIAGRAMAS.find((d) => d.id === id);
    if (!found) return;
    setDiagram(structuredClone(found));
    setCopied(false);
    announce(`Cargado ${found.title}. ${found.pieces.length} piezas. Pulsa «Oír transcripción».`);
    focusResult();
  }

  async function onUpload(file: File) {
    setBusy(true);
    announce("Analizando imagen…");
    const result = await analyzeImage(file, { revise });
    setBusy(false);
    if (!result.diagram) {
      announce(result.error ?? "No reconocí esa imagen.");
      return;
    }
    setDiagram(result.diagram);
    setCopied(false);
    announce(
      `Imagen analizada (${result.matched}${result.source === "gemini" ? ", revisión Gemini" : ""}). ${result.diagram.pieces.length} piezas. Pulsa «Oír transcripción».`,
    );
    focusResult();
  }

  async function copyOut() {
    if (!full) return;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    announce("Transcripción copiada. Pégala tal cual, sin editarla.");
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
    announce(`Casilla ${square}: ${cellAriaLabel(updated, square)}.`);
  }

  return (
    <main id="contenido-principal" className="mx-auto max-w-6xl px-4 py-8 pb-24">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#d4cbb8] pb-6">
        <div>
          <p className="text-sm font-semibold tracking-[0.14em] text-[#0066a1] uppercase">
            Reto ONCE · transcripción B8
          </p>
          <h1 className="display mt-1 text-4xl font-semibold tracking-tight text-[#1a1714] md:text-5xl">
            Del diagrama al braille
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#5c5348]">
            El programa no describe la foto. Reconoce el tablero y lo escribe como en el libro
            adaptado: braille Unicode, voz en español y un tablero que se recorre a ciegas. Puedes
            corregir una pieza escribiendo o hablando.
          </p>
        </div>
      </header>

      <ol className="mb-8 grid gap-3 text-sm md:grid-cols-3">
        {[
          { n: "1", t: "Elige el diagrama", d: "Ejemplo 1–6 o sube un archivo." },
          { n: "2", t: "Oye o lee", d: "Barra inferior: Oír y Copiar." },
          { n: "3", t: "Corrige si hace falta", d: "Escribe o habla: caballo negro en e4." },
        ].map((s) => (
          <li
            key={s.n}
            className="rounded-2xl border border-[#d4cbb8] bg-[var(--panel)] px-4 py-3 shadow-sm"
          >
            <span className="step-num">{s.n}</span>
            <strong>{s.t}</strong>
            <p className="mt-1 text-[#5c5348]">{s.d}</p>
          </li>
        ))}
      </ol>

      <section aria-labelledby="entrada" className="mb-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-[#d4cbb8] bg-[var(--panel)] p-5 shadow-sm">
          <h2 id="entrada" className="text-2xl">
            <span className="step-num">1</span>
            Sube un diagrama
          </h2>
          <p className="mt-2 text-sm text-[#5c5348]">
            PNG, JPEG o SVG. Los ejemplos ONCE se llaman <strong>tablero-1</strong> …
            <strong>tablero-6</strong>.
          </p>
          <label className="mt-4 block">
            <span className="text-sm font-semibold">Archivo de imagen</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#0066a1] file:px-4 file:py-2 file:font-semibold file:text-white"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onUpload(file);
              }}
            />
          </label>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-semibold">Opciones avanzadas</summary>
            <GeminiReviseToggle value={revise} onChange={setRevise} />
          </details>
          {busy ? (
            <p className="mt-2 text-sm text-[#0066a1]" aria-hidden="true">
              Analizando…
            </p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-[#d4cbb8] bg-[var(--panel)] p-5 shadow-sm">
          <h2 className="text-2xl">O un ejemplo del enunciado</h2>
          <p className="mt-2 text-sm text-[#5c5348]">
            Seis tableros del PDF. El 2 tiene flecha; el 4 es un final corto; el 5 tiene amarillo y
            rojo.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {DIAGRAMAS.map((d, i) => (
              <button
                key={d.id}
                type="button"
                className="min-h-12 rounded-xl border border-[#d4cbb8] bg-[#f4efe6] px-2 py-3 text-sm font-semibold hover:border-[#0066a1] hover:bg-white"
                onClick={() => void loadId(d.id)}
              >
                Tablero {i + 1}
              </button>
            ))}
          </div>
        </div>
      </section>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {status}
        {speech.status ? ` ${speech.status}` : ""}
      </p>
      <p
        className="mb-5 rounded-xl border border-[#d4cbb8] bg-white px-4 py-3 text-sm"
        aria-hidden="true"
      >
        <span className="font-semibold text-[#0066a1]">Estado: </span>
        {status}
      </p>

      <div ref={dictationAnchor} className="mb-5" id="corregir">
        <DictationPanel enabled={Boolean(diagram)} onParsed={applyDictation} onStatus={announce} />
      </div>

      <section
        id="resultado"
        aria-labelledby="salida"
        aria-busy={busy}
        className="grid gap-5 lg:grid-cols-[minmax(20rem,auto)_1fr]"
      >
        <div className="rounded-2xl border border-[#d4cbb8] bg-[var(--panel)] p-5 shadow-sm">
          <h2 id="salida" className="text-2xl" tabIndex={-1}>
            <span className="step-num">2</span>
            Tablero táctil
          </h2>
          <p className="mt-1 mb-4 text-sm text-[#5c5348]">
            Flechas para mover, Enter para ciclar pieza, o el panel «Corregir pieza» de arriba.
          </p>
          {diagram ? (
            <BoardGrid
              diagram={diagram}
              focused={focused}
              onFocus={setFocused}
              onCycle={cycleSquare}
              hint={hint}
            />
          ) : (
            <p className="rounded-xl bg-[#ebe4d6] px-4 py-8 text-center text-[#5c5348]">
              Todavía no hay posición. Pulsa Tablero 2 para oír un ejemplo con flecha.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-[#d4cbb8] bg-[var(--panel)] p-5 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl">
                <span className="step-num">3</span>
                Braille B8 y voz
              </h2>
              {counts ? (
                <span className="text-sm text-[#5c5348]">
                  {counts.pieces} piezas · {counts.highlights} resaltes · {counts.arrows} flechas
                </span>
              ) : null}
            </div>

            <VoiceSettings
              engine={speech.engine}
              setEngine={speech.setEngine}
              lang={speech.lang}
              setLang={speech.setLang}
              voiceURI={speech.voiceURI}
              setVoiceURI={speech.setVoiceURI}
              rate={speech.rate}
              setRate={speech.setRate}
              matching={speech.matching}
              others={speech.others}
              voices={speech.voices}
              geminiReady={speech.geminiReady}
              status={speech.status}
            />

            <pre
              className="braille-block mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-[#1a1714] p-4 text-lg leading-relaxed text-[#f4efe6]"
              aria-hidden="true"
            >
              {braille || "La transcripción braille aparecerá aquí."}
            </pre>
            {audio ? (
              <p className="sr-only">Texto equivalente para el lector de pantalla. {audio}</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[#d4cbb8] bg-[var(--panel)] p-5 shadow-sm">
            <h2 className="text-2xl">Lo que dice la voz</h2>
            <p className="mt-2 leading-relaxed text-[#1a1714]">{audio || "—"}</p>
          </div>
          {diagram ? <ChessIntel diagram={diagram} onHint={setHint} /> : null}
        </div>
      </section>

      <PrimaryActions
        hasDiagram={Boolean(diagram)}
        speaking={speech.speaking}
        copied={copied}
        onHear={() => {
          speech.speak(audio);
          announce("Leyendo la transcripción en voz alta.");
        }}
        onStop={() => {
          speech.stop();
          announce("Audio detenido.");
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
