# Cómo arrancar

En **PowerShell** de Windows, `npm` a veces falla porque bloquea `npm.ps1`. Usa el `.cmd`:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

O, sin cambiar nada del sistema:

```powershell
npx.cmd next dev --hostname 0.0.0.0
```

- Escritorio: http://localhost:3000
- Móvil / cámara: http://localhost:3000/movil
- Instalar (QR, USB, túnel, APK): http://localhost:3000/instalar
- Manual: http://localhost:3000/ayuda

## Probar en el teléfono

1. Deja `npm.cmd run dev` (o `arrancar.bat`) en el PC.
2. Abre en el PC http://localhost:3000/instalar — verás la IP Wi‑Fi y un QR.
3. En el móvil (misma Wi‑Fi, Chrome o Safari): escanea el QR.

Por `http://IP:3000` funcionan la vista, Foto, Galería, Oír, escribir una corrección y Copiar. La cámara en vivo y el micrófono no, porque esa dirección no es HTTPS.

4. Cámara en vivo y Hablar en el móvil: en otra ventana, `npm.cmd run phone:tunnel`, y abre la URL `https://….trycloudflare.com/movil`.
5. USB: `npm.cmd run phone:usb` solo si ya está `adb` en `%LOCALAPPDATA%\Android\Sdk\platform-tools`.
6. APK: se descarga, pero no se abre. En iOS no hay app; usa Safari.

Si la IP no carga: `npm.cmd run phone:firewall` (como admin) o permite Node en el firewall de Windows. No uses la IP de VirtualBox (`192.168.56.x`).

En el PC, con Chrome o Edge, `arrancar.bat` basta para tableros 1–6, Foto Kaggle, Oír (voz del navegador), Copiar, teclado, dictado, jugadas y la cámara de http://localhost:3000/movil. La voz neural es opcional y puede fallar si Microsoft rechaza la conexión; en ese caso Oír usa la voz del sistema. Gemini es opcional.
