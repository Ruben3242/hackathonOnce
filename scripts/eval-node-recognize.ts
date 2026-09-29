import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { recognizeBoard } from "../src/lib/vision/recognize";

const FILES = "abcdefgh";

function collect(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) collect(p, acc);
    else if (/\.jpe?g$/i.test(e.name)) acc.push(p);
  }
  return acc;
}

function fenFromName(name: string): string {
  const stem = name.replace(/\.(jpe?g)$/i, "");
  return stem.replace(/-/g, "/").split(" ")[0]!;
}

function expand(fen: string): string[] {
  const out: string[] = [];
  for (const rank of fen.split("/")) {
    for (const ch of rank) {
      if (/\d/.test(ch)) out.push(...Array(Number(ch)).fill("empty"));
      else out.push(ch);
    }
  }
  return out;
}

function onceToFen(kind: string, color: string): string {
  const map: Record<string, string> = { P: "P", C: "N", A: "B", T: "R", D: "Q", R: "K" };
  const ch = map[kind] ?? "?";
  return color === "white" ? ch : ch.toLowerCase();
}

async function main() {
  const files = collect(join(process.cwd(), "data", "kaggle-chess-positions")).slice(0, 30);
  let ok = 0;
  let total = 0;
  let perfect = 0;
  for (const path of files) {
    const name = path.split(/[/\\]/).pop()!;
    const labels = expand(fenFromName(name));
    if (labels.length !== 64) {
      console.log("skip bad fen", name);
      continue;
    }
    const d = await recognizeBoard(readFileSync(path));
    let hits = 0;
    for (let sq = 0; sq < 64; sq++) {
      const file = sq % 8;
      const rankFromTop = Math.floor(sq / 8);
      const square = `${FILES[file]}${8 - rankFromTop}`;
      const piece = d.pieces.find((p) => p.square === square);
      const pred = piece ? onceToFen(piece.kind, piece.color) : "empty";
      if (pred === labels[sq]) hits += 1;
      total += 1;
    }
    ok += hits;
    if (hits === 64) perfect += 1;
    console.log(`${hits}/64 pieces=${d.pieces.length} ${name.slice(0, 48)}`);
  }
  console.log(`TOTAL ${ok}/${total} = ${((100 * ok) / total).toFixed(1)}% perfect ${perfect}/${files.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
