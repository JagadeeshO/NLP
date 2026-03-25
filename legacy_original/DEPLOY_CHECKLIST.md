# ✅ Render Deployment Checklist

Use this checklist before deploying to Render.

## 📋 Pre-Deployment Checklist

### Files & Configuration
- [x] `Dockerfile` exists in root directory
- [x] `render.yaml` exists in root directory
- [x] `requirements.txt` has all Python dependencies
- [x] `frontend/package.json` has all Node dependencies
- [x] `senti_lr.pkl` model file is committed to git
- [x] `.gitignore` doesn't exclude `.pkl` files
- [x] `api.py` has `/api/health` endpoint
- [x] `api.py` has `/api/predict` endpoint
- [x] Frontend uses relative URLs in production mode

### Code Verification
- [x] Frontend build works: `cd frontend && npm run build`
- [x] Backend starts locally: `python api.py`
- [x] Health check works: `curl http://localhost:8000/api/health`
- [x] Static files are served correctly

### Git Repository
- [ ] All changes committed
- [ ] Repository pushed to GitHub/GitLab/Bitbucket
- [ ] `main` branch is up to date

## 🚀 Deployment Steps

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Click "Apply"

3. **Wait for Build** (5-10 minutes)

4. **Test Deployment**
   - Health: `https://your-app.onrender.com/api/health`
   - Frontend: `https://your-app.onrender.com/`
   - Analyzer: `https://your-app.onrender.com/analyzer`

## 🔍 Post-Deployment Verification

- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] Landing page loads correctly
- [ ] Analyzer page loads correctly
- [ ] File upload works
- [ ] Sentiment analysis returns results
- [ ] Charts display correctly
- [ ] Dark mode toggle works

## 📝 Notes

- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Upgrade to paid plan for always-on service

---

**Ready to deploy?** Follow the steps in `RENDER_DEPLOYMENT.md`

