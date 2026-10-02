"use client";

import {
  GEMINI_VOICES,
  NEURAL_VOICES,
  type SpeechEngine,
  type VoiceChoice,
} from "./useSpeech";

const LANGS = [
  { id: "es-ES", label: "Español (España)" },
  { id: "es-MX", label: "Español (México)" },
  { id: "es-AR", label: "Español (Argentina)" },
  { id: "ca-ES", label: "Catalán" },
  { id: "en-GB", label: "English (UK)" },
  { id: "en-US", label: "English (US)" },
  { id: "fr-FR", label: "Français" },
  { id: "pt-BR", label: "Português (Brasil)" },
  { id: "it-IT", label: "Italiano" },
];

type Props = {
  engine: SpeechEngine;
  setEngine: (e: SpeechEngine) => void;
  lang: string;
  setLang: (l: string) => void;
  voiceURI: string;
  setVoiceURI: (v: string) => void;
  rate: number;
  setRate: (r: number) => void;
  matching: VoiceChoice[];
  others: VoiceChoice[];
  voices: VoiceChoice[];
  geminiReady: boolean;
  status: string;
};

const selectClass =
  "mt-1 w-full rounded-md border border-[#d4cbb8] bg-white px-3 py-2 text-sm text-[#1a1714]";

/** Selector de motor, idioma, voz y velocidad, oculto por defecto. */
export function VoiceSettings(props: Props) {
  return (
    <details className="mt-4 rounded-xl bg-[#f4efe6] p-3">
      <summary className="cursor-pointer text-sm font-semibold">Ajustes de voz (opcional)</summary>
      <fieldset className="mt-3 grid gap-3 md:grid-cols-2">
        <legend className="sr-only">Ajustes de voz</legend>
        <label className="text-sm">
          Motor
          <select
            className={selectClass}
            value={props.engine}
            onChange={(e) => props.setEngine(e.target.value as SpeechEngine)}
          >
            <option value="neural">Neural (clara, varios idiomas)</option>
            <option value="gemini" disabled={!props.geminiReady}>
              Gemini TTS{props.geminiReady ? "" : " (sin clave)"}
            </option>
            <option value="system">Voces del sistema</option>
          </select>
        </label>
        <label className="text-sm">
          Idioma
          <select
            className={selectClass}
            value={props.lang}
            onChange={(e) => props.setLang(e.target.value)}
          >
            {LANGS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm md:col-span-2">
          Voz
          <select
            className={selectClass}
            value={props.voiceURI}
            onChange={(e) => props.setVoiceURI(e.target.value)}
          >
            {props.engine === "neural" ? (
              NEURAL_VOICES.filter((v) => v.lang.slice(0, 2) === props.lang.slice(0, 2)).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))
            ) : props.engine === "gemini" ? (
              GEMINI_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))
            ) : (
              <>
                {props.matching.length ? (
                  <optgroup label="Coinciden con el idioma">
                    {props.matching.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                {props.others.length ? (
                  <optgroup label="Otras voces del sistema">
                    {props.others.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                {!props.voices.length ? <option value="">Cargando voces…</option> : null}
              </>
            )}
          </select>
        </label>
        <label className="text-sm md:col-span-2">
          Velocidad: {props.rate.toFixed(2)}
          <input
            type="range"
            min={0.7}
            max={1.15}
            step={0.01}
            value={props.rate}
            onChange={(e) => props.setRate(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
        {props.status ? (
          <p className="text-xs text-[#0066a1] md:col-span-2" aria-live="polite">
            {props.status}
          </p>
        ) : null}
      </fieldset>
    </details>
  );
}
