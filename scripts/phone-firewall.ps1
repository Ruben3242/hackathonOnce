# Regla de firewall para el puerto 3000 (requiere admin).
$ErrorActionPreference = "Stop"
$port = 3000
$existing = Get-NetFirewallRule -DisplayName "TranscriptorB8-3000" -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "La regla ya existe."
  exit 0
}
New-NetFirewallRule -DisplayName "TranscriptorB8-3000" -Direction Inbound -Protocol TCP -LocalPort $port -Action Allow -Profile Private
Write-Host "Puerto $port abierto en red privada."
