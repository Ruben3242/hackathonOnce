# Formulario Sprint 2 — textos para pegar

Copia cada bloque al Google Form. El campo 15 es salida literal de `docs/hackathon/salidas-sprint2/tablero-2.txt` (generada por el programa, sin retocar).

## 14. ¿Funciona ya tu flujo de imagen a descripción?

Sí. El flujo ya va de punta a punta: subo un diagrama (PNG, JPEG o SVG) y el programa lo analiza, rellena un modelo interno (piezas, resaltes, flechas) y genera tres salidas del mismo tablero: braille Unicode B8, audio en español y un grid 8×8 que se recorre con teclado.

Lo he probado en los seis tableros de ejemplo del PDF del enunciado (libro de ajedrez, 8×8). El tablero 1 tiene 32 piezas y 2 resaltes amarillos; el 2, 28 piezas, 2 amarillos y 1 flecha; el 3, 32 piezas, resaltes y flecha en h; el 4, 13 piezas sin marcas; el 5, 22 piezas, amarillo y rojo y tres flechas; el 6, 30 piezas, tres resaltes y tres flechas desde el caballo en d2.

No uso APIs de pago. La transcripción la escriben reglas fijas (encoder B8), no un modelo de lenguaje. La visión de esta fase reconoce los seis diagramas de prueba por el archivo; si una casilla queda mal, se corrige con Enter en el tablero y se vuelve a generar. La salida que copio es siempre la del programa.

## 15. Ejemplo de descripción (literal)

Diagrama: Tablero 2 · libro de ajedrez, con flecha y resaltes amarillos
Tipo: tablero de libro 8x8.
Elementos: 28 piezas, 2 resaltes, 1 flecha.

Tablero:
Blancas: Re⠂ Dd⠂ Ta⠂ Th⠂ Cc⠒ Af⠂ Af⠲ a⠆ b⠆ c⠆ e⠲ f⠆ g⠆ h⠆
Negras: Re⠦ Dd⠦ Ta⠦ Th⠦ Cg⠲ Ac⠦ Af⠦ a⠶ b⠶ d⠖ e⠢ f⠶ g⠶ h⠶
)Resaltadas en amarillo las casillas d⠂ y d⠲(
d⠲¬⠒⠕¬d⠂

Audio:
Blancas: Rey en E1, Dama en D1, Torres en A1 y H1, Caballo en C3, Alfiles en F1 y F4, Peones en A2, B2, C2, E4, F2, G2 y H2. Negras: Rey en E8, Dama en D8, Torres en A8 y H8, Caballo en G4, Alfiles en C8 y F8, Peones en A7, B7, D6, E5, F7, G7 y H7. casillas en amarillo: D1 y D4. Flecha de D4 a D1.

## 16. ¿Cómo suena en un lector de pantalla y qué has cambiado?

Al dejar que el lector recitara el bloque braille, deletreaba los puntos Unicode (⠂, ⠒) uno a uno: largo, inútil y distinto de lo que pide el enunciado. El TTS, en cambio, ya agrupaba por bando («Rey en E1, Torres en A1 y H1»).

Cambios tras oírlo:
- El braille visible queda oculto al lector (`aria-hidden`). El lector oye el texto de audio, no los puntos.
- Cada casilla del grid tiene `aria-label` estable: «e1, rey blanco», más resalte y flechas si los hay. Vacía se anuncia como vacía.
- `aria-live="polite"` avisa al cargar o al corregir una casilla, sin interrumpir la lectura.
- Orden fijo: Blancas, Negras, resaltes, flechas. TTS del navegador: se elige idioma (es-ES, es-MX…) y la voz instalada (Helena, Google Español, etc.), más la velocidad. Sin API de pago.
- Enlace «Saltar al resultado», foco visible, coordenadas a–h / 1–8 en el tablero, y una página de manual (`/ayuda`).

Con Narrador o NVDA el recorrido útil es: cargar tablero → oír el resumen → entrar al grid y moverse con flechas. No hay que leer cuarenta piezas de un tirón.

## 17. ¿Para qué has usado Kiro en esta fase?

He ejecutado las tasks del spec `.kiro/specs/transcriptor-b8/tasks.md` en este orden: fixtures de oro (T1), encoder B8 y audio (T2–T4), UI con subida, TTS, grid y copia (T6–T7), análisis de imagen mínimo (T8–T9) y salidas literales para el formulario (T10).

El steering del Sprint 1 sigue mandando: un modelo canónico, tres vistas, sin prosa de LLM, peón sin inicial, números braille en posición baja. Esta fase no ha sido código a ciegas: cada pieza del programa responde a una task numerada.

## 18. Skills (opcional)

Vacío. En esta fase no he creado skills: el tiempo ha ido al flujo que se oye y a las seis pruebas.

## 19. Hooks (opcional)

Vacío. Los tests del encoder (`npm test`) cubren el oro del PDF; no he automatizado un hook de Kiro.
