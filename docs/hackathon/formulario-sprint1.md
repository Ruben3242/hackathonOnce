# Formulario Sprint 1 — textos para pegar

Copia cada bloque al Google Form. Los extractos 10–13 salen de `.kiro/` (no los reescribas). El README del repo se escribe en el Sprint 3.

## 5. Enfoque [Innovación]

Este sprint pide un plan, no un programa acabado. El mío es este: no voy a hacer un descriptor de imágenes. Voy a hacer un transcriptor de diagramas de ajedrez al Documento técnico B8, la misma signografía con la que la ONCE adapta los libros.

Por qué no una herramienta genérica: esa te dice que «hay un tablero con piezas». A quien lo lee en braille eso no le vale. Necesita pieza, casilla, resaltes y flechas, escritos como el enunciado, listos para Ebrai o para una línea braille.

Qué lo hace distinto, y por qué lo he elegido:
- El programa no va a inventar un párrafo. Va a reconocer el diagrama y a transcribirlo con reglas fijas. Así el braille, el audio y el lector no se contradicen.
- Va a dar tres vistas del mismo tablero (braille, audio, teclado). Lo justifico en el formato: el caso ONCE no es un solo canal.
- El acierto no será «si suena bien». Lo voy a medir contra las seis adaptaciones de ejemplo del PDF.

En una frase: una herramienta genérica describe; este programa transcribe. Eso es lo que me separa del resto.

## 6. Arquitectura [Viabilidad]

La ficha pide tres cosas: qué reconoce, qué salida da y cómo compruebo el acierto. El plan es exactamente eso.

Qué va a reconocer el programa, y por qué: el tablero en 8×8; en cada casilla, la pieza y el bando; si está en amarillo o en rojo; y las flechas, de dónde a dónde. Lo reconozco así porque es lo que anota el PDF, ni más ni menos. No hace falta un motor de ajedrez.

Qué salida va a dar, y por qué: braille Unicode al estilo del PDF («Tablero: Blancas: Re⠂ Dd⠂…», peón sin inicial, números en posición baja); resaltes y flechas (⠒⠕ / ⠪⠒) en un bloque aparte, como pide el enunciado; audio («Blancas: Rey en E1, Torres en A1 y H1…»); y un tablero para el lector, casilla a casilla. La visión no redacta ese texto: solo rellena un modelo. El texto lo escriben reglas fijas, para poder testearlas.

Cómo voy a comprobar el acierto, y por qué así: las seis adaptaciones y los cuatro audios del PDF son el texto de oro. Primero testeo las reglas contra ese texto, sin visión. Luego, si una casilla queda dudosa, se corrige con el teclado y se vuelve a generar. En el Sprint 2 pegaré la salida tal cual la dé el programa, sin pasarla a limpio a mano.

Orden del plan, para que sea viable: (1) reglas de braille y audio + tests, (2) interfaz que se oye y se recorre con teclado, (3) visión. No empiezo entrenando un modelo: eso no demuestra el B8 y no cubre los resaltes ni las flechas del libro.

Este plan está en steering numerado y en requirements, design y tasks. En este sprint no entrego código: entrego el plan, claro y justificado.

## 7. Formato de salida accesible

Marcar Other y escribir:

Braille, audio y texto para el lector de pantalla, las tres a la vez

No marcar Imagen.

## 8. Por qué ese formato

He marcado las tres a la vez porque el caso ONCE no se resuelve con un solo canal, y este sprint pide justificar el formato, no listarlo.

Braille: es el estándar de la Comisión Braille Española. Sin B8 no hay adaptación de libro ni pegado a Ebrai.
Audio: hay quien no tiene línea braille, y el Sprint 2 se puntúa escuchando.
Lector de pantalla: un párrafo de cuarenta piezas no se retiene; hay que recorrer el tablero casilla a casilla.

Por qué juntas: el programa las va a generar del mismo tablero. Si el rey está en e1, las tres dicen e1. Un pie de foto no te asegura eso. Por eso encaja con el caso de uso.

## 9. Uso de Kiro

Marcar: Con specs / planificación previa. Marcar también: Flujo claro y explicable. Nada más.

## Cómo leer el formulario 10–13 (importante)

El Google Form ha **copiado mal el título** en 11, 12 y 13: todos dicen «Steering · justificación». **Ignora ese título.** Mira la línea de debajo: «Un bloque por fichero (requirements.md / design.md / tasks.md)».

| Campo | Qué pegar | Límite | Caracteres actuales |
| --- | --- | --- | --- |
| **10** | Solo steering (reglas numeradas) | 3.000 | ~1.050 |
| **11** | Justificación (1 línea/regla) **+** requirements.md | 4.000 en total* | ~2.319 juntos |
| **12** | Solo design.md | 4.000 | ~1.309 |
| **13** | Solo tasks.md | 4.000 | ~632 |

\* El formulario mezcla «justificación máx. 1.000» con «requirements máx. 4.000». En la práctica hay **una sola caja** en el 11: pega primero la justificación y debajo requirements. **No repitas** la justificación en 12 ni 13.

**¿Hay que rellenar hasta 4.000?** No. «Máx. 4.000» = techo, no mínimo. Extracto literal = copia del fichero tal cual. Rellenar con relleno inventado penaliza; lo que tienes ya cabe y es coherente.

**¿Puedo alargar los ficheros?** Sí, si quieres más detalle en el plan (más requisitos EARS, más diseño). Pero no es obligatorio para el Sprint 1.

## 10. Steering · extracto

Copiar `.kiro/steering/transcriptor-b8.md` desde `# Steering — Transcriptor B8` (sin el `---` / `inclusion` del principio).

## 11. Justificación + requirements.md

**Bloque 1** — `.kiro/steering/justificacion.md`, líneas 1–10 (sin `# Steering — justificación`).

**Bloque 2** — debajo, `.kiro/specs/transcriptor-b8/requirements.md` entero.

## 12. design.md (solo esto, sin justificación)

Copiar `.kiro/specs/transcriptor-b8/design.md` entero.

## 13. tasks.md (solo esto, sin justificación)

Copiar `.kiro/specs/transcriptor-b8/tasks.md` entero.
