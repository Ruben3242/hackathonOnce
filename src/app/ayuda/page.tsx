import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Manual de uso · Transcriptor B8",
};

export default function AyudaPage() {
  return (
    <main id="contenido-principal" className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-semibold tracking-[0.14em] text-[#0066a1] uppercase">
        Transcriptor B8
      </p>
      <h1 id="contenido" className="display mt-2 text-4xl font-semibold" tabIndex={-1}>
        Manual de uso
      </h1>
      <p className="mt-4 text-lg text-[#5c5348]">
        <Link className="font-semibold text-[#0066a1] underline" href="/">
          Volver a la herramienta
        </Link>
      </p>

      <section className="mt-8 space-y-4 leading-relaxed text-[#1a1714]">
        <h2 className="text-2xl">Qué es</h2>
        <p>
          Un transcriptor de diagramas de ajedrez al Documento técnico B8 de la ONCE. Recibe una
          imagen de un tablero y genera la misma información que vería quien lee tinta: piezas por
          casilla, resaltes amarillos o rojos, y flechas. No es un descriptor genérico de fotos.
        </p>

        <h2 className="text-2xl">Qué produce (tres canales, un tablero)</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Braille Unicode B8:</strong> listo para copiar a Ebrai o leer en línea braille.
            Peón sin letra; filas en números braille bajos (⠂ = 1 … ⠦ = 8).
          </li>
          <li>
            <strong>Audio:</strong> «Rey en E1, Torres en A1 y H1…», como las páginas 9–12 del
            enunciado. Oír usa la voz del navegador: no hace falta Python ni internet. Si no suena en
            español, en Ajustes de voz elige una voz es-ES, o en Windows añade el idioma Español. La
            voz neural es opcional y puede no estar disponible.
          </li>
          <li>
            <strong>Tablero táctil:</strong> grid 8×8. El lector anuncia casilla, pieza, resalte y
            flechas. Teclado: flechas y Enter. También puedes dictar la pieza.
          </li>
        </ul>

        <h2 className="text-2xl">Cómo usarlo, paso a paso</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Pulsa <strong>Tablero 1–6</strong> (ejemplos del PDF) o sube una imagen del tablero.
          </li>
          <li>
            La barra inferior fija tiene <strong>Oír</strong>, <strong>Copiar</strong> y{" "}
            <strong>Dictar pieza</strong>. Tras cargar un diagrama, el foco salta al resultado.
          </li>
          <li>
            Opcional: abre <strong>Ajustes de voz</strong> para motor, idioma, voz y velocidad.
          </li>
          <li>
            En el tablero: flechas para mover, Enter para ciclar la pieza, o dicta «caballo negro en
            e4» / «vaciar a2».
          </li>
          <li>
            <strong>Copiar</strong> y pega la transcripción tal cual (sin retocar a mano).
          </li>
        </ol>

        <h2 className="text-2xl">Atajos de teclado</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Tab: llegar al tablero y a los botones.</li>
          <li>Flechas: casilla a casilla. Inicio/Fin: extremos de la fila.</li>
          <li>Enter o espacio: ciclar pieza (vacía → peón blanco → … → rey negro).</li>
          <li>Alt+O oír · Alt+C copiar · Alt+D dictar (según navegador).</li>
        </ul>

        <h2 className="text-2xl">Dictado</h2>
        <p>
          En Chrome o Edge, «Dictar pieza» abre el micrófono. Di la pieza, el color y la casilla:
          «torre blanca en a1», «peón negro d7», «vaciar e4». El tablero, el braille y el audio se
          regeneran al instante.
        </p>

        <h2 className="text-2xl">Lector de pantalla</h2>
        <p>
          El bloque braille está oculto al lector para que no deletree los puntos Unicode. Oye el
          texto de audio. Cada celda tiene un nombre estable («e1, rey blanco»). Hay un enlace
          «Saltar al resultado» al inicio de cada página de trabajo.
        </p>

        <h2 className="text-2xl">Vista móvil y cámara</h2>
        <p>
          En <Link className="font-semibold text-[#0066a1] underline" href="/movil">/movil</Link>{" "}
          hay una vista aparte: vídeo en vivo (capturas un fotograma), foto del sistema o galería.
          Misma barra de acciones y mismas garantías de accesibilidad. Para fijarla en el teléfono
          usa{" "}
          <Link className="font-semibold text-[#0066a1] underline" href="/instalar">
            Instalar
          </Link>
          . En Android y en iPhone la vía que funciona es el navegador. El APK se descarga, pero no
          se abre, y no existe para iOS.
        </p>

        <h2 className="text-2xl">Jugadas y veracidad</h2>
        <p>
          Con un diagrama cargado, el panel «Jugadas y verificación» cuenta reyes, peones de más y
          fichas duplicadas, lista jugadas legales y propone la mejor continuación (motor local,
          2–3 plies). El anillo del tablero marca origen y destino; el lector anuncia la sugerencia.
        </p>

        <h2 className="text-2xl">Límites de esta versión</h2>
        <p>
          El reconocedor local ya viene entrenado (<code>models/piece-centroids.json</code>); al
          arrancar no se reentrena. Los botones Tablero 1–6 cargan los ejemplos del enunciado, no
          pasan por el modelo. El modelo se entrenó con 10 000 tableros sintéticos de 400×400 px y
          entre 5 y 15 piezas. En fotos de ese tipo acierta casi todas las casillas; Foto Kaggle 1
          y 2 salen enteras, la 3 falla una casilla. Una foto de libro, con otra resolución o con
          perspectiva, falla más: corrige a mano o por voz. Gemini es opcional y no hace falta clave.
          El APK se descarga, pero no se abre, y solo es para Android; en iPhone usa el navegador.
        </p>
      </section>
    </main>
  );
}
