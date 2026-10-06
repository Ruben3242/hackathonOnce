@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo No se encontro Node.js. Instala la version 20 o superior desde https://nodejs.org
  echo y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Primera vez: instalando dependencias. Puede tardar unos minutos...
  call npm.cmd install
  if errorlevel 1 (
    echo Fallo npm install. Comprueba la conexion e Node.js.
    pause
    exit /b 1
  )
)

echo Cerrando un servidor anterior en el puerto 3000 si existiera...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
)

if exist ".next\" (
  echo Limpiando cache .next ^(evita 404 en /movil /ayuda /instalar^)...
  rmdir /s /q ".next"
)

echo.
echo Servidor en http://localhost:3000
echo   Escritorio  http://localhost:3000
echo   Movil       http://localhost:3000/movil
echo   Instalar    http://localhost:3000/instalar  ^(QR e IP para el telefono^)
echo   Manual      http://localhost:3000/ayuda
echo.
echo El telefono debe estar en la MISMA Wi-Fi. Abre /instalar en el PC y escanea el QR.
echo Cierra esta ventana o Ctrl+C para parar.
echo.

start "" "http://localhost:3000"
call npm.cmd run dev
endlocal
