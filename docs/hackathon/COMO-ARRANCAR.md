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
- Instalar PWA o APK: http://localhost:3000/instalar
- Manual: http://localhost:3000/ayuda

En el teléfono (misma Wi‑Fi): `http://IP-DEL-PC:3000/movil`.

- Carga tablero 1–6 o sube `public/diagramas/tablero-2.svg`.
- **Leer en voz alta** usa el TTS del navegador.
- **Copiar transcripción** pega el texto del campo 15.
- El grid se recorre con flechas; Enter cambia la pieza.
- El panel de jugadas verifica material y propone la mejor continuación.

Los textos del formulario están en `docs/hackathon/formulario-sprint2.md`.
