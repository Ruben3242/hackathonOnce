# Compila el APK WebView SIN abrir Android Studio (Gradle + SDK local).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$android = Join-Path $root "android-webview"
$sdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$jdk = "C:\Program Files\Java\jdk-21"
if (-not (Test-Path $jdk)) {
  $javacCmd = Get-Command javac -ErrorAction SilentlyContinue
  if ($javacCmd -and $javacCmd.Source) { $jdk = Split-Path (Split-Path $javacCmd.Source) }
}
if (-not (Test-Path $sdk)) { throw "No hay Android SDK en $sdk. Instala solo 'Command line tools' o platform-tools+platforms desde developer.android.com (sin Studio)." }
if (-not (Test-Path $jdk)) { throw "No hay JDK. Instala Temurin/Oracle JDK 17+" }

$env:ANDROID_HOME = $sdk
$env:JAVA_HOME = $jdk
$env:Path = "$jdk\bin;$sdk\platform-tools;$env:Path"

@"
sdk.dir=$($sdk -replace '\\','\\')
"@ | Set-Content -Encoding ASCII (Join-Path $android "local.properties")

Push-Location $android
try {
  & .\gradlew.bat assembleDebug --no-daemon
  if ($LASTEXITCODE -ne 0) { throw "Gradle falló ($LASTEXITCODE)" }
} finally {
  Pop-Location
}

$built = Join-Path $android "app\build\outputs\apk\debug\app-debug.apk"
$destDir = Join-Path $root "public\apk"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null
$dest = Join-Path $destDir "transcriptor-b8.apk"
Copy-Item -Force $built $dest
Write-Host "APK listo: $dest"
Write-Host "Descárgalo en el móvil desde http://<IP>:3000/instalar"
