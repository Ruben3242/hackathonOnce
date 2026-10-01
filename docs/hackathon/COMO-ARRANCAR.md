# Cómo arrancar (Sprint 2)

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

## Probar en el teléfono (sin Android Studio)

1. Deja `npm.cmd run dev` en el PC.
2. Abre en el PC http://localhost:3000/instalar — verás la IP Wi‑Fi y un QR.
3. En el móvil (misma Wi‑Fi): escanea el QR o escribe `http://IP:3000/movil`.
4. Alternativas:
   - USB: `npm.cmd run phone:usb` → en el móvil `http://localhost:3000/movil`
   - HTTPS (cámara en vivo): `npm.cmd run phone:tunnel`
   - APK: `npm.cmd run apk` y luego descarga desde `/instalar`

Si la IP no carga: `npm.cmd run phone:firewall` (como admin) o permite Node en el firewall de Windows. No uses la IP de VirtualBox (`192.168.56.x`).

- Carga tablero 1–6 o sube `public/diagramas/tablero-2.svg`.
- **Oír** usa voz neural (o sistema / Gemini).
- **Copiar transcripción** pega el texto del campo 15.
- El grid se recorre con flechas; Enter cambia la pieza.
- El panel de jugadas verifica material y propone la mejor continuación.

Los textos del formulario están en `docs/hackathon/formulario-sprint2.md`.
