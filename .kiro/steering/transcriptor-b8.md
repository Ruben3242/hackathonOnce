---
inclusion: always
---

# Steering — Transcriptor B8 (ONCE)

1. El producto transcribe diagramas de ajedrez al Documento técnico B8; no describe imágenes en prosa.
2. Braille, audio y lector se generan desde un único modelo canónico {piezas, resaltes, flechas}; nunca desde el texto crudo de un LLM.
3. Piezas: R, D, A, C, T. El peón omite la inicial (variante con P solo si el usuario la pide).
4. Casilla = columna a–h + número braille en posición baja (⠂=1 … ⠦=8), igual para ambos bandos.
5. Resaltes amarillos/rojos y flechas se emiten en un bloque aparte, no mezclados con las piezas.
6. Flecha ⠒⠕ o ⠪⠒ según el sentido; origen y destino son casillas B8.
7. El audio agrupa por bando y tipo de pieza, en español, como las págs. 9–12 («Rey en E1, Torres en A1 y H1»).
8. Orden de lectura fijo: Blancas → Negras → resaltes → flechas.
9. El acierto se comprueba con fixtures de oro del PDF. La transcripción copiada es siempre la del programa, sin edición manual.
10. Interfaz teclado-primero (NVDA/Narrador/VoiceOver). La imagen es entrada, nunca la salida accesible.
