# =============================================================================
# Script de Arranque Rápido para Demostración en Vivo
# Bot Triage Comercial InterChile
# =============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🚀 INICIANDO BOT TRIAGE INTERCHILE (DEMO HITO 2)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Comprobar que existe .env
if (-not (Test-Path .env)) {
    Write-Host "❌ Archivo .env no encontrado." -ForegroundColor Red
    Exit 1
}

# 2. Levantar el servidor Node.js en segundo plano
Write-Host "`n1. Levantando servidor Express en puerto 3000..." -ForegroundColor Yellow
$serverProcess = Start-Process node -ArgumentList "src/server.js" -PassThru

Start-Sleep -Seconds 2

# 3. Abrir el Dashboard en el navegador
Write-Host "2. Abriendo Dashboard en http://localhost:3000/dashboard..." -ForegroundColor Yellow
Start-Process "http://localhost:3000/dashboard"

# 4. Levantar el túnel Cloudflare
Write-Host "`n3. Iniciando túnel Cloudflare para WhatsApp Webhook..." -ForegroundColor Yellow
Write-Host "⚠️  COPIA LA URL https://xxxx.trycloudflare.com Y PÉGALA EN META (Configuración > Webhook)" -ForegroundColor Magenta
Write-Host "Presiona Ctrl+C para detener la sesión cuando termines la demo.`n" -ForegroundColor Gray

try {
    cloudflared tunnel --url http://localhost:3000
} finally {
    Write-Host "`nDeteniendo servidor Express..." -ForegroundColor Gray
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Servidor detenido. ¡Demo finalizada con éxito!" -ForegroundColor Green
}
