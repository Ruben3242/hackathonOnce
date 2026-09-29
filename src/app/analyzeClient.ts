import type { DiagramaCanonico } from "@/lib/b8/types";

const MAX_SIDE = 1280;

export async function compressForAnalyze(file: File): Promise<File> {
  if (!file.type.startsWith("image/") && file.type !== "") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(8, Math.round(bitmap.width * scale));
    const h = Math.max(8, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.82);
    });
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function analyzeImage(
  file: File,
  opts?: { revise?: "off" | "auto" | "always" },
): Promise<{
  diagram?: DiagramaCanonico;
  matched?: string;
  error?: string;
  source?: string;
  gemini?: string;
}> {
  const prepared = await compressForAnalyze(file);
  const body = new FormData();
  body.append("file", prepared);
  body.append("revise", opts?.revise ?? "auto");
  const res = await fetch("/api/analyze", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as {
    diagram?: DiagramaCanonico;
    matched?: string;
    error?: string;
    source?: string;
    gemini?: string;
  };
  if (!res.ok || !data.diagram) {
    return {
      error:
        data.error ??
        "No reconocí esa imagen. Encaja el tablero en el recuadro o corrige piezas en la rejilla.",
    };
  }
  return data;
}
