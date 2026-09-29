import { networkInterfaces } from "node:os";

function isLanIPv4(address: string): boolean {
  if (address.startsWith("127.") || address.startsWith("169.254.")) return false;
  // VirtualBox host-only: the phone never reaches this.
  if (address.startsWith("192.168.56.")) return false;
  return true;
}

export function lanIps(): string[] {
  const found: string[] = [];
  for (const addrs of Object.values(networkInterfaces())) {
    for (const a of addrs ?? []) {
      const family = String(a.family);
      if (family !== "IPv4" && family !== "4") continue;
      if (a.internal || !isLanIPv4(a.address)) continue;
      if (!found.includes(a.address)) found.push(a.address);
    }
  }
  return found.sort((a, b) => {
    const score = (ip: string) => (ip.startsWith("10.") ? 0 : ip.startsWith("192.168.") ? 1 : 2);
    return score(a) - score(b) || a.localeCompare(b);
  });
}

export function movilUrls(port = 3000): string[] {
  return lanIps().map((ip) => `http://${ip}:${port}/movil`);
}
