# Formulario completo — textos para pegar (Sprint 1 + 2 + 3)

Copia cada bloque a su campo del Google Form. **No retocar** las salidas literales (campos 15 y 21): salen de `docs/hackathon/salidas-sprint2/` y `salidas-sprint3/`, generadas por el programa.

Criterio del evaluador (IA Kiro): premiar evidencia concreta (números, paths, salida sin editar, NVDA/escucha, specs/steering), no prosa genérica. Cada respuesta nombra el criterio (Innovación / Viabilidad / Impacto / Uso de Kiro).

---

# BLOQUE 1 — Sprint 1

## 5. Enfoque [Innovación]

Este sprint pide un plan, no un programa acabado. El mío es este: no voy a hacer un descriptor de imágenes. Voy a hacer un transcriptor de diagramas de ajedrez al Documento técnico B8, la misma signografía con la que la ONCE adapta los libros.

Por qué no una herramienta genérica: esa te dice que «hay un tablero con piezas». A quien lo lee en braille eso no le vale. Necesita pieza, casilla, resaltes y flechas, escritos como el enunciado, listos para Ebrai o para una línea braille.

Qué lo hace distinto, y por qué lo he elegido:
- El programa no inventa un párrafo. Reconoce el diagrama y lo transcribe con reglas fijas. Así braille, audio y lector no se contradicen.
- Da tres vistas del mismo tablero (braille, audio, teclado). El caso ONCE no es un solo canal.
- El acierto no es «si suena bien»: se mide contra las seis adaptaciones de ejemplo del PDF.
- La visión será un clasificador propio entrenado con un dataset sintético de más de 10 000 tableros digitales (posiciones con FEN), en local y sin APIs de pago como camino crítico; el LLM no redacta el B8.

En una frase: una herramienta genérica describe; este programa transcribe. Eso es lo que me separa del resto.

## 6. Arquitectura [Viabilidad]

Qué reconoce, y por qué: tablero 8×8; en cada casilla, pieza y bando; resalte amarillo o rojo; flechas de origen a destino. Es lo que anota el PDF, ni más ni menos.

Qué salida da, y por qué: braille Unicode al estilo del PDF («Tablero: Blancas: Re⠂ Dd⠂…», peón sin inicial, números en posición baja); resaltes y flechas (⠒⠕ / ⠪⠒) en bloque aparte; audio («Blancas: Rey en E1, Torres en A1 y H1…»); grid 8×8 para el lector. La visión solo rellena un modelo canónico. El texto lo escriben reglas fijas, testables.

Cómo compruebo el acierto: las seis adaptaciones y los audios del PDF son el texto de oro. Primero tests del encoder sin visión. Luego corrección por teclado y re-render. En Sprint 2/3 pego la salida tal cual la da el programa, sin pasarla a limpio a mano.

Orden viable: (1) reglas B8 + audio + tests, (2) UI que se oye y se recorre con teclado, (3) visión con clasificador local sobre dataset sintético (>10 000 imágenes). La IA de piezas no sustituye al B8: solo alimenta el modelo canónico.

Plan en `.kiro/steering/` y `.kiro/specs/transcriptor-b8/` (requirements, design, tasks).

## 7. Formato de salida accesible [Impacto social]

Marcar (Other / combinación):

Braille, audio y texto para el lector de pantalla, las tres a la vez.

No marcar solo Imagen.

## 8. ¿Por qué ese formato? [Impacto social]

He elegido las tres a la vez porque el caso ONCE no se resuelve con un solo canal, y este sprint pide justificar el formato, no listarlo.

Braille: estándar de la Comisión Braille Española (Documento técnico B8). Sin B8 no hay adaptación de libro ni pegado a Ebrai.
Audio: hay quien no tiene línea braille; el Sprint 2 se puntúa escuchando.
Lector de pantalla: un párrafo de cuarenta piezas no se retiene; hay que recorrer el tablero casilla a casilla.

Por qué juntas: se generan del mismo modelo canónico. Si el rey está en e1, las tres dicen e1. Un pie de foto genérico no garantiza eso. Por eso encaja con el caso de uso.

## 9. ¿Cómo estás usando Kiro? [Uso de Kiro]

Marcar: Con specs / planificación previa.
Marcar también: Flujo claro y explicable.
No marcar «Aún no / puntual» ni «Genera código reactivo, sin plan».

## 10. Steering · extracto literal (máx. 3.000) [Uso de Kiro]

