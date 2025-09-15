# Quick test of the backend API
$url = "http://localhost:5000/api/auth/login"
$body = @{
    username = "p001"
    password = "patient123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0, 50))..." -ForegroundColor Cyan
    Write-Host "User Role: $($response.user.role)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}