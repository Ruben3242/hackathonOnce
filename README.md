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

### Demo en el PC (Chrome o Edge)

Con `arrancar.bat` y el navegador en `http://localhost:3000` funcionan, sin Python y sin clave:

1. **Tablero 1–6**: braille, flecha, resaltes, rejilla con flechas del teclado y Enter para cambiar una pieza.
2. **Foto Kaggle 1–3** o un JPEG de [`public/pruebas/`](public/pruebas/): el reconocedor local. No son los botones 1–6.
3. **Oír**: la voz del navegador, en español si Windows o Chrome la tienen. No hace falta Python. En Ajustes de voz se puede probar la neural; si Microsoft la rechaza, el botón vuelve a la voz del navegador.
4. **Copiar**, **corregir escribiendo** y **Hablar** (Chrome o Edge pedirán el micrófono; si no, la corrección se escribe).
5. **Jugadas y verificación**: motor local, sin internet.
6. En el mismo PC, http://localhost:3000/movil también abre la cámara, porque localhost es un contexto seguro.

`npm.cmd test` comprueba el encoder B8. Gemini es opcional (`.env.example`); **sin clave el programa hace todo lo de arriba**.

## Teléfono (Android y iPhone)

1. Deja `arrancar.bat` en marcha.
2. En el PC: http://localhost:3000/instalar
3. En el móvil, misma Wi-Fi, Chrome o Safari: escanea el QR.

Por esa URL (`http://IP:3000`) funcionan la vista, Foto, Galería, Oír, escribir una corrección y Copiar. La cámara en vivo y el micrófono del móvil no: el navegador los bloquea en HTTP.

Para cámara en vivo y Hablar en el móvil, con el servidor ya arrancado, en **otra** ventana:

```powershell
npm.cmd run phone:tunnel
```

Abre en el móvil la URL `https://….trycloudflare.com/movil` que imprima. Hace falta internet.

Si la IP no carga: firewall de Windows (permitir Node), o `npm.cmd run phone:firewall` como administrador. No uses IPs `192.168.56.x` (VirtualBox). El cable USB (`npm.cmd run phone:usb`) solo sirve si ya tienes `adb` del SDK de Android.

El APK se puede descargar, pero **abrirlo no funciona**. No hay aplicación para iOS.

## Cómo analiza las fotos (no se reentrena al arrancar)

El modelo **ya viene entrenado** en el repositorio: `models/piece-centroids.json`.

`arrancar.bat` **no entrena**. Solo instala dependencias de Node y arranca la web. No hace falta Python ni descargar el dataset.

Al subir una imagen que no sea `tablero-1`…`tablero-6`:

1. Localiza el tablero en la foto.
2. Clasifica las 64 casillas con esos pesos, **en el propio PC** (sin internet).
3. Genera braille, voz y tablero táctil.

Los botones **Tablero 1–6** no pasan por el modelo: cargan los ejemplos del enunciado ONCE.

El dataset completo (`data/`, 10 000 JPEG) no está en el repo: solo sirvió para entrenar una vez. Son tableros **sintéticos de 400×400 px**, con **entre 5 y 15 piezas** y posiciones distintas. Lo que se clona es el JSON de pesos y tres fotos de `public/pruebas/`, que son tres de esos archivos.

En ese formato el modelo acierta casi todas las casillas. En las primeras 30 imágenes del directorio de entrenamiento (13 de octubre de 2026) salieron bien 1 896 de 1 920 casillas (98,8 %) y 25 de 30 tableros enteros. Foto Kaggle 1 y Foto Kaggle 2 coinciden en las 64 casillas con el FEN del nombre original; Foto Kaggle 3 falla una. Fuera de ese formato —foto de libro, otra resolución, perspectiva, sombras u otro dibujo de piezas— el acierto baja y hay que corregir a mano o por voz.
