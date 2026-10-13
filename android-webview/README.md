# APK WebView (Android)

El proyecto genera un APK que debería abrir la web en un WebView. En esta entrega **la descarga funciona y abrir la aplicación no**. No hay versión para iOS: en iPhone se usa Safari con la URL del PC.

No dejes una IP concreta de tu casa en `res/values/strings.xml`. El ejemplo del repositorio es `http://192.168.1.10:3000/movil`.

## Generar el APK (consola)

En el PC, con el SDK de Android ya instalado (platform-tools + platforms; no hace falta abrir Studio):

```bat
npm.cmd run apk
```

Eso ejecuta `scripts/build-apk.ps1` (Gradle + JDK) y deja el archivo en `public/apk/transcriptor-b8.apk`. Ese binario no se sube a git.

## Probar sin APK

1. Misma Wi-Fi: `http://<IP>:3000/movil` (QR en `/instalar`). Chrome en Android, Safari en iPhone.
2. USB: `npm.cmd run phone:usb` → en el móvil Android `http://localhost:3000/movil`
3. HTTPS (cámara en vivo): `npm.cmd run phone:tunnel`
