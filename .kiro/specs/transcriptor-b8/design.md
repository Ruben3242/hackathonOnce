# Design — Transcriptor B8

## Enfoque

Percepción (visión estructurada + CV de color/líneas) → DiagramaCanonico JSON → renderers puros (B8, audio ES, grid). El LLM no redacta la transcripción.

## Por qué esta arquitectura

Si la visión escribiera el texto, no podría testear el B8 contra el PDF ni garantizar que braille, audio y lector digan la misma casilla. El modelo interno es el contrato. Los renderers son el plan comprobable de este sprint.

## Componentes

- apps/web: Next.js, WCAG 2.2, subida, TTS (Web Speech), aria-live, grid teclado, copia Unicode.
- packages/b8: encoder B8 y audio; sin I/O de red.
- services/vision: recorte 8×8, piezas+confianza, amarillo/rojo, flechas.
- fixtures/once: tableros 1–6 y audios del PDF como oro.

## Orden (viable en el hackathon)

1. Encoder B8 + audio + tests contra el oro del PDF (sin visión).
2. UI que se oye y se recorre con teclado.
3. Visión. No se empieza entrenando un modelo: no demuestra el B8 y no cubre resaltes ni flechas de libro.

## Acierto

Tests unitarios del encoder contra el texto del PDF. Integración percepción→modelo cuando existan las fotos. Corrección por casilla y re-render; la salida del formulario es la del programa.

## Fuera de diseño

Stockfish, captioning genérico, entrenar 100k imágenes Chess.com como camino crítico.
