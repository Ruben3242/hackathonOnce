"use client";

type Props = {
  hasDiagram: boolean;
  speaking: boolean;
  copied?: boolean;
  onHear: () => void;
  onStop: () => void;
  onCopy: () => void;
  onDictateFocus?: () => void;
};

/** Barra fija: acciones críticas para quien usa lector o teclado. */
export function PrimaryActions({
  hasDiagram,
  speaking,
  copied,
  onHear,
  onStop,
  onCopy,
  onDictateFocus,
}: Props) {
  return (
    <div
      className="primary-actions"
      role="region"
      aria-label="Acciones principales: oír, copiar y corregir"
    >
      <button
        type="button"
        className="primary-actions__main"
        onClick={onHear}
        disabled={!hasDiagram || speaking}
        accessKey="o"
        title="Atajo: Alt+O (según navegador)"
      >
        {speaking ? "Leyendo…" : "Oír transcripción"}
      </button>
      <button type="button" className="primary-actions__ghost" onClick={onStop} accessKey="x">
        Detener
      </button>
      <button
        type="button"
        className="primary-actions__ghost"
        onClick={onCopy}
        disabled={!hasDiagram}
        accessKey="c"
      >
        {copied ? "Copiada" : "Copiar"}
      </button>
      {onDictateFocus ? (
        <button
          type="button"
          className="primary-actions__ghost"
          onClick={onDictateFocus}
          disabled={!hasDiagram}
          accessKey="d"
        >
          Corregir pieza
        </button>
      ) : null}
    </div>
  );
}
