# Transcriptor B8 · ONCE

Convierte un diagrama de ajedrez en **braille Unicode B8**, **audio en español** y un **tablero táctil** (teclado o lector de pantalla). No describe la foto: transcribe con el Documento técnico B8.

Si no puedes ejecutar Node, mira las pantallas en [`docs/capturas/`](docs/capturas/README.md).

## Arranque en el PC (Windows)

1. Instala [Node.js 20 o superior](https://nodejs.org) (marca la opción de añadir Node al PATH).
2. Doble clic en **`arrancar.bat`**. La primera vez instala dependencias (unos minutos) y abre el navegador.
3. Si PowerShell bloquea `npm`, el `.bat` ya usa `npm.cmd`. En una terminal: `npm.cmd install` y `npm.cmd run dev`.

| URL | Qué es |
|-----|--------|
| http://localhost:3000 | Escritorio: ejemplos, subida, B8, voz, tablero, jugadas |
| http://localhost:3000/movil | Cámara, foto o galería |
| http://localhost:3000/instalar | IP local, QR, USB, túnel, APK, PWA |
| http://localhost:3000/ayuda | Manual de uso |

Para parar el servidor: cierra la ventana negra o `Ctrl+C`.

**macOS / Linux:** `npm install` y `npm run dev` (el servidor escucha en `0.0.0.0:3000`).

### Demo rápida

1. Pulsa **Tablero 2** (flecha y resaltes).
2. **Oír** · recorre el grid con flechas · **Enter** cambia una pieza.
3. **Copiar** la transcripción (salida del programa).
4. Opcional: escribe `caballo negro en a3` en Corregir pieza; panel de jugadas (blancas/negras).

`npm.cmd test` comprueba el encoder B8. **Sin clave de Gemini el programa funciona** (ejemplos 1–6 y modelo local). Opcional: Python 3 + `edge-tts` (voz neural) o `.env.local` con `GEMINI_API_KEY` (plantilla: `.env.example`, sin clave).

## Abrir en el móvil (misma Wi‑Fi)

El móvil y el PC tienen que estar en la **misma red Wi‑Fi** (no uses datos móviles).

1. Deja el servidor arrancado en el PC (`arrancar.bat`).
2. En el PC abre http://localhost:3000/instalar
3. En el teléfono escanea el **QR** o escribe la URL que pone **RECOMENDADA**, normalmente:

   `http://IP-DEL-PC:3000/movil`

   Ejemplo: `http://192.168.1.20:3000/movil`

Si no ves la IP en esa página, en el PC abre `cmd` y ejecuta `ipconfig`. Busca **IPv4** de Wi‑Fi o Ethernet (`192.168.x.x` o `10.x.x.x`). **No** uses IPs de VirtualBox (`192.168.56.x`).

Si el móvil no carga: firewall de Windows → permitir Node, o `npm.cmd run phone:firewall` como administrador.

Otras vías (las detalla `/instalar`):

- USB: `npm.cmd run phone:usb` → en Chrome del móvil `http://localhost:3000/movil`
- Cámara en vivo (a veces exige HTTPS): `npm.cmd run phone:tunnel`
- PWA: en Chrome del móvil, menú → Añadir a pantalla de inicio

## Qué quitar antes de copiar la carpeta (USB, Drive, correo)

En este PC hay un **`.env.local` con credenciales**. No lo copies. Si entregas un ZIP, usa **`empaquetar-entrega.bat`** (doble clic): crea `transcriptor-b8-entrega.zip` sin secretos ni carpetas pesadas.

Si copias la carpeta a mano, **borra o no copies**:

| Quitar | Por qué |
|--------|---------|
| `.env.local` y `.env` | Clave de Gemini u otras credenciales |
| `.cursor/` | Ajustes locales del editor |
| `node_modules/` | Se reinstala con `npm install` (cientos de MB) |
| `.next/` | Caché de compilación |
| `data/` | Dataset Kaggle (gigabytes; no hace falta para la demo) |
| `.venv/` | Entorno Python local |
| `.git/` | Historial local (opcional quitarlo del USB) |
| `android-webview/.gradle`, `android-webview/**/build` | Compilación Android |
| `android-webview/local.properties` | Ruta del SDK en tu PC |
| `public/apk/*.apk` | Binario grande; se regenera con `npm run apk` |
| `*.log`, `__pycache__`, `tsconfig.tsbuildinfo` | Basura |

**Sí debe quedar:** `src/`, `models/piece-centroids.json`, `public/diagramas/`, `public/icons/`, `.kiro/`, `docs/capturas/`, `package.json`, `arrancar.bat`, `.env.example` (plantilla **vacía**, sin clave).

Tras copiar, abre el ZIP o la carpeta y busca `.env.local`: si aparece, elimínalo.

## Capturas de la interfaz

[`docs/capturas/`](docs/capturas/README.md) — escritorio vacío, Tablero 2 cargado, móvil, manual e instalar (QR). Sirven si el entorno no permite Node.

## Estructura

```
arrancar.bat                   doble clic: instala si hace falta y abre el servidor
empaquetar-entrega.bat         ZIP limpio para entregar
.kiro/                         plan del producto (steering, specs, tasks)
src/lib/b8/                    encoder braille + audio
src/lib/vision/                clasificador local + Gemini opcional
src/app/                       web Next.js
models/piece-centroids.json    pesos del reconocedor de piezas
docs/capturas/                 capturas de pantalla
docs/hackathon/                enunciado (tableros de ejemplo) y salidas del programa
```
