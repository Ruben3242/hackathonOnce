# Transcriptor B8 · ONCE

Convierte un diagrama de ajedrez en **braille Unicode B8**, **audio en español** y un **tablero táctil** (teclado o lector de pantalla). No describe la foto: transcribe con el Documento técnico B8.

Si no puedes ejecutar Node, las pantallas están en [`docs/capturas/`](docs/capturas/README.md).

## Arranque (Windows)

1. Instala [Node.js 20+](https://nodejs.org).
2. Doble clic en **`arrancar.bat`**. La primera vez instala dependencias y abre el navegador.
3. http://localhost:3000

Si PowerShell bloquea `npm`, usa `npm.cmd` / `npx.cmd`. En macOS/Linux: `npm install` y `npm run dev`.

| URL | Pantalla |
|-----|----------|
| http://localhost:3000 | Escritorio |
| http://localhost:3000/movil | Cámara / foto / galería |
| http://localhost:3000/instalar | QR e IP para el teléfono |
| http://localhost:3000/ayuda | Manual |

### Demo

1. **Tablero 2** (ejemplo del enunciado: flecha y resaltes).
2. **Oír** · recorre el grid con flechas · **Enter** cambia una pieza.
3. **Copiar** la transcripción.

Para probar el **reconocedor de fotos** (no los botones 1–6): pulsa **Foto Kaggle 1–3** en la web, o sube un JPEG de [`public/pruebas/`](public/pruebas/). Son tableros digitales del mismo tipo con el que se entrenó el modelo; ahí el acierto es casi total.

`npm.cmd test` comprueba el encoder B8. Gemini es opcional (`.env.example`); **sin clave el programa funciona**.

## Cómo analiza las fotos (no se reentrena al arrancar)

El modelo **ya viene entrenado** en el repositorio: `models/piece-centroids.json`.

`arrancar.bat` **no entrena**. Solo instala dependencias de Node y arranca la web. No hace falta Python ni descargar el dataset.

Al subir una imagen que no sea `tablero-1`…`tablero-6`:

1. Localiza el tablero en la foto.
2. Clasifica las 64 casillas con esos pesos, **en el propio PC** (sin internet).
3. Genera braille, voz y tablero táctil.

Los botones **Tablero 1–6** no pasan por el modelo: cargan los ejemplos del enunciado ONCE.

El dataset completo (`data/`) no está en el repo: solo sirvió para entrenar una vez. Lo que se usa al clonar es el JSON de pesos + las tres fotos de `public/pruebas/`.

Fotos de libro (perspectiva, sombras, resaltes dibujados) son más difíciles; se pueden corregir a mano o por voz.

## Teléfono (misma Wi‑Fi)

1. Deja `arrancar.bat` en marcha.
2. En el PC: http://localhost:3000/instalar
3. En el móvil, escanea el QR o abre `http://IP-DEL-PC:3000/movil`

Si no carga: firewall de Windows (permitir Node). No uses IPs `192.168.56.x` (VirtualBox).
