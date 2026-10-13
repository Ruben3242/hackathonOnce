/**
 * Regenera docs/capturas/*.png con el servidor en http://localhost:3000
 *
 * La barra Oír/Detener/Copiar/Corregir es position:fixed. fullPage la pinta
 * a media página; estas capturas usan el viewport (barra abajo del todo).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = process.env.CAPTURA_OUT || join(root, "docs", "capturas");
mkdirSync(out, { recursive: true });

const hideDevChrome = async (page) => {
  await page.addStyleTag({
    content: "nextjs-portal, [data-nextjs-toast], #__next-build-watcher { display: none !important; }",
  });
};

const shot = (page, name, fullPage) =>
  page.screenshot({ path: join(out, name), fullPage, timeout: 60_000 });

const browser = await chromium.launch({ args: ["--lang=es"] });
const page = await browser.newPage({
  viewport: { width: 1400, height: 700 },
  locale: "es-ES",
});

await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 60_000 });
await page.getByRole("heading", { name: "Del diagrama al braille" }).waitFor();
await hideDevChrome(page);
await shot(page, "01-escritorio.png", false);

await page.setViewportSize({ width: 1400, height: 920 });
await page.getByRole("button", { name: "Tablero 2", exact: true }).click();
await page.getByRole("grid").waitFor({ timeout: 45_000 });
await page.locator("#resultado").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await hideDevChrome(page);
await shot(page, "02-tablero-2.png", false);

await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:3000/movil", { waitUntil: "networkidle", timeout: 60_000 });
await page.getByRole("heading", { name: /Cámara al diagrama/ }).waitFor();
await page.evaluate(() => window.scrollTo(0, 0));
await hideDevChrome(page);
await shot(page, "03-movil.png", false);

await page.setViewportSize({ width: 1400, height: 900 });
await page.goto("http://localhost:3000/ayuda", { waitUntil: "networkidle", timeout: 60_000 });
await page.getByRole("heading", { name: "Manual de uso" }).waitFor();
await hideDevChrome(page);
await shot(page, "04-ayuda.png", true);

await page.goto("http://localhost:3000/instalar", { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.getByText(/RECOMENDADA/i).waitFor({ timeout: 20_000 });
const qr = page.locator('img[alt^="QR"]');
await qr.waitFor({ timeout: 15_000 });
await qr.evaluate((el) => el instanceof HTMLImageElement && el.decode());
await hideDevChrome(page);
await shot(page, "05-instalar.png", true);

await page.setViewportSize({ width: 1400, height: 1100 });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 60_000 });
await page.getByRole("button", { name: "Foto Kaggle 1", exact: true }).click();
await page.getByRole("grid").waitFor({ timeout: 45_000 });
await page.getByText(/Imagen analizada/).waitFor({ timeout: 45_000 });
await page.locator("#resultado").scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await hideDevChrome(page);
await shot(page, "06-kaggle-1.png", false);

await page.getByRole("button", { name: "Foto Kaggle 2", exact: true }).click();
await page.getByText(/Imagen analizada/).waitFor({ timeout: 45_000 });
await page.locator("#resultado").scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await hideDevChrome(page);
await shot(page, "07-kaggle-2.png", false);

await browser.close();
console.log("OK", out);
