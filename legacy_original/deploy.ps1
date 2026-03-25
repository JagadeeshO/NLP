# Railway Deployment Script
Write-Host "🚂 Product Review Analyzer - Railway Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
Write-Host "Checking Railway CLI..." -ForegroundColor Yellow
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayInstalled) {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    Write-Host "Run: npm install -g @railway/cli" -ForegroundColor Yellow
    Write-Host "Or: iwr https://railway.app/install.ps1 | iex" -ForegroundColor Yellow
    exit
} else {
    Write-Host "✅ Railway CLI found" -ForegroundColor Green
}

# Check if git is initialized
Write-Host ""
Write-Host "Checking Git repository..." -ForegroundColor Yellow
if (-not (Test-Path .git)) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository exists" -ForegroundColor Green
}

# Add and commit files
Write-Host ""
Write-Host "Staging files for commit..." -ForegroundColor Yellow
git add .
git commit -m "Prepare for Railway deployment" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Ready to deploy! Run the following commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Login to Railway:" -ForegroundColor White
Write-Host "   railway login" -ForegroundColor Green
Write-Host ""
Write-Host "2. Initialize Railway project:" -ForegroundColor White
Write-Host "   railway init" -ForegroundColor Green
Write-Host ""
Write-Host "3. Deploy to Railway:" -ForegroundColor White
Write-Host "   railway up" -ForegroundColor Green
Write-Host ""
Write-Host "4. Get your backend URL:" -ForegroundColor White
Write-Host "   railway domain" -ForegroundColor Green
Write-Host ""
Write-Host "5. Update frontend API URL in:" -ForegroundColor White
Write-Host "   frontend/src/pages/AnalyzerPage.jsx (line 53)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 See RAILWAY_DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan"
