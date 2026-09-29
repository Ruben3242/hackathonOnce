import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextResponse } from "next/server";

const NEURAL: Record<string, string> = {
  "es-ES": "es-ES-ElviraNeural",
  "es-MX": "es-MX-DaliaNeural",
  "es-AR": "es-AR-ElenaNeural",
  "ca-ES": "ca-ES-JoanaNeural",
  "en-GB": "en-GB-SoniaNeural",
  "en-US": "en-US-JennyNeural",
  "fr-FR": "fr-FR-DeniseNeural",
  "pt-BR": "pt-BR-FranciscaNeural",
  "it-IT": "it-IT-ElsaNeural",
};

const GEMINI_ALIAS: Record<string, string> = {
  Kore: "es-ES-ElviraNeural",
  Aoede: "es-MX-DaliaNeural",
  Charon: "en-GB-RyanNeural",
  Fenrir: "es-ES-AlvaroNeural",
  Puck: "en-US-JennyNeural",
  Zephyr: "ca-ES-JoanaNeural",
};

const TTS_MODELS = [
  process.env.GEMINI_TTS_MODEL?.trim(),
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-flash-preview-tts",
].filter((m, i, all): m is string => Boolean(m) && all.indexOf(m) === i);

function pcmToWav(pcm: Buffer, sampleRate = 24000): Buffer {
  const header = Buffer.alloc(44);
  const dataSize = pcm.length;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcm]);
}

function chunks(text: string, max = 1800): string[] {
  const parts: string[] = [];
  let rest = text.trim();
  while (rest.length > max) {
    let cut = rest.lastIndexOf(". ", max);
    if (cut < max / 3) cut = rest.lastIndexOf("\n", max);
    if (cut < max / 3) cut = max;
    parts.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

function toPcm(buf: Buffer): Buffer {
  if (buf.length > 44 && buf.toString("ascii", 0, 4) === "RIFF") return buf.subarray(44);
  return buf;
}

function pickNeuralVoice(lang: string, requested?: string): string {
  if (requested && Object.values(NEURAL).includes(requested)) return requested;
  if (requested && GEMINI_ALIAS[requested]) {
    if (lang.toLowerCase().startsWith("es")) return GEMINI_ALIAS[requested];
  }
  return NEURAL[lang] ?? NEURAL["es-ES"];
}

async function synthesizeGemini(model: string, key: string, text: string, voice: string, lang: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Lee en voz alta, con dicción clara y natural, exactamente este texto. Idioma: ${lang}.\n\n${text}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          languageCode: lang,
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice.startsWith("es-") || voice.includes("Neural") ? "Kore" : voice },
          },
        },
      },
    }),
  });
  const payload = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{
      content?: { parts?: Array<{ inlineData?: { data?: string } }> };
    }>;
  };
  if (!res.ok) throw new Error(payload.error?.message ?? `TTS ${res.status}`);
  const b64 = payload.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) throw new Error("Gemini no devolvió audio");
  return toPcm(Buffer.from(b64, "base64"));
}

function runPython(script: string, args: string[], stdin: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("python", [script, ...args], { windowsHide: true });
    let err = "";
    child.stderr.on("data", (d) => {
      err += String(d);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(err.trim() || `python ${code}`));
    });
    child.stdin.write(stdin, "utf8");
    child.stdin.end();
  });
}

async function synthesizeNeural(text: string, voice: string): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), "b8-tts-"));
  const out = join(dir, `${randomUUID()}.mp3`);
  try {
    const script = join(process.cwd(), "scripts", "speak_neural.py");
    await runPython(script, [voice, out], text);
    return await readFile(out);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    text?: string;
    lang?: string;
    voice?: string;
    engine?: "neural" | "gemini" | "system";
  };
  const text = body.text?.trim() ?? "";
  if (!text) return NextResponse.json({ error: "Falta el texto" }, { status: 400 });
  const lang = body.lang?.trim() || "es-ES";
  const neuralVoice = pickNeuralVoice(lang, body.voice?.trim());
  const key = process.env.GEMINI_API_KEY?.trim();
  const geminiOk = Boolean(key && key.startsWith("AIza"));
  const wantGemini = body.engine === "gemini" || (!body.engine && geminiOk);

  if (wantGemini && geminiOk && key) {
    const geminiVoice = body.voice && !body.voice.includes("Neural") ? body.voice : "Kore";
    for (const model of TTS_MODELS) {
      try {
        const pcms: Buffer[] = [];
        for (const part of chunks(text)) {
          pcms.push(await synthesizeGemini(model, key, part, geminiVoice, lang));
        }
        const wav = pcmToWav(Buffer.concat(pcms));
        return new NextResponse(new Uint8Array(wav), {
          headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" },
        });
      } catch {
        /* prueba el siguiente modelo o neural */
      }
    }
    if (body.engine === "gemini") {
      /* sin fallback silencioso a neural si el usuario pidió Gemini — se intenta neural abajo */
    }
  }

  try {
    const mp3 = await synthesizeNeural(text, neuralVoice);
    return new NextResponse(new Uint8Array(mp3), {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TTS no disponible";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
