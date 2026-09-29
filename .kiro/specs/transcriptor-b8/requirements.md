# Requirements — Transcriptor B8

## Historia

Como persona ciega o transcriptor de la ONCE, quiero obtener de un diagrama de ajedrez de libro una transcripción B8, un audio fiel y un tablero explorables con teclado, para acceder a la misma información que el lector de tinta.

### R1 — Modelo canónico

WHEN el sistema acepta una imagen o PDF con un diagrama
THE SYSTEM SHALL representar la posición como piezas por casilla, resaltes (amarillo|rojo) y flechas (origen, destino, sentido)
THE SYSTEM SHALL NOT usar como salida final la prosa de un modelo de visión

### R2 — Braille B8

WHEN el modelo canónico está completo
THE SYSTEM SHALL emitir Unicode B8: R/D/A/C/T, peón sin inicial, casilla letra+número en posición baja, bandos Blancas luego Negras
THE SYSTEM SHALL emitir resaltes y flechas en un bloque posterior, con ⠒⠕ / ⠪⠒

### R3 — Audio

WHEN el usuario activa la lectura
THE SYSTEM SHALL leer en español agrupando por bando y tipo de pieza, al estilo de las págs. 9–12
THE SYSTEM SHALL respetar el orden Blancas → Negras → resaltes → flechas

### R4 — Lector y teclado

WHEN un lector de pantalla recorre la interfaz
THE SYSTEM SHALL exponer un grid 8×8 cuyo nombre de celda incluya casilla, pieza, resalte y flechas
THE SYSTEM SHALL ser operable solo con teclado

### R5 — Acierto

WHEN existe una adaptación de oro del enunciado
THE SYSTEM SHALL comparar renderer y oro en tests automáticos
WHEN la confianza de una casilla es baja
THE SYSTEM SHALL permitir corrección por teclado y re-renderizar sin edición manual de la transcripción
