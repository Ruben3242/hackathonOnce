import { NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { join } from "node:path";

function isPrivate(ip: string): boolean {
  return (
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

function score(ip: string, name: string): number {
  let n = 0;
  const low = name.toLowerCase();
  if (/wi-?fi|wlan|wifi|wireless|ethernet|eth|en0|lan/i.test(low)) n += 20;
  if (/virtualbox|vmware|hyper-v|vethernet|docker|wsl|loopback|bluetooth/i.test(low)) n -= 40;
  if (ip.startsWith("192.168.56.")) n -= 30;
  if (ip.startsWith("10.")) n += 5;
  if (ip.startsWith("192.168.") && !ip.startsWith("192.168.56.")) n += 8;
  return n;
}

export async function GET() {
  const nets = networkInterfaces();
  const candidates: Array<{ ip: string; name: string; score: number }> = [];
  for (const [name, list] of Object.entries(nets)) {
    for (const item of list ?? []) {
      if (item.family !== "IPv4" && (item.family as unknown) !== 4) continue;
      if (item.internal) continue;
      if (!isPrivate(item.address)) continue;
      candidates.push({ ip: item.address, name, score: score(item.address, name) });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  const port = process.env.PORT || "3000";
  const urls = candidates.map((c, i) => ({
    label: `${c.name} · ${c.ip}`,
    url: `http://${c.ip}:${port}/movil`,
    preferred: i === 0,
  }));

  const apk = existsSync(join(process.cwd(), "public", "apk", "transcriptor-b8.apk"));

  return NextResponse.json({
    urls,
    apk,
    hint:
      urls.length === 0
        ? "No hay IPv4 privada. Conéctate a Wi‑Fi o usa npm.cmd run phone:tunnel / phone:usb."
        : "Abre la URL recomendada en el móvil (misma Wi‑Fi).",
  });
}
