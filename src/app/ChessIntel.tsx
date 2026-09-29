"use client";

import { useEffect, useMemo, useState } from "react";
import { analyzePosition } from "@/lib/chess/engine";
import type { Color, DiagramaCanonico, Square } from "@/lib/b8/types";

type Props = {
  diagram: DiagramaCanonico;
  compact?: boolean;
  onHint?: (hint: { from: Square; to: Square } | undefined) => void;
};

export function ChessIntel({ diagram, compact, onHint }: Props) {
  const [side, setSide] = useState<Color>("white");
  const intel = useMemo(() => analyzePosition(diagram, side), [diagram, side]);

  useEffect(() => {
    onHint?.(intel.best ? { from: intel.best.from, to: intel.best.to } : undefined);
    return () => onHint?.(undefined);
  }, [intel.best, onHint]);

  const liveSummary = [
    ...intel.alerts.filter((a) => a.level === "error" || a.level === "warn").map((a) => a.text),
    intel.best ? `Sugerencia de jugada: ${intel.best.san}. ${intel.best.text}` : "",
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <section
      aria-labelledby="intel-title"
      className="rounded-2xl border border-[#d4cbb8] bg-[var(--panel)] p-5 shadow-sm"
    >
      <p className="sr-only" aria-live="polite">
        {liveSummary}
      </p>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="intel-title" className="text-2xl">
          Jugadas y verificación
        </h2>
        <label className="text-sm font-semibold">
          Juegan
          <select
            className="ml-2 rounded-md border border-[#d4cbb8] bg-white px-2 py-1"
            value={side}
            onChange={(e) => setSide(e.target.value as Color)}
          >
            <option value="white">Blancas</option>
            <option value="black">Negras</option>
          </select>
        </label>
      </div>
      <p className="mt-2 text-sm text-[#5c5348]">
            Motor local (sin internet). Comprueba si el reconocimiento inventó fichas y propone la
            mejor continuación a 2–3 jugadas. El anillo ámbar/naranja del tablero marca esa jugada.
      </p>

      <ul className="mt-3 space-y-2">
        {intel.alerts.map((a) => (
          <li
            key={a.code + a.text}
            className={
              a.level === "error"
                ? "rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm"
                : a.level === "warn"
                  ? "rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm"
                  : "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm"
            }
          >
            {a.text}
          </li>
        ))}
      </ul>

      {!intel.legal ? (
        <p className="mt-3 text-sm font-semibold text-red-800">{intel.illegalReason}</p>
      ) : (
        <>
          <p className="mt-3 text-sm">
            {intel.checkmate
              ? "Estado: jaque mate."
              : intel.stalemate
                ? "Estado: ahogado (tablas)."
                : intel.inCheck
                  ? "Estado: jaque."
                  : "Estado: posición legal, no hay jaque."}{" "}
            {intel.moveCount} jugadas legales.
          </p>
          {intel.best ? (
            <p className="mt-2 rounded-xl bg-[#1a1714] px-3 py-3 text-sm text-[#f4efe6]">
              <strong>Mejor jugada:</strong> {intel.best.san} — {intel.best.text}
            </p>
          ) : null}
          {intel.precautions.length ? (
            <div className="mt-3">
              <h3 className="text-base font-semibold">Precauciones</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {intel.precautions.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {intel.strategies.length ? (
            <div className="mt-3">
              <h3 className="text-base font-semibold">Estrategia</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {intel.strategies.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {!compact ? (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold">
                Jugadas posibles (hasta 16)
              </summary>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                {intel.moves.map((m) => (
                  <li key={m.san + m.from + m.to}>
                    <span className="font-semibold">{m.san}</span> — {m.text}
                  </li>
                ))}
              </ol>
            </details>
          ) : (
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
              {intel.moves.slice(0, 8).map((m) => (
                <li key={m.san + m.from + m.to}>
                  <span className="font-semibold">{m.san}</span> — {m.text}
                </li>
              ))}
            </ol>
          )}
          <p className="mt-3 font-mono text-xs break-all text-[#5c5348]" title="FEN">
            {intel.fen}
          </p>
        </>
      )}
    </section>
  );
}
