import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DIAGRAMAS } from "../src/fixtures/once/diagramas";
import { countElements, renderFullOutput } from "../src/lib/b8/render";

const out = join(dirname(fileURLToPath(import.meta.url)), "../docs/hackathon/salidas-sprint2");
mkdirSync(out, { recursive: true });

for (const d of DIAGRAMAS) {
  const c = countElements(d);
  const body = renderFullOutput(d);
  writeFileSync(join(out, `${d.id}.txt`), `${body}\n`, "utf8");
  console.log("wrote", d.id, c);
}
