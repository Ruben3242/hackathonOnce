# APK WebView (sin Android Studio)

El APK solo abre la web (`/movil`). Cámara, braille y motor van en el navegador.

## Generar el APK (consola)

En el PC, con el SDK de Android ya instalado (platform-tools + platforms; no hace falta abrir Studio):

```bat
npm.cmd run apk
```

Eso ejecuta `scripts/build-apk.ps1` (Gradle + JDK) y deja el archivo en:

`public/apk/transcriptor-b8.apk`

Luego en el móvil abre `http://<IP-del-PC>:3000/instalar` y descarga el APK.

## Probar sin APK

1. Misma Wi‑Fi: `http://<IP>:3000/movil` (QR en `/instalar`)
2. USB: `npm.cmd run phone:usb` → en el móvil `http://localhost:3000/movil`
3. HTTPS (cámara en vivo): `npm.cmd run phone:tunnel`

Al abrir el APK, pega la URL del PC, por ejemplo `http://10.168.4.156:3000/movil`.
