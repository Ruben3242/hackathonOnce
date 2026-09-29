import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Transcriptor B8 ONCE",
    short_name: "B8 ONCE",
    description: "Diagrama de ajedrez a braille B8, voz, cámara y jugadas.",
    start_url: "/movil",
    scope: "/",
    display: "standalone",
    background_color: "#f4efe6",
    theme_color: "#0066a1",
    lang: "es",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Escritorio",
        short_name: "PC",
        url: "/",
        description: "Vista de escritorio con ejemplos y voz",
      },
      {
        name: "Cámara móvil",
        short_name: "Cámara",
        url: "/movil",
        description: "Abrir la vista de cámara",
      },
    ],
  };
}
