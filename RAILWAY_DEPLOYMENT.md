# 🚂 Railway Deployment Guide

## Prerequisites
- Railway CLI installed
- Git initialized in your project
- GitHub account (optional but recommended)

## Step 1: Install Railway CLI

```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Or using PowerShell
iwr https://railway.app/install.ps1 | iex
```

## Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

## Step 3: Initialize Git Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit for deployment"
```

## Step 4: Create Railway Project

```bash
# Initialize Railway project
railway init

# Link to a new project
railway link
```

## Step 5: Deploy Backend

```bash
# Deploy the backend
railway up

# The backend will be deployed at a Railway URL
```

## Step 6: Get Backend URL

```bash
# Get your backend URL
railway domain
```

Copy the URL (e.g., `https://your-app.railway.app`)

## Step 7: Update Frontend API URL

Update `frontend/src/pages/AnalyzerPage.jsx`:

Change line 53:
```javascript
const response = await fetch('http://localhost:5000/predict', {
```

To:
```javascript
const response = await fetch('https://your-app.railway.app/predict', {
```

Replace `your-app.railway.app` with your actual Railway backend URL.

## Step 8: Build Frontend for Production

```bash
cd frontend
npm run build
```

## Step 9: Deploy Frontend (Option 1 - Vercel)

The easiest way to deploy the React frontend is on Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```

## Step 9: Deploy Frontend (Option 2 - Railway Static)

Or serve the frontend from the same Railway service:

1. Update `api.py` to serve static files:

```python
from flask import Flask, request, jsonify, send_from_directory
import os

# Add this before your routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Set static folder
app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
```

2. Update `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd frontend && npm install && npm run build && cd .. && python api.py"
  }
}
```

## Environment Variables on Railway

If needed, set environment variables:

```bash
railway variables set KEY=VALUE
```

## Useful Railway Commands

```bash
# View logs
railway logs

# Open project in browser
railway open

# Add domain
railway domain

# View environment variables
railway variables

# Restart service
railway restart
```

## Frontend Environment Configuration

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-app.railway.app
```

Then update the fetch call to use:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const response = await fetch(`${API_URL}/predict`, {
```

## Troubleshooting

### Backend not starting?
- Check `railway logs`
- Ensure `senti_lr.pkl` is committed to git
- Verify all dependencies in `requirements.txt`

### CORS errors?
- Backend CORS is already configured in `api.py`
- Ensure your frontend URL is accessible

### Build fails?
- Check Python version in `runtime.txt` matches your local version
- Verify all files are committed to git

## Final Steps

1. ✅ Backend deployed on Railway
2. ✅ Frontend deployed on Vercel/Railway
3. ✅ Update frontend API URL to point to Railway backend
4. ✅ Test the application

Your app should now be live! 🎉

---

**Backend URL**: `https://your-app.railway.app`
**Frontend URL**: `https://your-app.vercel.app` (or Railway domain)
