# Túnel HTTPS público hacia localhost:3000 (cámara y PWA).
$ErrorActionPreference = "Stop"
Write-Host "Deja npm.cmd run dev en otra terminal. Este comando publica HTTPS."
npx --yes cloudflared tunnel --url http://127.0.0.1:3000
