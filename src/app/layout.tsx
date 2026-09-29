import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { PwaRegister } from "./PwaRegister";
import { SiteNav } from "./SiteNav";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Transcriptor B8 · ONCE",
  description:
    "Convierte un diagrama de ajedrez en braille Unicode B8, audio, tablero táctil y jugadas posibles.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "B8 ONCE",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0066a1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${sans.variable}`}>
        <a href="#contenido-principal" className="skip-link">
          Saltar al contenido
        </a>
        <PwaRegister />
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-4">
          <p className="text-sm font-semibold text-[#0066a1]">
            <a href="/" className="no-underline hover:underline">
              Transcriptor B8
            </a>
          </p>
          <SiteNav />
        </header>
        {children}
      </body>
    </html>
  );
}