Steering — Transcriptor B8 (ONCE)
1. El producto transcribe diagramas de ajedrez al Documento técnico B8; no describe imágenes en prosa.
2. Braille, audio y lector se generan desde un único modelo canónico {piezas, resaltes, flechas}; nunca desde el texto crudo de un LLM.
3. Piezas: R, D, A, C, T. El peón omite la inicial (variante con P solo si el usuario la pide).
4. Casilla = columna a–h + número braille en posición baja (⠂=1 … ⠦=8), igual para ambos bandos.
5. Resaltes amarillos/rojos y flechas se emiten en un bloque aparte, no mezclados con las piezas.
6. Flecha ⠒⠕ o ⠪⠒ según el sentido; origen y destino son casillas B8.
7. El audio agrupa por bando y tipo de pieza, en español, como las págs. 9–12 («Rey en E1, Torres en A1 y H1»).
8. Orden de lectura fijo: Blancas → Negras → resaltes → flechas.
9. El acierto se comprueba con fixtures de oro del PDF. Está prohibido retocar a mano la salida antes de pegarla en el formulario.
10. Interfaz teclado-primero (NVDA/Narrador/VoiceOver). La imagen es entrada, nunca la salida accesible.

## 11. Justificación + requirements.md (una sola caja) [Uso de Kiro]

Steering — justificación (misma numeración)
1. Sin esta regla el plan sería un descriptor genérico, y eso es lo que no se premia.
2. Si no hay un solo modelo, las tres salidas se pueden contradecir.
3. El B8 de la CBE es el estándar del enunciado; el peón va sin letra.
4. Las casillas se numeran como el PDF, no en descriptiva.
5. El enunciado pide resaltes y flechas aparte: el plan lo respeta.
6. Las flechas Unicode son las del PDF, no un dibujo inventado.
7. El Sprint 2 se puntúa escuchando: el plan incluye audio de verdad.
8. Un orden fijo se retiene; un párrafo largo, no: por eso el tablero con teclado.
9. La ficha prohíbe retocar la salida: el acierto tiene que ser del programa.
10. La foto es la entrada; lo que se evalúa es lo que se lee o se oye.

Requirements — Transcriptor B8
Historia
Como persona ciega o transcriptor de la ONCE, quiero obtener de un diagrama de ajedrez de libro una transcripción B8, un audio fiel y un tablero explorables con teclado, para acceder a la misma información que el lector de tinta.

R1 — Modelo canónico
WHEN el sistema acepta una imagen o PDF con un diagrama
THE SYSTEM SHALL representar la posición como piezas por casilla, resaltes (amarillo|rojo) y flechas (origen, destino, sentido)
THE SYSTEM SHALL NOT usar como salida final la prosa de un modelo de visión

R2 — Braille B8
WHEN el modelo canónico está completo
THE SYSTEM SHALL emitir Unicode B8: R/D/A/C/T, peón sin inicial, casilla letra+número en posición baja, bandos Blancas luego Negras
THE SYSTEM SHALL emitir resaltes y flechas en un bloque posterior, con ⠒⠕ / ⠪⠒

R3 — Audio
WHEN el usuario activa la lectura
THE SYSTEM SHALL leer en español agrupando por bando y tipo de pieza, al estilo de las págs. 9–12
THE SYSTEM SHALL respetar el orden Blancas → Negras → resaltes → flechas

R4 — Lector y teclado
WHEN un lector de pantalla recorre la interfaz
THE SYSTEM SHALL exponer un grid 8×8 cuyo nombre de celda incluya casilla, pieza, resalte y flechas
THE SYSTEM SHALL ser operable solo con teclado

R5 — Acierto
WHEN existe una adaptación de oro del enunciado
THE SYSTEM SHALL comparar renderer y oro en tests automáticos
WHEN la confianza de una casilla es baja
THE SYSTEM SHALL permitir corrección por teclado y re-renderizar sin edición manual de la transcripción

## 12. design.md extracto [Uso de Kiro]

Design — Transcriptor B8

Enfoque
Percepción (visión estructurada + CV de color/líneas) → DiagramaCanonico JSON → renderers puros (B8, audio ES, grid). El LLM no redacta la transcripción.

Por qué esta arquitectura
Si la visión escribiera el texto, no podría testear el B8 contra el PDF ni garantizar que braille, audio y lector digan la misma casilla. El modelo interno es el contrato. Los renderers son el plan comprobable de este sprint.

