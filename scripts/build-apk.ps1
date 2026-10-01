# Extrae Gradle (si hace falta) y compila el APK WebView sin Android Studio.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$android = Join-Path $root "android-webview"
$sdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$jdk = "C:\Program Files\Java\jdk-21"
$zip = Join-Path $env:TEMP "gradle-8.7-bin.zip"
$gradleHome = Join-Path $env:TEMP "gradle-8.7"
$gradleBat = Join-Path $gradleHome "bin\gradle.bat"

if (-not (Test-Path $sdk)) { throw "No hay Android SDK en $sdk" }
if (-not (Test-Path $jdk)) { throw "No hay JDK en $jdk" }
if (-not (Test-Path $zip)) { throw "Falta $zip. Descarga https://services.gradle.org/distributions/gradle-8.7-bin.zip" }

if (-not (Test-Path $gradleBat)) {
  Write-Host "Extrayendo Gradle..."
  Expand-Archive -Path $zip -DestinationPath $env:TEMP -Force
}
if (-not (Test-Path $gradleBat)) { throw "No se encontró $gradleBat tras extraer" }

$env:ANDROID_HOME = $sdk
$env:JAVA_HOME = $jdk
$env:Path = "$jdk\bin;$sdk\platform-tools;$env:Path"

@"
sdk.dir=$($sdk -replace '\\','\\')
"@ | Set-Content -Encoding ASCII (Join-Path $android "local.properties")

Push-Location $android
try {
  & $gradleBat assembleDebug --no-daemon
  if ($LASTEXITCODE -ne 0) { throw "Gradle falló ($LASTEXITCODE)" }
} finally {
  Pop-Location
}

$built = Join-Path $android "app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $built)) { throw "No se generó $built" }
$destDir = Join-Path $root "public\apk"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null
$dest = Join-Path $destDir "transcriptor-b8.apk"
Copy-Item -Force $built $dest
Write-Host "APK listo: $dest"
Write-Host "En el movil: http://<IP>:3000/instalar"
