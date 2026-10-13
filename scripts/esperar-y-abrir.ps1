# Espera a que Next responda y abre el navegador. arrancar.bat lo lanza en paralelo.
$deadline = (Get-Date).AddSeconds(90)
while ((Get-Date) -lt $deadline) {
  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -ge 200) {
      Start-Process "http://localhost:3000"
      exit 0
    }
  } catch {
    Start-Sleep -Seconds 1
  }
}
Write-Host "El servidor no respondio a tiempo. Abre http://localhost:3000 cuando la ventana de Node diga Ready."
exit 1
