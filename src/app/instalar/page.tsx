import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { PhoneAccess } from "./PhoneAccess";

export const metadata: Metadata = {
  title: "Instalar · Transcriptor B8",
};

export const dynamic = "force-dynamic";

export default function InstalarPage() {
  const hasApk = existsSync(join(process.cwd(), "public", "apk", "transcriptor-b8.apk"));
  return (
    <main id="contenido-principal" className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="display text-4xl font-semibold">Probar en el móvil</h1>
      <p className="mt-4 text-lg text-[#5c5348]">
        Sin Android Studio. En Android y en iPhone abre la URL en el navegador (Chrome o Safari).
        El APK se descarga, pero no llega a abrirse, y no existe para iOS. La app es
        la misma web (<Link className="font-semibold text-[#0066a1] underline" href="/movil">/movil</Link>
        ).
      </p>
      <div className="mt-8">
        <PhoneAccess initialApk={hasApk} />
      </div>
      <section className="mt-8 space-y-2 text-sm text-[#5c5348]">
        <h2 className="text-xl text-[#1a1714]">PWA (atajo en la pantalla de inicio)</h2>
        <p>
          Con la URL (sobre todo HTTPS del túnel), en Chrome → menú → «Añadir a pantalla de inicio»
          / Instalar app. El icono abre el transcriptor a pantalla completa.
        </p>
      </section>
    </main>
  );
}
