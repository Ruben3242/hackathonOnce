@echo off
setlocal
cd /d "%~dp0"

echo Empaqueta transcriptor-b8-entrega.zip para el profesor.
echo No incluye: .env / .env.local, node_modules, .next, .git, .cursor, data, .venv, builds Android.
echo.

if exist ".env.local" echo [OK] .env.local esta en tu PC y NO se copiara al ZIP.
if exist ".env" echo [OK] .env esta en tu PC y NO se copiara al ZIP.

if exist transcriptor-b8-entrega.zip del /f transcriptor-b8-entrega.zip

tar.exe -a -c -f transcriptor-b8-entrega.zip ^
  --exclude=node_modules --exclude=.next --exclude=out --exclude=.git --exclude=.cursor ^
  --exclude=data --exclude=.venv --exclude=.env.local --exclude=.env ^
  --exclude=android-webview/.gradle --exclude=android-webview/build ^
  --exclude=android-webview/app/build --exclude=android-webview/local.properties ^
  --exclude=.android-sdk --exclude=kaggle.json --exclude=credentials.json ^
  --exclude=public/apk --exclude=__pycache__ ^
  --exclude=transcriptor-b8-entrega.zip --exclude=*.log --exclude=tsconfig.tsbuildinfo ^
  --exclude=*.pyc --exclude=.DS_Store ^
  .

if errorlevel 1 (
  echo Fallo tar. Comprueba que tar.exe existe ^(Windows 10+^).
  pause
  exit /b 1
)

echo.
echo Listo: transcriptor-b8-entrega.zip
echo Abre el ZIP y confirma que NO hay .env.local ni node_modules.
pause
endlocal
