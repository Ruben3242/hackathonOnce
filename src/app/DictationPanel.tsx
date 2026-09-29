"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { parseDictation, type DictationResult } from "@/lib/b8/parseDictation";

type SpeechRec = SpeechRecognition;

function getRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type Props = {
  enabled: boolean;
  onParsed: (result: DictationResult) => void;
  onStatus?: (text: string) => void;
};

/**
 * Corrección por texto (siempre) + micrófono (Chrome/Edge).
 * El texto es el camino fiable; la voz rellena el mismo campo.
 */
export function DictationPanel({ enabled, onParsed, onStatus }: Props) {
  const inputId = useId();
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const [feedback, setFeedback] = useState("");
  const recRef = useRef<SpeechRec | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMicOk(Boolean(getRecognitionCtor()));
  }, []);

  const report = useCallback(
    (msg: string) => {
      setFeedback(msg);
      onStatus?.(msg);
    },
    [onStatus],
  );

  const applyText = useCallback(
    (raw: string) => {
      const parsed = parseDictation(raw);
      onParsed(parsed);
      report(parsed.ok ? parsed.spoken : parsed.error);
      if (parsed.ok) setText("");
      return parsed.ok;
    },
    [onParsed, report],
  );

  const stopMic = useCallback(() => {
    const rec = recRef.current;
    recRef.current = null;
    if (rec) {
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.stop();
      } catch {
        try {
          rec.abort();
        } catch {
          /* ignore */
        }
      }
    }
    setListening(false);
  }, []);

  useEffect(() => () => stopMic(), [stopMic]);

  const startMic = useCallback(() => {
    if (!enabled) {
      report("Primero carga un tablero (por ejemplo Tablero 1).");
      return;
    }
    stopMic();
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      report("Este navegador no tiene micrófono de dictado. Escribe la orden abajo y pulsa Aplicar.");
      inputRef.current?.focus();
      return;
    }
    if (typeof window !== "undefined" && !window.isSecureContext && location.hostname !== "localhost") {
      report("El micrófono exige HTTPS o localhost. Puedes escribir la orden en el campo.");
      inputRef.current?.focus();
      return;
    }

    const rec = new Ctor();
    rec.lang = "es-ES";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;

    rec.onresult = (ev: SpeechRecognitionEvent) => {
      let best = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const row = ev.results[i];
        if (!row) continue;
        const alt = row[0]?.transcript ?? "";
        if (row.isFinal) {
          best = alt;
          break;
        }
        if (!best) best = alt;
      }
      if (best) setText(best.trim());
      const finalRow = ev.results[ev.results.length - 1];
      if (finalRow?.isFinal) {
        const transcript = finalRow[0]?.transcript?.trim() ?? best.trim();
        if (transcript) applyText(transcript);
        stopMic();
      }
    };

    rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
      setListening(false);
      recRef.current = null;
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        report("Permiso de micrófono denegado. Escribe la orden en el campo y pulsa Aplicar.");
      } else if (ev.error === "no-speech") {
        report("No oí nada. Escribe p. ej. caballo negro en e4 y pulsa Aplicar.");
      } else if (ev.error !== "aborted") {
        report(`Micrófono: ${ev.error}. Puedes escribir la orden abajo.`);
      }
      inputRef.current?.focus();
    };

    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };

    recRef.current = rec;
    setListening(true);
    report("Escuchando… Di: caballo negro en e4. O escribe y pulsa Aplicar.");
    try {
      rec.start();
    } catch (err) {
      setListening(false);
      recRef.current = null;
      report(
        err instanceof Error
          ? `No pude iniciar el micrófono (${err.message}). Escribe la orden abajo.`
          : "No pude iniciar el micrófono. Escribe la orden abajo.",
      );
      inputRef.current?.focus();
    }
  }, [applyText, enabled, report, stopMic]);

  return (
    <section
      className="rounded-2xl border-2 border-[#0066a1] bg-[var(--panel)] p-4 shadow-sm"
      aria-labelledby={inputId + "-title"}
    >
      <h2 id={inputId + "-title"} className="text-lg font-semibold text-[#0066a1]">
        Corregir pieza (texto o voz)
      </h2>
      <p className="mt-1 text-sm text-[#5c5348]">
        Ejemplo: <strong>caballo negro en e4</strong> · <strong>vaciar a2</strong> ·{" "}
        <strong>torre blanca en a1</strong>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor={inputId}>
          Orden de corrección
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          className="min-h-12 min-w-[16rem] flex-1 rounded-xl border-2 border-[#d4cbb8] bg-white px-3 py-2 text-base text-[#1a1714]"
          placeholder="caballo negro en e4"
          value={text}
          disabled={!enabled}
          autoComplete="off"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (text.trim()) applyText(text);
            }
          }}
        />
        <button
          type="button"
          className="min-h-12 rounded-full bg-[#0066a1] px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
          disabled={!enabled || !text.trim()}
          onClick={() => applyText(text)}
        >
          Aplicar
        </button>
        <button
          type="button"
          className={
            listening
              ? "min-h-12 rounded-full bg-[#b45309] px-5 py-2 text-sm font-bold text-white"
              : "min-h-12 rounded-full border-2 border-[#0066a1] px-5 py-2 text-sm font-bold text-[#0066a1] disabled:opacity-40"
          }
          disabled={!enabled}
          aria-pressed={listening}
          onClick={() => {
            if (listening) stopMic();
            else startMic();
          }}
        >
          {listening ? "Parar micrófono" : micOk ? "Hablar" : "Hablar (no disponible)"}
        </button>
      </div>
      {feedback ? (
        <p className="mt-2 text-sm font-semibold text-[#1a1714]" aria-live="polite">
          {feedback}
        </p>
      ) : (
        <p className="mt-2 text-xs text-[#5c5348]">
          {micOk
            ? "Si el micrófono falla, escribe la misma orden y pulsa Aplicar."
            : "Tu navegador no expone dictado por voz: usa el campo de texto (Chrome/Edge sí suelen tener micrófono)."}
        </p>
      )}
    </section>
  );
}
