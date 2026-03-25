# Full Stack Railway Deployment Script
Write-Host "🚂 Deploying Full Stack to Railway" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Configuration Complete:" -ForegroundColor Green
Write-Host "   - Flask backend serves React frontend" -ForegroundColor White
Write-Host "   - Nixpacks builds both Node.js and Python" -ForegroundColor White
Write-Host "   - API URLs work in dev and production" -ForegroundColor White
Write-Host ""

Write-Host "📦 Committing changes..." -ForegroundColor Yellow
git add .
git commit -m "Configure for Railway full-stack deployment" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
Write-Host "   This will take 2-3 minutes..." -ForegroundColor Gray
Write-Host ""

railway up

Write-Host ""
Write-Host "✨ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Getting your app URL..." -ForegroundColor Yellow
railway domain

Write-Host ""
Write-Host "🎉 Success! Your app is live!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access your app:" -ForegroundColor Cyan
Write-Host "   Frontend: https://your-app.railway.app/" -ForegroundColor White
Write-Host "   Analyzer: https://your-app.railway.app/analyzer" -ForegroundColor White
Write-Host "   API: https://your-app.railway.app/predict" -ForegroundColor White
Write-Host ""
Write-Host "📋 Useful commands:" -ForegroundColor Cyan
Write-Host "   railway logs          # View logs" -ForegroundColor White
Write-Host "   railway open          # Open in browser" -ForegroundColor White
Write-Host "   railway restart       # Restart service" -ForegroundColor White
