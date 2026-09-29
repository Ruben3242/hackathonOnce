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
| Copiar transcripción | Salida literal para el formulario |
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

El resultado (`models/piece-centroids.json`) es el clasificador de piezas que usa `/api/analyze` cuando el archivo no es un tablero ONCE 1–6. En tableros digitales al estilo del dataset acierta casi todas las casillas; los 6 diagramas ONCE siguen yendo por el nombre del archivo.

## Gemini opcional (fotos de libro / móvil)

Copia `.env.example` a `.env.local` y pega tu API key de [Google AI Studio](https://aistudio.google.com/apikey). Reinicia `npm.cmd run dev`.

Por defecto: el modelo local va primero; Gemini (Flash, incluido en el plan de estudiante) solo entra si el recuento de piezas no cuadra, o si eliges «Siempre». La clave no se manda al navegador.