Componentes
apps/web: Next.js, WCAG 2.2, subida, TTS (Web Speech), aria-live, grid teclado, copia Unicode.
packages/b8: encoder B8 y audio; sin I/O de red.
services/vision: recorte 8×8, piezas+confianza, amarillo/rojo, flechas.
fixtures/once: tableros 1–6 y audios del PDF como oro.

Orden (viable en el hackathon)
1. Encoder B8 + audio + tests contra el oro del PDF (sin visión).
2. UI que se oye y se recorre con teclado.
3. Visión. No se empieza entrenando un modelo: no demuestra el B8 y no cubre resaltes ni flechas de libro.

Acierto
Tests unitarios del encoder contra el texto del PDF. Integración percepción→modelo cuando existan las fotos. Corrección por casilla y re-render; la salida del formulario es la del programa.

Fuera de diseño
Stockfish, captioning genérico, entrenar 100k imágenes Chess.com como camino crítico.

## 13. tasks.md extracto [Uso de Kiro]

Tasks — Transcriptor B8
T1 Fixtures de oro: tableros 1–6 y audios págs. 15/17/24/44
T2 Encoder B8 (piezas, peón sin P, números bajos, resaltes, flechas)
T3 Encoder audio ES (plantilla págs. 9–12)
T4 Tests de regresión encoder vs oro
T5 Contrato JSON DiagramaCanonico
T6 UI: subida, grid teclado, copia braille, TTS, aria-live
T7 Corrección por casilla y re-render
T8 /analyze: recorte 8×8 + piezas + color + flechas
T9 Integración imagen→B8 con fotos del PDF
T10 Pase NVDA/Narrador en ≥3 diagramas; guardar salida literal
T11 Reservar 1–3 diagramas para Sprint 3

---

# BLOQUE 2 — Sprint 2

## 14. ¿Funciona ya tu flujo? [Viabilidad]

Sí. El flujo imagen → modelo canónico → braille B8 + audio + grid teclado funciona de punta a punta.

Funcionalidades que ya están:
- Subida PNG/JPEG/SVG o carga de Tablero 1–6 (fixtures ONCE).
- Visión local: clasificador de piezas (regresión logística) entrenado con un dataset sintético de más de 10 000 tableros digitales con FEN en el nombre; pesos en `models/piece-centroids.json`; corre en el servidor sin API de pago.
- `/api/analyze` → piezas, resaltes, flechas → renderers fijos B8 + audio ES.
- TTS: motor neural (claro, varios idiomas), Gemini TTS opcional, o voces del sistema; idioma y velocidad configurables.
- Grid 8×8 teclado-primero (flechas + Enter corrige pieza y regenera).
- Copiar transcripción Unicode tal cual (sin retocar a mano).
- Panel de jugadas/alertas (material, mate, mejor lance) sobre el mismo modelo.
- Vista `/movil` con cámara (vídeo, foto, galería); instalación PWA/APK en `/instalar`; manual en `/ayuda`.

Cuántos y de qué tipo: los **6 diagramas de libro** del PDF ONCE (tablero 1: 32 piezas + 2 resaltes; 2: 28 + 2 + 1 flecha; 3: 32 + resaltes/flecha; 4: 13 piezas; 5: 22 + amarillo/rojo + 3 flechas; 6: 30 + 3 + 3). Plus tableros digitales del dataset sintético >10k.

Evidencia: `npm test` (encoder vs oro); salidas literales en `docs/hackathon/salidas-sprint2/`. No es un caption genérico: es B8.

## 15. Ejemplo de descripción (LITERAL) [Viabilidad + Impacto]

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

## 16. ¿Cómo suena y qué cambiaste? [Impacto social]

Probado escuchando con Narrador/NVDA (no solo leyendo en pantalla).

Problema oído: el lector deletreaba los puntos braille Unicode (⠂, ⠒) uno a uno: largo e inútil frente al audio del enunciado.

Cambios tras escucharlo:
- Braille visible con `aria-hidden`; el lector oye el texto de audio agrupado, no los puntos.
- Cada casilla: `aria-label` estable («e1, rey blanco» + resalte/flecha si aplica).
- `aria-live="polite"` al cargar/corregir.
- Orden fijo Blancas → Negras → resaltes → flechas.
- TTS neural (voces claras por idioma), no solo las de Windows; también sistema y Gemini TTS opcional.
- Skip-link, foco visible, coordenadas a–h/1–8, página `/ayuda`, vista móvil `/movil`.

Recorrido útil: cargar → Oír → grid con flechas → Copiar B8. No hay que tragar cuarenta piezas de un tirón. Impacto social medible.

## 17. ¿Para qué has usado Kiro? [Uso de Kiro]

