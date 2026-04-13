# Script para configurar GEMINI_API_KEY en el proyecto
# Ejecutar con: .\configurar_api_key.ps1

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Configurador de Gemini API Key" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si ya existe una key
$envFile = "backend/.env"
if (Test-Path $envFile) {
    $contenido = Get-Content $envFile
    if ($contenido -match "GEMINI_API_KEY=") {
        Write-Host "⚠️  Ya existe una API key configurada" -ForegroundColor Yellow
        $cambiar = Read-Host "¿Quieres cambiarla? (s/n)"
        if ($cambiar -ne "s") {
            Write-Host "Saliendo..." -ForegroundColor Gray
            exit
        }
    }
}

Write-Host "PASO 1: Obtén tu API key gratis" -ForegroundColor Green
Write-Host "--------------------------------" -ForegroundColor Gray
Write-Host "1. Ve a: https://aistudio.google.com/app/apikey" -ForegroundColor White
Write-Host "2. Inicia sesión con tu cuenta de Google" -ForegroundColor White
Write-Host "3. Clic en 'Create API key'" -ForegroundColor White
Write-Host "4. Copia la key (empieza con AIza...)" -ForegroundColor White
Write-Host ""

# Pedir la API key
$apiKey = Read-Host "Pega tu GEMINI_API_KEY aquí"

# Validar que no esté vacía
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "❌ Error: La API key no puede estar vacía" -ForegroundColor Red
    exit 1
}

# Validar formato básico (empieza con AIza)
if (-not ($apiKey -match "^AIza")) {
    Write-Host "⚠️  Advertencia: La key debería empezar con 'AIza'" -ForegroundColor Yellow
    $confirmar = Read-Host "¿Continuar de todos modos? (s/n)"
    if ($confirmar -ne "s") {
        exit 1
    }
}

# Crear el archivo .env
"GEMINI_API_KEY=$apiKey" | Out-File -FilePath $envFile -Encoding UTF8 -Force

Write-Host ""
Write-Host "✅ API Key guardada exitosamente en: $envFile" -ForegroundColor Green
Write-Host ""

# Instrucciones para reiniciar
Write-Host "PASO 2: Reinicia el backend" -ForegroundColor Green
Write-Host "--------------------------------" -ForegroundColor Gray
Write-Host "1. Detén el servidor actual (Ctrl+C)" -ForegroundColor White
Write-Host "2. Ejecuta:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Yellow
Write-Host "   .\venv\Scripts\activate.ps1" -ForegroundColor Yellow
Write-Host "   python main.py" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Abre la app en http://localhost:3000" -ForegroundColor White
Write-Host "4. Sube un CSV y verás los insights de IA! 🚀" -ForegroundColor Cyan
Write-Host ""

# Verificación opcional
$probar = Read-Host "¿Quieres que reinicie el backend automáticamente? (s/n)"
if ($probar -eq "s") {
    Write-Host "Reiniciando backend..." -ForegroundColor Cyan
    
    # Matar procesos de Python existentes
    taskkill /F /IM python.exe 2>$null
    Start-Sleep -Seconds 2
    
    # Iniciar backend
    Set-Location backend
    $env:GEMINI_API_KEY = $apiKey
    .\venv\Scripts\activate.ps1
    python main.py
}
