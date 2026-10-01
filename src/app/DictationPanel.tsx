"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { parseDictation, type DictationResult } from "@/lib/b8/parseDictation";

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
 * Primero pide permiso de audio; luego Web Speech API.
 */
export function DictationPanel({ enabled, onParsed, onStatus }: Props) {
  const inputId = useId();
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const [feedback, setFeedback] = useState("");
  const recRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastFinalRef = useRef("");
  const appliedRef = useRef(false);

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

  const startMic = useCallback(async () => {
    if (!enabled) {
      report("Primero carga un tablero (por ejemplo Tablero 1).");
      return;
    }
    if (listening) {
      stopMic();
      return;
    }

    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      report("Este navegador no tiene dictado por voz. Escribe la orden y pulsa Aplicar.");
      inputRef.current?.focus();
      return;
    }
    if (!window.isSecureContext && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
      report("El micrófono exige HTTPS o localhost. Escribe la orden en el campo.");
      inputRef.current?.focus();
      return;
    }

    // Pedir permiso y soltar el stream: si se deja abierto, Chrome bloquea SpeechRecognition.
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch {
      report("No hay permiso de micrófono. Actívalo en el candado de la barra de dirección, o escribe la orden.");
      inputRef.current?.focus();
      return;
    }

    appliedRef.current = false;
    lastFinalRef.current = "";

    const rec = new Ctor();
    rec.lang = "es-ES";
    // continuous + interim: da tiempo a terminar la frase
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    const finishOk = (candidate: string) => {
      if (appliedRef.current) return;
      appliedRef.current = true;
      applyText(candidate);
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    };

    rec.onresult = (ev: SpeechRecognitionEvent) => {
      let interim = "";
      let finalChunk = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const row = ev.results[i];
        const piece = row[0]?.transcript?.trim() ?? "";
        if (!piece) continue;
        if (row.isFinal) finalChunk += (finalChunk ? " " : "") + piece;
        else interim += (interim ? " " : "") + piece;
      }
      if (finalChunk) {
        lastFinalRef.current = `${lastFinalRef.current} ${finalChunk}`.trim();
        setText(lastFinalRef.current);
      } else if (interim) {
        setText(`${lastFinalRef.current} ${interim}`.trim());
      }

      if (finalChunk) {
        const candidate = lastFinalRef.current;
        const parsed = parseDictation(candidate);
        if (parsed.ok) finishOk(candidate);
      }
    };

    rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
      if (ev.error === "aborted") return;
      setListening(false);
      recRef.current = null;
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        report("Permiso de micrófono denegado. Escribe la orden y pulsa Aplicar.");
      } else if (ev.error === "no-speech") {
        report("No oí nada. Acércate al micrófono o escribe la orden.");
      } else if (ev.error === "network") {
        report("El dictado de Chrome necesita red. Comprueba internet o escribe la orden.");
      } else {
        report(`Micrófono: ${ev.error}. Puedes escribir la orden abajo.`);
      }
    };

    rec.onend = () => {
      if (!appliedRef.current && lastFinalRef.current) {
        setText(lastFinalRef.current);
        report(`Oí: «${lastFinalRef.current}». Pulsa Aplicar si es correcto, o Hablar de nuevo.`);
      }
      recRef.current = null;
      setListening(false);
    };

    recRef.current = rec;
    setListening(true);
    report("Escuchando… Di despacio: caballo negro en e4.");
    try {
      rec.start();
    } catch (err) {
      setListening(false);
      recRef.current = null;
      report(
        err instanceof Error
          ? `No pude iniciar el micrófono (${err.message}). Escribe la orden.`
          : "No pude iniciar el micrófono. Escribe la orden.",
      );
      inputRef.current?.focus();
    }
  }, [applyText, enabled, listening, report, stopMic]);

  return (
    <section
      className="rounded-2xl border-2 border-[#0066a1] bg-[var(--panel)] p-4 shadow-sm"
      aria-labelledby={inputId + "-title"}
    >
      <h2 id={inputId + "-title"} className="text-lg font-semibold text-[#0066a1]">
        Corregir pieza (texto o voz)
      </h2>
      <p className="mt-1 text-sm text-[#5c5348]">
        Ejemplo: <strong>caballo negro en e4</strong> · <strong>vaciar a2</strong>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor={inputId}>
          Orden de corrección
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          className="min-h-12 min-w-[12rem] flex-1 rounded-xl border-2 border-[#d4cbb8] bg-white px-3 py-2 text-base text-[#1a1714]"
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
              : "min-h-12 rounded-full border-2 border-[#0066a1] bg-white px-5 py-2 text-sm font-bold text-[#0066a1] disabled:opacity-40"
          }
          disabled={!enabled || !micOk}
          aria-pressed={listening}
          title={micOk ? "Dictar con el micrófono" : "Dictado por voz no disponible en este navegador"}
          onClick={() => void startMic()}
        >
          {listening ? "Parar" : "Hablar"}
        </button>
      </div>
      {feedback ? (
        <p className="mt-2 text-sm font-semibold text-[#1a1714]" aria-live="polite">
          {feedback}
        </p>
      ) : (
        <p className="mt-2 text-xs text-[#5c5348]">
          {micOk
            ? "Hablar pide permiso de micrófono (Chrome o Edge). Si no oye, el texto sigue funcionando."
            : "Este navegador no tiene dictado por voz: usa el campo y Aplicar."}
        </p>
      )}
    </section>
  );
}