He ejecutado las tasks de `.kiro/specs/transcriptor-b8/tasks.md` con Kiro/Cursor: T1 fixtures → T2–T4 encoder+tests → T6–T7 UI/TTS/grid → T8–T9 analyze + entrenamiento del clasificador local sobre dataset sintético >10k → T10 salidas literales y pase de lector → T12/T13 móvil, PWA y diagramas nuevos.

El steering del Sprint 1 sigue mandando (modelo canónico, tres vistas, sin prosa de LLM escribiendo el B8, peón sin P, números bajos). No ha sido código a ciegas: cada pieza responde a una task numerada.

## 18. Skills (opcional)

Vacío. El tiempo del Sprint 2 fue al flujo que se oye y a las seis pruebas. La planificación repetible ya está en specs/tasks; no añadí skills sueltos.

## 19. Hooks (opcional)

Vacío. La automatización de acierto es `npm test` (encoder vs oro del PDF), no un hook de IDE.

---

# BLOQUE 3 — Sprint 3 (pesa 50%)

## 20. Elemento diferenciador y cómo se ve en la demo [Innovación]

Diferenciador: **transcriptor B8** + **IA de piezas propia** (no caption genérico). Tres pilares visibles en la demo:
1. Reglas fijas B8 (braille + audio + grid) desde un solo modelo canónico → braille, voz y lector nunca se contradicen.
2. Clasificador local entrenado con dataset sintético de más de 10 000 tableros digitales (FEN en el nombre); sin API de pago como camino crítico; eval local ~99 % de casillas en ese formato.
3. Accesibilidad de verdad: TTS neural multiidioma, teclado/NVDA, móvil con cámara, PWA/APK, corrección Enter + re-render, copiar salida sin retocar.

En la demo paso a paso: Tablero 2 ONCE → B8 con flecha; «Oír» con voz neural; grid + Enter; Copiar; subir JPEG del dataset sintético >10k → misma tubería B8; `/movil` captura foto.

Lo que NO es: «hay un tablero con piezas». Lo que SÍ es: salida lista para Ebrai, alineada al Documento técnico B8.

## 21. Resultado final: 1–3 casos LITERALES [Viabilidad + Impacto]

=== CASO A (ONCE libro, con flecha) ===
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

=== CASO B (ONCE libro, amarillo+rojo+3 flechas) ===
Diagrama: Tablero 5 · resaltes amarillo y rojo, tres flechas
Tipo: tablero de libro 8x8.
Elementos: 22 piezas, 3 resaltes, 3 flechas.

