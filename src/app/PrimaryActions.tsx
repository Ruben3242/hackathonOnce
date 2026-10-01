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

/** Dock fijo inferior: acciones críticas sin tapar el contenido. */
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
    <div className="primary-actions" role="region" aria-label="Acciones principales">
      <div className="primary-actions__inner">
        <button
          type="button"
          className="primary-actions__main"
          onClick={onHear}
          disabled={!hasDiagram || speaking}
          accessKey="o"
          title="Atajo Alt+O"
        >
          {speaking ? "Leyendo…" : "Oír"}
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
            Corregir
          </button>
        ) : null}
      </div>
    </div>
  );
}
