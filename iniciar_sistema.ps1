#!/usr/bin/env powershell
<#
.SYNOPSIS
    Script de inicio automático para NexusData AI
.DESCRIPTION
    Inicia el backend y frontend del sistema automáticamente
.EXAMPLE
    .\iniciar_sistema.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    🚀 NEXUSDATA AI                           ║
║                                                              ║
║              Iniciando sistema automáticamente...              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Verificar que existan los directorios
if (-not (Test-Path "./backend")) {
    Write-Error "❌ Directorio 'backend' no encontrado. Ejecuta desde la raíz del proyecto."
    exit 1
}

if (-not (Test-Path "./frontend")) {
    Write-Error "❌ Directorio 'frontend' no encontrado. Ejecuta desde la raíz del proyecto."
    exit 1
}

# Función para verificar si un puerto está en uso
function Test-PortInUse {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Verificar puertos
Write-Host "🔍 Verificando puertos..." -ForegroundColor Yellow

if (Test-PortInUse -Port 8000) {
    Write-Warning "⚠️  Puerto 8000 ocupado. Intentando liberar..."
    $process = Get-NetTCPConnection -LocalPort 8000 | Select-Object -First 1
    if ($process) {
        Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

if (Test-PortInUse -Port 3000) {
    Write-Warning "⚠️  Puerto 3000 ocupado. Intentando liberar..."
    $process = Get-NetTCPConnection -LocalPort 3000 | Select-Object -First 1
    if ($process) {
        Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# Iniciar Backend
Write-Host "`n🖥️  Iniciando Backend (FastAPI)..." -ForegroundColor Green
$backendPath = Resolve-Path "./backend"
$backendCmd = "cd '$backendPath'; .\venv\Scripts\activate.ps1; python main.py"

try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal
    Write-Host "   ✅ Backend iniciando en http://localhost:8000" -ForegroundColor Green
} catch {
    Write-Error "❌ Error al iniciar backend: $_"
    exit 1
}

# Esperar un momento para que el backend inicie
Write-Host "   ⏳ Esperando inicialización (3s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Verificar que el backend responde
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/" -TimeoutSec 5
    Write-Host "   ✅ Backend respondiendo correctamente" -ForegroundColor Green
} catch {
    Write-Warning "⚠️  Backend no responde todavía, puede tardar unos segundos más..."
}

# Iniciar Frontend
Write-Host "`n🎨 Iniciando Frontend (Next.js)..." -ForegroundColor Green
$frontendPath = Resolve-Path "./frontend"
$frontendCmd = "cd '$frontendPath'; npm run dev"

try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal
    Write-Host "   ✅ Frontend iniciando en http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Error "❌ Error al iniciar frontend: $_"
    exit 1
}

# Mensaje final
Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    ✅ SISTEMA INICIADO                       ║
║                                                              ║
║  🖥️  Backend:  http://localhost:8000                         ║
║  🎨 Frontend:  http://localhost:3000                          ║
║                                                              ║
║  📖 Documentación:                                           ║
║     • GUIA_RAPIDA.md - Cómo usar el sistema                  ║
║     • API_DOCUMENTATION.md - Documentación API               ║
║     • README.md - Información completa                        ║
║                                                              ║
║  🧪 Testing:                                                 ║
║     python test_api_endpoints.py                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "💡 Tip: Abre http://localhost:3000 en tu navegador para empezar" -ForegroundColor Yellow
Write-Host "⚠️  Nota: Las ventanas de terminal permanecerán abiertas para monitoreo`n" -ForegroundColor Gray