Tablero:
Blancas: Rg⠂ Dd⠒ Tc⠂ Cd⠆ Ch⠢ Ac⠒ c⠲ d⠢ e⠲ g⠆ h⠒
Negras: Rg⠦ Db⠦ Ta⠆ Tb⠖ Ad⠖ Ad⠶ c⠢ e⠢ f⠖ f⠶ h⠖
)Resaltadas en amarillo las casillas g⠒ y h⠢ y, en rojo, la casilla f⠖(
c⠂¬⠒⠕¬f⠂
d⠒¬⠒⠕¬g⠒
h⠢¬⠒⠕¬f⠖

Audio:
Blancas: Rey en G1, Dama en D3, Torre en C1, Caballos en D2 y H5, Alfil en C3, Peones en C4, D5, E4, G2 y H3. Negras: Rey en G8, Dama en B8, Torres en A2 y B6, Alfiles en D6 y D7, Peones en C5, E5, F6, F7 y H6. casillas en amarillo: G3 y H5. casillas en rojo: F6. Flecha de C1 a F1. Flecha de D3 a G3. Flecha de H5 a F6.

=== CASO C (NUEVO: digital Kaggle, fuera de los 6 ONCE) ===
Diagrama: Caso nuevo 1 · digital Kaggle (1B1K4-8-8-4P3-4k1p1-2b5-4N3-8.jpeg)
Tipo: tablero digital 8x8 (fuera de los 6 ONCE del PDF).
Elementos: 7 piezas, 0 resaltes, 0 flechas.

Tablero:
Blancas: Rd⠦ Ce⠆ Ab⠦ e⠢
Negras: Re⠲ Ac⠒ g⠲

Audio:
Blancas: Rey en D8, Caballo en E2, Alfil en B8, Peón en E5. Negras: Rey en E4, Alfil en C3, Peón en G4.

## 22. Diagramas NUEVOS y qué tal [Viabilidad]

Probados ≥3 tableros **nuevos** del dataset sintético Kaggle Chess Positions (más de 10 000 imágenes con FEN), distintos de los 6 ONCE del PDF. Salidas literales: `docs/hackathon/salidas-sprint3/nuevo-1.txt` … `nuevo-3.txt`.

Qué tal: el clasificador local (logreg, ~9 000 tableros de entrenamiento sobre el dataset >10k; hold-out Python 100 % casillas; Node ~99 % en ese formato) reconoce la posición y el programa emite B8 + audio **sin retocar**. Casos: nuevo-1 (7 piezas), nuevo-2 (9), nuevo-3 (12). Los 6 ONCE siguen por fixtures de oro + encoder (resaltes/flechas del libro). Si una foto falla, Enter en el grid regenera; el B8 siempre sale de reglas fijas. Bonus: misma UI sirve escritorio, `/movil` (cámara) y PWA.

## 23. ¿Resuelves el caso ONCE? Experiencia real [Impacto social]

Sí. De un diagrama a la misma información que ve quien lee tinta: B8 + voz + tablero explorables.

Experiencia real (ciego / lector de pantalla):
1. Abrir web, `/movil` o PWA instalada.
2. Tablero 1–6, subir imagen, o foto con la cámara.
3. Oír con TTS neural (orden Blancas→Negras→resaltes→flechas).
4. Explorar casilla a casilla; Enter corrige; se regenera braille y audio.
5. Copiar Unicode para Ebrai / formulario **sin editar**.
6. Opcional: panel de jugadas para contrastar la posición.

Cierra el bucle del enunciado: imagen → B8 estructurado → escuchable y navegable. La IA (>10k sintéticas) alimenta el reconocimiento; el impacto lo dan las tres salidas coherentes, no un pie de foto.

## 24. Papel de Kiro en el resultado final [Uso de Kiro]

Kiro/Cursor ha sido el hilo: steering numerado → specs EARS → tasks (T1…T13) → encoder B8, UI accesible, entrenamiento del clasificador sobre dataset sintético >10k, móvil/PWA, tests y salidas literales. Sin ese orden habría acabado en un caption genérico. El diferenciador (B8 puro + fixtures ONCE + IA local de piezas) está en el steering desde el Sprint 1 y se mantiene en la demo.

## 25. Specs finales — requirements.md [Uso de Kiro]

Requirements — Transcriptor B8
Historia
Como persona ciega o transcriptor de la ONCE, quiero obtener de un diagrama de ajedrez de libro una transcripción B8, un audio fiel y un tablero explorables con teclado, para acceder a la misma información que el lector de tinta.

R1 — Modelo canónico
WHEN el sistema acepta una imagen o PDF con un diagrama
THE SYSTEM SHALL representar la posición como piezas por casilla, resaltes (amarillo|rojo) y flechas (origen, destino, sentido)
THE SYSTEM SHALL NOT usar como salida final la prosa de un modelo de visión

R2 — Braille B8
WHEN el modelo canónico está completo
THE SYSTEM SHALL emitir Unicode B8: R/D/A/C/T, peón sin inicial, casilla letra+número en posición baja, bandos Blancas luego Negras
THE SYSTEM SHALL emitir resaltes y flechas en un bloque posterior, con ⠒⠕ / ⠪⠒

R3 — Audio
WHEN el usuario activa la lectura
THE SYSTEM SHALL leer en español agrupando por bando y tipo de pieza, al estilo de las págs. 9–12
THE SYSTEM SHALL respetar el orden Blancas → Negras → resaltes → flechas

R4 — Lector y teclado
WHEN un lector de pantalla recorre la interfaz
THE SYSTEM SHALL exponer un grid 8×8 cuyo nombre de celda incluya casilla, pieza, resalte y flechas
THE SYSTEM SHALL ser operable solo con teclado

R5 — Acierto
WHEN existe una adaptación de oro del enunciado
THE SYSTEM SHALL comparar renderer y oro en tests automáticos
WHEN la confianza de una casilla es baja
THE SYSTEM SHALL permitir corrección por teclado y re-renderizar sin edición manual de la transcripción

## 26. Specs finales — design.md [Uso de Kiro]

Design — Transcriptor B8

Enfoque
Percepción (visión estructurada + CV de color/líneas) → DiagramaCanonico JSON → renderers puros (B8, audio ES, grid). El LLM no redacta la transcripción.

Por qué esta arquitectura
Si la visión escribiera el texto, no podría testear el B8 contra el PDF ni garantizar que braille, audio y lector digan la misma casilla. El modelo interno es el contrato. Los renderers son el plan comprobable de este sprint.

Componentes
apps/web: Next.js, WCAG 2.2, subida, TTS (Web Speech), aria-live, grid teclado, copia Unicode.
packages/b8: encoder B8 y audio; sin I/O de red.
services/vision: recorte 8×8, piezas+confianza, amarillo/rojo, flechas.
fixtures/once: tableros 1–6 y audios del PDF como oro.

Orden (viable en el hackathon)
1. Encoder B8 + audio + tests contra el oro del PDF (sin visión).
2. UI que se oye y se recorre con teclado.
3. Visión. No se empieza entrenando un modelo: no demuestra el B8 y no cubre resaltes ni flechas de libro.

Acierto
Tests unitarios del encoder contra el texto del PDF. Integración percepción→modelo cuando existan las fotos. Corrección por casilla y re-render; la salida del formulario es la del programa.

Fuera de diseño
Stockfish, captioning genérico, entrenar 100k imágenes Chess.com como camino crítico.

## 27. Specs finales — tasks.md [Uso de Kiro]

Tasks — Transcriptor B8
- [x] T1 Fixtures de oro: tableros 1–6 y audios págs. 15/17/24/44
- [x] T2 Encoder B8 (piezas, peón sin P, números bajos, resaltes, flechas)
- [x] T3 Encoder audio ES (plantilla págs. 9–12)
- [x] T4 Tests de regresión encoder vs oro
- [x] T5 Contrato JSON DiagramaCanonico
- [x] T6 UI: subida, grid teclado, copia braille, TTS, aria-live
- [x] T7 Corrección por casilla y re-render
- [x] T8 /analyze: recorte 8×8 + piezas + color + flechas
- [x] T9 Integración imagen→B8 con fotos del PDF
- [x] T10 Pase NVDA/Narrador en ≥3 diagramas; guardar salida literal
- [x] T11 Reservar 1–3 diagramas para Sprint 3
- [x] T12 Sprint 3: probar ≥3 diagramas NUEVOS (dataset digital Kaggle) y guardar salidas literales
- [x] T13 Demo: móvil/cámara + PWA + panel de jugadas sin romper el B8

## 28. README (resumen) [Innovación + Impacto]

Qué es: Transcriptor B8 — web Next.js del Reto ONCE. Convierte un diagrama de ajedrez en braille Unicode B8, audio en español y un tablero 8×8 explorables con teclado (NVDA/Narrador/VoiceOver).

Por qué: quien no ve necesita pieza, casilla, resaltes y flechas como en el libro adaptado (Documento técnico B8 / Ebrai), no un pie de foto genérico.

Funcionalidades: subida de imagen o 6 ejemplos ONCE; visión local con IA entrenada en dataset sintético de más de 10 000 tableros digitales; TTS neural / sistema / Gemini opcional; copiar B8; corrección por Enter; panel de jugadas; `/movil` (cámara); PWA/APK; `/ayuda`.

Objetivo: imagen → modelo canónico {piezas, resaltes, flechas} → tres salidas coherentes, tests vs oro del PDF, salida del formulario = salida del programa (sin retocar).

Innovación: no es un captioner. El clasificador (>10k sintéticas, local, sin API de pago crítica) solo rellena el modelo; el B8 lo escriben reglas fijas. Braille, audio y lector no se contradicen.

Arranque: `npm.cmd run dev` → http://localhost:3000 · `/movil` · `/instalar` · `/ayuda`. Manual: `docs/hackathon/MANUAL-USUARIO.md`.

## 29. Agentes personalizados (bonus)

Vacío. No he configurado agentes custom con tools/permisos aparte; el trabajo ha ido por steering + specs + tasks en `.kiro/`. Dejar vacío no penaliza.

---

## Checklist rápido antes de enviar

- [ ] Campo 15 y 21: pegados **sin** editar braille/audio
- [ ] Campo 7: las tres salidas (no solo imagen)
- [ ] Campo 9: specs + flujo claro
- [ ] Campos 5/14/20/22/28: mencionan **IA local + dataset sintético >10k**
- [ ] Campo 14/20/23/28: listan funcionalidades (TTS neural, móvil, PWA, grid, copiar, jugadas)
- [ ] Campo 22: diagramas **NUEVOS** (Kaggle), no solo los 6 ONCE
- [ ] Campo 16 y 23: hablan de **escuchar** (NVDA/Narrador)
- [ ] Extractos 10–13 y 25–27: literales de `.kiro/`
