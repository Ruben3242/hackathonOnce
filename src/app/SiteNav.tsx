"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Escritorio" },
  { href: "/movil", label: "Móvil" },
  { href: "/instalar", label: "Instalar" },
  { href: "/ayuda", label: "Manual" },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones" className="flex flex-wrap gap-2 text-sm font-semibold">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-full bg-[#0066a1] px-4 py-2 text-white"
                : "rounded-full border border-[#d4cbb8] bg-white px-4 py-2 text-[#1a1714]"
            }
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
