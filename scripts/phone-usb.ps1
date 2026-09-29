# Redirige el puerto 3000 del móvil al PC por USB (sin Wi‑Fi).
$ErrorActionPreference = "Stop"
$adb = Join-Path $env:LOCALAPPDATA "Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adb)) { throw "No está adb en $adb" }
& $adb devices
& $adb reverse tcp:3000 tcp:3000
Write-Host ""
Write-Host "En el móvil abre: http://localhost:3000/movil"
Write-Host "Para quitar: adb reverse --remove tcp:3000"
