# Manual de usuario — Transcriptor B8

Herramienta web del Reto ONCE: pasa un diagrama de ajedrez a braille Unicode B8, audio en español y un tablero explorables con teclado.

## Qué hace

No describe la foto. Transcribe la posición al Documento técnico B8 (Comisión Braille Española / Ebrai):

| Función | Dónde |
| --- | --- |
| Subir imagen o cargar ejemplo 1–6 | Inicio, paso 1 |
| Analizar (`/api/analyze`) | Reconoce `tablero-1` … `tablero-6` |
| Braille B8 | Panel derecho, copiable |
| Voz (TTS del navegador) | Idioma + modelo de voz + velocidad |
| Tablero 8×8 | Flechas, Enter corrige pieza |
| Copiar transcripción | Salida B8 y audio generada por el programa |
| Vista móvil / cámara | `/movil` — vídeo, foto o galería |
| Instalar PWA o APK | `/instalar` |
| Jugadas y alertas | Panel bajo el braille: material, mate, mejor lance |

## Cómo arrancar (PowerShell)

```powershell
npm.cmd run dev
```

Abre http://localhost:3000 — móvil en http://localhost:3000/movil — instalar en http://localhost:3000/instalar — manual en http://localhost:3000/ayuda

En el teléfono de la misma Wi‑Fi usa `http://IP-DEL-PC:3000/movil` (el `dev` escucha en 0.0.0.0).

## Voces

Sin APIs de pago. Lista las voces instaladas (`speechSynthesis`). Prioriza español (Helena, Google Español, etc.). Puedes cambiar idioma (es-ES, es-MX, …) y velocidad.

Si no aparece español: Windows → Configuración → Hora e idioma → Idioma → añadir Español y voces.

## Teclado y lector

- Flechas: moverse. Enter: cambiar pieza (se regenera braille y audio).
- NVDA / Narrador: oyen el audio, no los puntos braille sueltos.

## Dataset y modelo

Las ~10 000 fotos de entrenamiento están en `data/kaggle-chess-positions/` (**no se suben a git**).

```powershell
python scripts/download_kaggle_chess.py
python scripts/train_piece_centroids.py
```

El resultado (`models/piece-centroids.json`) es el clasificador de piezas que usa `/api/analyze` cuando el archivo no es un tablero ONCE 1–6. El dataset son 10 000 tableros sintéticos de 400×400 px, con entre 5 y 15 piezas. En ese formato acierta casi todas las casillas. En una pasada del 13 de octubre de 2026 sobre las primeras 30 imágenes del directorio: 1 896/1 920 casillas (98,8 %) y 25 tableros enteros de 30. Las fotos `kaggle-1` y `kaggle-2` de `public/pruebas/` salen exactas; `kaggle-3` falla una casilla. Los 6 diagramas ONCE no pasan por este modelo: se cargan por el botón o por el nombre del archivo. Una foto que no sea de ese formato (libro, otra resolución, perspectiva) falla más.

## Gemini opcional (fotos de libro / móvil)

Copia `.env.example` a `.env.local` y pega tu API key de [Google AI Studio](https://aistudio.google.com/apikey). Reinicia `npm.cmd run dev`.

Si hay clave y el modo no es «Solo modelo local», el servidor pide a Gemini el JSON de piezas y, si vale, sustituye al modelo local. Sin clave no se llama. Los modos Auto y Siempre hacen hoy la misma llamada. La clave no se manda al navegador.

