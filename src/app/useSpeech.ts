"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceChoice = {
  voiceURI: string;
  name: string;
  lang: string;
};

export type SpeechEngine = "neural" | "gemini" | "system";

export const GEMINI_VOICES = [
  { id: "Kore", label: "Kore · clara (recomendada)" },
  { id: "Aoede", label: "Aoede · cálida" },
  { id: "Charon", label: "Charon · grave" },
  { id: "Fenrir", label: "Fenrir · enérgica" },
  { id: "Puck", label: "Puck · ligera" },
  { id: "Zephyr", label: "Zephyr · suave" },
] as const;

export const NEURAL_VOICES = [
  { id: "es-ES-ElviraNeural", label: "Elvira · español (España)", lang: "es-ES" },
  { id: "es-ES-AlvaroNeural", label: "Álvaro · español (España)", lang: "es-ES" },
  { id: "es-MX-DaliaNeural", label: "Dalia · español (México)", lang: "es-MX" },
  { id: "es-AR-ElenaNeural", label: "Elena · español (Argentina)", lang: "es-AR" },
  { id: "ca-ES-JoanaNeural", label: "Joana · catalán", lang: "ca-ES" },
  { id: "en-GB-SoniaNeural", label: "Sonia · English (UK)", lang: "en-GB" },
  { id: "en-US-JennyNeural", label: "Jenny · English (US)", lang: "en-US" },
  { id: "fr-FR-DeniseNeural", label: "Denise · français", lang: "fr-FR" },
  { id: "pt-BR-FranciscaNeural", label: "Francisca · português", lang: "pt-BR" },
  { id: "it-IT-ElsaNeural", label: "Elsa · italiano", lang: "it-IT" },
] as const;

function scoreVoice(v: SpeechSynthesisVoice, preferredLang: string): number {
  const lang = v.lang.replace("_", "-").toLowerCase();
  const want = preferredLang.toLowerCase();
  const prefix = want.slice(0, 2);
  let n = 0;
  if (lang === want) n += 50;
  if (lang.startsWith(want)) n += 20;
  if (lang.startsWith(prefix)) n += 25;
  if (/neural|online|google/i.test(v.name)) n += 8;
  if (v.default) n += 2;
  return n;
}

function langMatches(voiceLang: string, preferred: string): boolean {
  return voiceLang.replace("_", "-").toLowerCase().startsWith(preferred.slice(0, 2).toLowerCase());
}

function bestSystemVoice(preferredLang: string, list?: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const voices = list ?? (typeof window !== "undefined" ? window.speechSynthesis.getVoices() : []);
  return [...voices].sort((a, b) => scoreVoice(b, preferredLang) - scoreVoice(a, preferredLang))[0];
}

export function defaultNeuralVoice(lang: string): string {
  return NEURAL_VOICES.find((v) => v.lang === lang)?.id ?? NEURAL_VOICES[0].id;
}

export function useSpeech() {
  const [voices, setVoices] = useState<VoiceChoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [lang, setLangState] = useState("es-ES");
  const [rate, setRate] = useState(0.95);
  const [engine, setEngineState] = useState<SpeechEngine>("system");
  const [geminiReady, setGeminiReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    void fetch("/api/analyze")
      .then((r) => r.json())
      .then((d: { gemini?: boolean }) => setGeminiReady(Boolean(d.gemini)))
      .catch(() => setGeminiReady(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const load = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(
        list.map((v) => ({
          voiceURI: v.voiceURI,
          name: v.name,
          lang: v.lang.replace("_", "-"),
        })),
      );
      if (engine !== "system") return;
      setVoiceURI((current) => {
        if (current && list.some((v) => v.voiceURI === current && langMatches(v.lang, lang))) {
          return current;
        }
        return bestSystemVoice(lang, list)?.voiceURI ?? current;
      });
    };

    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, [engine, lang]);

  const matching = voices.filter((v) => langMatches(v.lang, lang));
  const others = voices.filter((v) => !langMatches(v.lang, lang));

  const cleanupAudio = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (audioRef.current) {
      audioRef.current.onerror = null;
      audioRef.current.onended = null;
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speakSystem = useCallback(
    (text: string) => {
      if (typeof window === "undefined") return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = rate;
      const list = window.speechSynthesis.getVoices();
      const selected = list.find((v) => v.voiceURI === voiceURI && langMatches(v.lang, lang));
      utter.voice = selected ?? bestSystemVoice(lang, list) ?? null;
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utter);
    },
    [lang, rate, voiceURI],
  );

  const speakRemote = useCallback(
    async (text: string, chosenEngine: SpeechEngine) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setStatus("Generando voz…");
      setSpeaking(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ac.signal,
        body: JSON.stringify({ text, lang, voice: voiceURI, engine: chosenEngine }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `TTS ${res.status}`);
      }
      const blob = await res.blob();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audio.playbackRate = Math.min(1.25, Math.max(0.7, rate));
      audioRef.current = audio;
      audio.onended = () => {
        setSpeaking(false);
        setStatus("");
      };
      audio.onerror = () => {
        setSpeaking(false);
        setStatus("No se pudo reproducir el audio.");
      };
      setStatus("Reproduciendo…");
      await audio.play();
    },
    [lang, rate, voiceURI],
  );

  function speak(text: string) {
    if (!text || typeof window === "undefined") return;
    cleanupAudio();
    if (engine === "system") {
      speakSystem(text);
      return;
    }
    void speakRemote(text, engine).catch(() => {
      setStatus("Esa voz no está disponible. Uso la del navegador.");
      speakSystem(text);
    });
  }

  function stop() {
    cleanupAudio();
    setStatus("");
  }

  function setLang(next: string) {
    setLangState(next);
    if (engine === "neural") setVoiceURI(defaultNeuralVoice(next));
    if (engine === "system") {
      const match = bestSystemVoice(next)?.voiceURI;
      if (match) setVoiceURI(match);
    }
  }

  function setEngine(next: SpeechEngine) {
    setEngineState(next);
    if (next === "gemini") setVoiceURI(GEMINI_VOICES[0].id);
    else if (next === "neural") setVoiceURI(defaultNeuralVoice(lang));
    else setVoiceURI(bestSystemVoice(lang)?.voiceURI ?? "");
  }

  return {
    voices,
    matching,
    others,
    spanish: matching,
    voiceURI,
    setVoiceURI,
    lang,
    setLang,
    rate,
    setRate,
    engine,
    setEngine,
    geminiReady,
    speaking,
    status,
    speak,
    stop,
  };
}
