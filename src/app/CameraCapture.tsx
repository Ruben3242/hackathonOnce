"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "video" | "photo";

type Props = {
  busy: boolean;
  onCapture: (file: File) => void;
};

async function openCamera(): Promise<MediaStream> {
  const attempts: MediaStreamConstraints[] = [
    { audio: false, video: { facingMode: { exact: "environment" }, width: { ideal: 1280 }, height: { ideal: 1280 } } },
    { audio: false, video: { facingMode: "environment" } },
    { audio: false, video: { facingMode: "user" } },
    { audio: false, video: true },
  ];
  let last: unknown;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      last = err;
    }
  }
  throw last instanceof Error ? last : new Error("Sin cámara");
}

function squareFromVideo(video: HTMLVideoElement): File | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;
  const side = Math.min(vw, vh);
  const sx = (vw - side) / 2;
  const sy = (vh - side) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, sx, sy, side, side, 0, 0, 1024, 1024);
  const url = canvas.toDataURL("image/jpeg", 0.85);
  const bytes = atob(url.split(",")[1] ?? "");
  const buf = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  return new File([buf], "captura-camara.jpg", { type: "image/jpeg" });
}

export function CameraCapture({ busy, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>("photo");
  const [camError, setCamError] = useState("");
  const [ready, setReady] = useState(false);
  const [insecure, setInsecure] = useState(false);

  useEffect(() => {
    setMounted(true);
    setInsecure(typeof window !== "undefined" && !window.isSecureContext);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (mode !== "video" || !mounted) {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setReady(false);
        return;
      }
      setCamError("");
      setReady(false);
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamError("Este navegador no ofrece cámara en vivo. Usa Foto.");
        return;
      }
      try {
        const stream = await openCamera();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.setAttribute("playsinline", "true");
        video.setAttribute("webkit-playsinline", "true");
        video.muted = true;
        video.srcObject = stream;
        const markReady = () => {
          void video.play().catch(() => undefined);
          setReady(true);
        };
        if (video.readyState >= 2) markReady();
        else video.onloadedmetadata = markReady;
      } catch {
        const httpHint = !window.isSecureContext
          ? " En http://IP Chrome bloquea el vídeo en vivo; Foto sí suele funcionar. PWA o HTTPS lo habilitan."
          : " Concede permiso de cámara o usa Foto.";
        setCamError(`No pude abrir la cámara en vivo.${httpHint}`);
        setReady(false);
      }
    }
    void start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [mode, mounted]);

  function snapFrame() {
    const video = videoRef.current;
    if (!video) return;
    const file = squareFromVideo(video);
    if (file) onCapture(file);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Modo de captura">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "video"}
          className={
            mode === "video"
              ? "rounded-full bg-[#0066a1] px-4 py-2 text-sm font-semibold text-white"
              : "rounded-full border border-[#d4cbb8] px-4 py-2 text-sm font-semibold"
          }
          onClick={() => setMode("video")}
        >
          Vídeo (en vivo)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "photo"}
          className={
            mode === "photo"
              ? "rounded-full bg-[#0066a1] px-4 py-2 text-sm font-semibold text-white"
              : "rounded-full border border-[#d4cbb8] px-4 py-2 text-sm font-semibold"
          }
          onClick={() => setMode("photo")}
        >
          Foto
        </button>
        <button
          type="button"
          className="rounded-full border border-[#d4cbb8] px-4 py-2 text-sm font-semibold"
          onClick={() => galleryRef.current?.click()}
        >
          Galería
        </button>
      </div>

      {insecure && mode === "video" ? (
        <p className="mt-2 text-sm text-[#b45309]">
          Estás en HTTP (la IP del PC). El móvil bloquea la cámara en vivo y el micrófono en esa dirección.
          Foto y Galería sí sirven. Para el vídeo en vivo, en el PC ejecuta npm.cmd run phone:tunnel y abre
          la URL https que salga.
        </p>
      ) : null}

      {mode === "video" ? (
        <div className="relative mt-3 overflow-hidden rounded-2xl bg-black">
          <video
            ref={videoRef}
            className="aspect-square w-full object-cover"
            playsInline
            muted
            autoPlay
            aria-label="Vista previa de la cámara"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[86%] w-[86%] rounded-md border-4 border-white shadow-[0_0_0_999px_rgba(0,0,0,0.4)]" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1 bg-[#1a1714] p-3">
            <p className="text-center text-xs text-white/80">Encaja el tablero en el recuadro</p>
            <button
              type="button"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1a1714] disabled:opacity-40"
              onClick={snapFrame}
              disabled={!ready || busy}
            >
              {busy ? "Analizando…" : ready ? "Capturar recuadro" : "Abriendo cámara…"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed border-[#d4cbb8] bg-white p-6 text-center">
          <p className="text-sm text-[#5c5348]">
            Dispara con la cámara del sistema. No hace falta una resolución concreta: recortamos el
            tablero aunque no llene la foto. Intenta que se vea entero y lo más de frente posible.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full bg-[#0066a1] px-5 py-3 text-sm font-semibold text-white"
            onClick={() => photoRef.current?.click()}
            disabled={busy}
          >
            {busy ? "Analizando…" : "Abrir cámara"}
          </button>
        </div>
      )}

      {camError ? <p className="mt-2 text-sm text-[#b45309]">{camError}</p> : null}

      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onCapture(file);
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onCapture(file);
        }}
      />
    </div>
  );
}
