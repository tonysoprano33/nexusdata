# Test upload script
$API_URL = "https://nexusdata-api.onrender.com"

try {
    Write-Host "Testing upload..." -ForegroundColor Yellow
    
    # Create test CSV
    $csvContent = "name,age,city`nAlice,30,NYC`nBob,25,LA`nCharlie,35,Chicago`n"
    $tempFile = [System.IO.Path]::GetTempFileName() + ".csv"
    [System.IO.File]::WriteAllText($tempFile, $csvContent)
    
    Write-Host "Created test file: $tempFile" -ForegroundColor Gray
    Write-Host "File size: $([System.IO.File]::ReadAllBytes($tempFile).Length) bytes" -ForegroundColor Gray
    
    # Create multipart form
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"provider`"",
        "",
        "gemini",
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"test.csv`"",
        "Content-Type: text/csv",
        "",
        [System.IO.File]::ReadAllText($tempFile),
        "--$boundary--"
    ) -join $LF
    
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($bodyLines)
    
    # Send request
    $response = Invoke-WebRequest -Uri "$API_URL/api/datasets/upload" `
        -Method POST `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $bytes `
        -TimeoutSec 120
    
    Write-Host "`n✅ SUCCESS! Status: $($response.StatusCode)" -ForegroundColor Green
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "ID: $($result.id)" -ForegroundColor Cyan
    Write-Host "Status: $($result.status)" -ForegroundColor Cyan
    Write-Host "Row count: $($result.row_count)" -ForegroundColor Cyan
    Write-Host "Insights: $($result.insights.Substring(0, [Math]::Min(100, $result.insights.Length)))..." -ForegroundColor Gray
    
    # Cleanup
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "`n❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
