# Test Production MSSQL API
Write-Host "============================================================"
Write-Host "🧪 TESTING PRODUCTION MSSQL API - ROTIXAI"
Write-Host "============================================================"

$url = "https://rotix-frc58oqfu-fernandos-projects-8346d0e1.vercel.app/api/chat"
$body = '{"question":"vinho"}'
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "📝 Testing query: vinho"
Write-Host "🌐 URL: $url"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -Headers $headers -TimeoutSec 30
    
    Write-Host "✅ Response received successfully!"
    Write-Host ""
    Write-Host "📊 Full Response:"
    $response | ConvertTo-Json -Depth 5
    Write-Host ""
    
    if ($response.answer -and ($response.dbRecords -ne $null)) {
        Write-Host "🎉 SUCCESS: MSSQL API IS WORKING IN PRODUCTION!"
        Write-Host "💬 Answer: $($response.answer)"
        Write-Host "🔍 DB Records Found: $($response.dbRecords)"
        Write-Host "🔎 Search Type: $($response.searchType)"
        if ($response.averagePrice) {
            Write-Host "💰 Average Price: €$($response.averagePrice)"
        }
    } else {
        Write-Host "⚠️ WARNING: Response format doesn't match MSSQL API"
        Write-Host "This might be OpenAI or another provider responding"
    }
    
} catch {
    Write-Host "❌ ERROR occurred:"
    Write-Host "Message: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    }
}

Write-Host ""
Write-Host "============================================================"
Write-Host "✅ TEST COMPLETED"
Write-Host "============================================================"
