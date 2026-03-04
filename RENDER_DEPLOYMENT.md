# 🚀 Render Deployment Guide

Complete guide to deploy your Product Review Sentiment Analyzer on Render.

## ✅ What's Configured

Your project is now ready for Render deployment with:
- ✅ **Dockerfile** - Multi-stage build for frontend and backend
- ✅ **render.yaml** - Render Blueprint configuration
- ✅ **Health check endpoint** - `/api/health`
- ✅ **Static file serving** - Flask serves React frontend
- ✅ **Environment variables** - PORT and PYTHONUNBUFFERED configured

## 🚀 Quick Deploy (3 Methods)

### Method 1: Render Blueprint (Recommended - Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **Deploy via Render Dashboard**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Click "Apply" to deploy

3. **Done!** Your app will be live in 5-10 minutes.

### Method 2: Manual Web Service

1. **Go to Render Dashboard**
   - Sign up/Login at [render.com](https://render.com)
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub/GitLab/Bitbucket repository
   - Select the repository and branch

3. **Configure Service**
   - **Name**: `product-review-analyzer` (or your choice)
   - **Environment**: `Docker`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (root of repo)
   - **Dockerfile Path**: `Dockerfile` (default)
   - **Docker Context**: `.` (default)

4. **Environment Variables** (Auto-set by render.yaml, but verify):
   - `PORT`: `8080` (Render sets this automatically)
   - `PYTHONUNBUFFERED`: `1`

5. **Health Check Path**: `/api/health`

6. **Plan**: Choose `Starter` (free tier) or higher

7. **Click "Create Web Service"**

8. **Wait for Build** (5-10 minutes)
   - Render will:
     - Build the frontend (Node.js)
     - Install Python dependencies
     - Build the Docker image
     - Deploy the service

9. **Get Your URL**
   - Once deployed, you'll get a URL like: `https://product-review-analyzer.onrender.com`

### Method 3: Render CLI

```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# Deploy
render deploy
```

## 📋 Deployment Checklist

Before deploying, ensure:

- [ ] `senti_lr.pkl` is committed to git (model file)
- [ ] `requirements.txt` has all dependencies
- [ ] `frontend/package.json` has all dependencies
- [ ] `render.yaml` is in the root directory
- [ ] `Dockerfile` is in the root directory
- [ ] Repository is pushed to GitHub/GitLab/Bitbucket

## 🔍 Verify Deployment

Once deployed, test these endpoints:

1. **Health Check**:
   ```
   https://your-app.onrender.com/api/health
   ```
   Should return: `{"status": "healthy"}`

2. **Frontend Landing Page**:
   ```
   https://your-app.onrender.com/
   ```
   Should show your beautiful landing page

3. **Analyzer Page**:
   ```
   https://your-app.onrender.com/analyzer
   ```
   Should show the file upload interface

4. **API Endpoint**:
   ```
   POST https://your-app.onrender.com/api/predict
   ```
   Upload a CSV file to test sentiment analysis

## 🎯 How It Works

```
Render Server
├── Docker Container
│   ├── Frontend (React) - Built and served from /frontend/dist
│   ├── Backend (Flask) - Serves API and static files
│   │   ├── /api/predict (POST) - Sentiment analysis
│   │   ├── /api/health (GET) - Health check
│   │   └── /* (Serves React app)
│   └── Model: senti_lr.pkl
└── Port: 8080 (auto-assigned by Render)
```

## 🔧 Environment Variables

Render automatically sets:
- `PORT` - Port number (usually 8080 or 10000)
- `PYTHONUNBUFFERED` - Set to 1 for proper logging

You can add custom environment variables in Render dashboard:
- Go to your service → Environment → Add Environment Variable

## 📊 Monitoring & Logs

### View Logs
1. Go to your service in Render dashboard
2. Click "Logs" tab
3. View real-time logs

### Monitor Performance
- Render dashboard shows:
  - CPU usage
  - Memory usage
  - Request metrics
  - Response times

## 🐛 Troubleshooting

### Build Fails?

**Error: "Cannot find senti_lr.pkl"**
- Ensure `senti_lr.pkl` is committed to git
- Check `.gitignore` doesn't exclude `.pkl` files

**Error: "npm install failed"**
- Check `frontend/package.json` is valid
- Verify Node.js version (18+)

**Error: "pip install failed"**
- Check `requirements.txt` syntax
- Verify Python version (3.11)

### App Not Starting?

**Check Logs:**
```bash
# In Render dashboard → Logs
# Look for errors like:
- "Port already in use"
- "Module not found"
- "File not found"
```

**Common Issues:**
1. **Port mismatch**: Render sets PORT automatically, Dockerfile handles it
2. **Missing dependencies**: Check requirements.txt
3. **Model file missing**: Ensure senti_lr.pkl is in repo

### CORS Errors?

- CORS is already configured in `api.py`
- If issues persist, check Render service URL matches frontend

### Slow Cold Starts?

- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Upgrade to paid plan for always-on service

## 💰 Pricing

### Free Tier
- ✅ 750 hours/month (enough for always-on)
- ✅ 512 MB RAM
- ✅ Shared CPU
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Limited bandwidth

### Paid Plans
- **Starter**: $7/month - Always on, better performance
- **Standard**: $25/month - More resources
- **Pro**: Custom pricing - Production ready

## 🔄 Auto-Deploy

Render automatically deploys when you push to your connected branch:
1. Push to `main` branch
2. Render detects changes
3. Builds and deploys automatically
4. Your app updates in 5-10 minutes

## 📝 Custom Domain

1. Go to your service → Settings → Custom Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate auto-provisioned

## 🎉 Success!

Once deployed, your app will be live at:
```
https://your-app-name.onrender.com
```

### Test Your Deployment

1. **Landing Page**: Visit the root URL
2. **Upload CSV**: Go to `/analyzer` and upload a test file
3. **Check Results**: Verify charts and predictions work

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Docker on Render](https://render.com/docs/docker)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Health Checks](https://render.com/docs/health-checks)

---

**Need Help?**
- Check Render logs for errors
- Review this guide
- Check Render documentation
- Contact Render support

Made with ❤️ for Render deployment

