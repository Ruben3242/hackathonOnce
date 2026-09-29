"use client";

type ReviseMode = "off" | "auto" | "always";

type Props = {
  value: ReviseMode;
  onChange: (mode: ReviseMode) => void;
};

export function GeminiReviseToggle({ value, onChange }: Props) {
  return (
    <label className="mt-3 block text-sm">
      Revisión Gemini
      <select
        className="mt-1 w-full rounded-md border border-[#d4cbb8] bg-white px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value as ReviseMode)}
      >
        <option value="auto">Auto (Gemini si hay clave AIza…)</option>
        <option value="always">Siempre Gemini</option>
        <option value="off">Solo modelo local</option>
      </select>
      <span className="mt-1 block text-xs text-[#5c5348]">
        El local (Kaggle) falla en fotos de libro. Gemini necesita{" "}
        <code className="text-[0.85em]">GEMINI_API_KEY</code> de AI Studio (empieza por{" "}
        <code className="text-[0.85em]">AIza</code>, no <code className="text-[0.85em]">AQ.</code>).
      </span>
    </label>
  );
}
