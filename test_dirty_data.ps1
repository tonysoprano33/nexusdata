# Test upload with real dirty_data.csv file
$API_URL = "https://nexusdata-api.onrender.com"
$CSV_PATH = "E:\pipelines\dirty_data.csv"

try {
    Write-Host "Testing upload with dirty_data.csv..." -ForegroundColor Yellow
    Write-Host "File: $CSV_PATH" -ForegroundColor Gray
    
    if (-not (Test-Path $CSV_PATH)) {
        throw "File not found: $CSV_PATH"
    }
    
    $fileBytes = [System.IO.File]::ReadAllBytes($CSV_PATH)
    Write-Host "File size: $($fileBytes.Length) bytes" -ForegroundColor Gray
    
    # Create multipart form
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $fileContent = [System.IO.File]::ReadAllText($CSV_PATH)
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"provider`"",
        "",
        "gemini",
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"dirty_data.csv`"",
        "Content-Type: text/csv",
        "",
        $fileContent,
        "--$boundary--"
    ) -join $LF
    
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($bodyLines)
    
    Write-Host "`nSending request to $API_URL/api/datasets/upload..." -ForegroundColor Yellow
    
    # Send request
    $response = Invoke-WebRequest -Uri "$API_URL/api/datasets/upload" `
        -Method POST `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $bytes `
        -TimeoutSec 120
    
    Write-Host "`n✅ UPLOAD SUCCESS!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "`n--- RESULT ---" -ForegroundColor Cyan
    Write-Host "ID: $($result.id)" -ForegroundColor White
    Write-Host "Filename: $($result.filename)" -ForegroundColor White
    Write-Host "Status: $($result.status)" -ForegroundColor White
    Write-Host "Row Count: $($result.row_count)" -ForegroundColor White
    Write-Host "Columns: $($result.columns -join ', ')" -ForegroundColor White
    Write-Host "Provider Used: $($result.provider_used)" -ForegroundColor White
    Write-Host "Fallback Used: $($result.fallback_used)" -ForegroundColor White
    
    Write-Host "`n--- INSIGHTS ---" -ForegroundColor Cyan
    if ($result.insights) {
        Write-Host $result.insights -ForegroundColor Gray
    } else {
        Write-Host "NO INSIGHTS GENERATED!" -ForegroundColor Red
    }
    
    Write-Host "`n--- RECOMMENDATIONS ---" -ForegroundColor Cyan
    if ($result.recommendations -and $result.recommendations.Count -gt 0) {
        $result.recommendations | ForEach-Object { Write-Host "• $_" -ForegroundColor Gray }
    } else {
        Write-Host "NO RECOMMENDATIONS!" -ForegroundColor Red
    }
    
    # Save full response for inspection
    $result | ConvertTo-Json -Depth 10 | Out-File "E:\pipelines\last_upload_result.json"
    Write-Host "`nFull response saved to: last_upload_result.json" -ForegroundColor Gray
    
} catch {
    Write-Host "`n❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "HTTP Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody" -ForegroundColor Red
    }
}
