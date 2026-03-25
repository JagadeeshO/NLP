# 🚂 Deploy Full Stack on Railway - Complete Guide

## ✅ What's Been Configured

I've set up your project to deploy both frontend and backend together on Railway:

1. ✅ **Flask backend** serves the React frontend
2. ✅ **Nixpacks config** builds both Node.js and Python
3. ✅ **API URL** automatically switches between dev and production
4. ✅ **Static files** served from `frontend/dist`

## 🚀 Deploy Now (3 Steps)

### Step 1: Commit Your Changes

```powershell
git add .
git commit -m "Configure for Railway deployment"
```

### Step 2: Deploy to Railway

```powershell
railway up
```

This will:
- Install Python dependencies
- Install Node.js dependencies
- Build React frontend
- Start Flask server
- Serve everything from one URL! 🎉

### Step 3: Add Domain

```powershell
railway domain
```

Copy the URL (e.g., `https://your-app.up.railway.app`)

## 🎯 Access Your App

Open the Railway URL in your browser - you'll see your beautiful React app!

- **Landing Page**: `https://your-app.railway.app/`
- **Analyzer**: `https://your-app.railway.app/analyzer`
- **API Health**: `https://your-app.railway.app/health`
- **API Predict**: `https://your-app.railway.app/predict`

## 📋 How It Works

```
Railway Server
├── Flask Backend (Python) :5000
│   ├── /predict (API endpoint)
│   ├── /health (Health check)
│   └── /* (Serves React app)
└── React Frontend (Built)
    └── /frontend/dist (Static files)
```

## 🔍 Verify Deployment

1. **Check Health**:
   ```
   https://your-app.railway.app/health
   ```
   Should return: `{"status": "healthy"}`

2. **Check Frontend**:
   ```
   https://your-app.railway.app/
   ```
   Should show your beautiful landing page!

3. **Test Upload**:
   - Navigate to analyzer page
   - Upload a CSV
   - See visualizations!

## 🛠️ Development vs Production

### Local Development (as before):
```bash
# Terminal 1 - Backend
python api.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Frontend runs on `localhost:3000` and connects to `localhost:5000`

### Production (Railway):
Everything runs on one URL from Flask server!

## 📝 Environment Variables (Optional)

If you need environment variables on Railway:

```powershell
railway variables set KEY=VALUE
```

## 🔄 Update Your Deployment

After making changes:

```powershell
git add .
git commit -m "Your changes"
railway up
```

## 🐛 Troubleshooting

### Build Fails?
```powershell
railway logs
```

Common issues:
- Missing `senti_lr.pkl` - Make sure it's committed
- Node version - Uses Node 18 (configured in nixpacks.toml)
- Python version - Uses Python 3.10 (configured in nixpacks.toml)

### Frontend Not Loading?
Check Railway logs for build errors:
```powershell
railway logs --filter build
```

### API Not Working?
1. Check if `senti_lr.pkl` exists
2. Verify requirements.txt has all dependencies
3. Check Flask logs: `railway logs`

### CORS Issues?
Already handled! Flask-CORS is configured in api.py

## 📦 What Files Are Important?

- `nixpacks.toml` - Tells Railway how to build
- `api.py` - Backend + frontend server
- `requirements.txt` - Python dependencies
- `Procfile` - Start command (backup)
- `runtime.txt` - Python version (backup)

## 🎉 Success!

Your app is now live at: **https://your-app.railway.app**

Both frontend and backend running together! 🚀

---

**Quick Commands:**
```bash
railway logs          # View logs
railway open          # Open in browser
railway domain        # Get/set domain
railway variables     # Manage env vars
railway restart       # Restart service
```
