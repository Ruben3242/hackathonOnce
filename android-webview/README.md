# APK WebView (sin Android Studio)

El APK solo abre la web (`/movil`). Cámara, braille y motor van en el navegador.

## Generar el APK (consola)

En la raíz del repo (hace falta JDK + Android SDK local, no la GUI de Studio):

```bat
npm.cmd run apk
```

Copia el resultado a `public/apk/transcriptor-b8.apk` (el script ya lo hace). Descarga desde `/instalar`.

## Probar en el móvil

1. `npm.cmd run dev` en el PC.
2. Misma Wi‑Fi → `http://<IP-WiFi>:3000/movil` (mira `/instalar` para QR).
3. O USB: `npm.cmd run phone:usb` y en el móvil `http://localhost:3000/movil`.
4. O HTTPS: `npm.cmd run phone:tunnel`.

Al abrir el APK, pega esa misma URL.
