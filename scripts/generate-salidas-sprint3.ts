import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { recognizeBoard } from "../src/lib/vision/recognize";
import { countElements, renderBraille, renderAudio } from "../src/lib/b8/render";

function collect(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) collect(p, acc);
    else if (/\.jpe?g$/i.test(e.name)) acc.push(p);
  }
  return acc;
}

async function main() {
  const files = collect(join(process.cwd(), "data", "kaggle-chess-positions"));
  const picks = [120, 450, 1800].map((i) => files[i]).filter(Boolean);
  const outDir = join(process.cwd(), "docs", "hackathon", "salidas-sprint3");
  mkdirSync(outDir, { recursive: true });
  for (const [idx, path] of picks.entries()) {
    const d = await recognizeBoard(readFileSync(path!));
    const c = countElements(d);
    const name = path!.split(/[/\\]/).pop()!;
    const text = [
      `Diagrama: Caso nuevo ${idx + 1} · digital Kaggle (${name.slice(0, 40)})`,
      `Tipo: tablero digital 8x8 (fuera de los 6 ONCE del PDF).`,
      `Elementos: ${c.pieces} piezas, ${c.highlights} resaltes, ${c.arrows} flechas.`,
      "",
      renderBraille(d),
      "",
      "Audio:",
      renderAudio(d),
      "",
    ].join("\n");
    writeFileSync(join(outDir, `nuevo-${idx + 1}.txt`), text, "utf8");
    console.log("wrote nuevo-", idx + 1, c);
  }
}

main();
