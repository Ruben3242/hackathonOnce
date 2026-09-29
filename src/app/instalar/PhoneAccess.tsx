"use client";

import { useEffect, useMemo, useState } from "react";

type LanInfo = {
  urls: Array<{ label: string; url: string; preferred?: boolean }>;
  apk: boolean;
  hint: string;
};

function qrSrc(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(data)}`;
}

export function PhoneAccess({ initialApk }: { initialApk: boolean }) {
  const [info, setInfo] = useState<LanInfo | null>(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    void fetch("/api/phone-access")
      .then((r) => r.json())
      .then((d: LanInfo) => setInfo(d))
      .catch(() =>
        setInfo({
          urls: [],
          apk: initialApk,
          hint: "No pude detectar la IP. Mira en el PC con ipconfig la IPv4 Wi‑Fi.",
        }),
      );
  }, [initialApk]);

  const preferred = useMemo(
    () => info?.urls.find((u) => u.preferred) ?? info?.urls[0],
    [info],
  );

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(""), 2000);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#d4cbb8] bg-[var(--panel)] p-5">
        <h2 className="text-2xl">A. Abrir desde el móvil (misma Wi‑Fi)</h2>
        <p className="mt-2 text-sm text-[#5c5348]">
          En el PC deja corriendo <code>npm.cmd run dev</code>. En el móvil, misma red Wi‑Fi (no
          datos móviles). Abre la URL o escanea el QR.
        </p>
        {!info ? (
          <p className="mt-4 text-sm">Detectando IP de este PC…</p>
        ) : info.urls.length === 0 ? (
          <p className="mt-4 text-sm text-[#8a1f1f]">{info.hint}</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
            {preferred ? (
              <img
                alt={`QR ${preferred.url}`}
                className="rounded-xl border border-[#d4cbb8] bg-white p-2"
                height={220}
                src={qrSrc(preferred.url)}
                width={220}
              />
            ) : null}
            <ul className="space-y-3">
              {info.urls.map((u) => (
                <li key={u.url} className="rounded-xl bg-[#f4efe6] px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#5c5348]">
                    {u.label}
                    {u.preferred ? " · recomendada" : ""}
                  </p>
                  <a className="mt-1 block break-all font-semibold text-[#0066a1] underline" href={u.url}>
                    {u.url}
                  </a>
                  <button
                    type="button"
                    className="mt-2 rounded-full border border-[#0066a1] px-3 py-1 text-xs font-semibold text-[#0066a1]"
                    onClick={() => void copy(u.url)}
                  >
                    {copied === u.url ? "Copiada" : "Copiar"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-3 text-xs text-[#5c5348]">
          Usa la IP Wi‑Fi (suele ser 10.x o 192.168.x), no la de VirtualBox (192.168.56.x). Si no
          carga: firewall de Windows → permitir Node en red privada, o{" "}
          <code>npm.cmd run phone:firewall</code>.
        </p>
      </section>

      <section className="rounded-2xl border border-[#d4cbb8] bg-[var(--panel)] p-5">
        <h2 className="text-2xl">B. USB (sin Wi‑Fi)</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
          <li>Activa depuración USB en el móvil y conéctalo al PC.</li>
          <li>
            En el PC: <code>npm.cmd run phone:usb</code> (usa el adb del SDK; no hace falta Android
            Studio).
          </li>
          <li>
            En Chrome del móvil abre <code>http://localhost:3000/movil</code>.
          </li>
        </ol>
      </section>

      <section className="rounded-2xl border border-[#d4cbb8] bg-[var(--panel)] p-5">
        <h2 className="text-2xl">C. Enlace HTTPS público (cámara en vivo)</h2>
        <p className="mt-2 text-sm text-[#5c5348]">
          Chrome en HTTP por IP a menudo bloquea la cámara en vídeo. Un túnel da HTTPS y funciona
          desde cualquier red:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-[#1a1714] p-3 text-sm text-[#f4efe6]">
          npm.cmd run phone:tunnel
        </pre>
        <p className="mt-2 text-sm text-[#5c5348]">
          Copia la URL <code>https://….trycloudflare.com</code> al móvil y abre{" "}
          <code>/movil</code>. También sirve para PWA e instalar desde el menú de Chrome.
        </p>
      </section>

      <section className="rounded-2xl border border-[#d4cbb8] bg-[var(--panel)] p-5">
        <h2 className="text-2xl">D. APK (icono en el móvil)</h2>
        <p className="mt-2 text-sm text-[#5c5348]">
          WebView mínimo: abre la web. No hace falta Android Studio: se genera con{" "}
          <code>npm.cmd run apk</code> (SDK + Gradle por consola).
        </p>
        {(info?.apk ?? initialApk) ? (
          <p className="mt-4">
            <a
              className="inline-flex rounded-full bg-[#0066a1] px-5 py-3 font-semibold text-white"
              href="/apk/transcriptor-b8.apk"
            >
              Descargar transcriptor-b8.apk
            </a>
          </p>
        ) : (
          <p className="mt-4 text-sm text-[#8a1f1f]">
            Aún no hay APK en <code>public/apk/</code>. En el PC ejecuta{" "}
            <code>npm.cmd run apk</code> y recarga esta página.
          </p>
        )}
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
          <li>Descarga el APK desde esta misma página en el móvil (o pásalo por cable).</li>
          <li>Permite instalar apps de orígenes desconocidos para Chrome/Archivos.</li>
          <li>
            Al abrir, pega la URL de la sección A o C + <code>/movil</code> (ej.{" "}
            <code>http://10.168.4.156:3000/movil</code>).
          </li>
        </ol>
      </section>
    </div>
  );
}
