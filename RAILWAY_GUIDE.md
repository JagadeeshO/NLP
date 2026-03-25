# Hosting Guide - Railway

This project is now configured for a **unified deployment** on Railway. This means a single container will host both your FastAPI backend and your React frontend.

## 🚀 Steps to Host

### 1. Push to GitHub
Make sure all your latest changes (including the new `Dockerfile` and `railway.json`) are pushed to your GitHub repository:
```powershell
git add .
git commit -m "Add Railway deployment config"
git push origin main
```

### 2. Create a Railway Project
1. Go to [Railway.app](https://railway.app/) and log in.
2. Click **+ New Project**.
3. Select **Deploy from GitHub repo**.
4. Choose your `NLP` (or `Product-Review-Analysis-master`) repository.

### 3. Configure Environment Variables
Railway will need the same `.env` variables you use locally. Go to the **Variables** tab in your Railway service and add:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase anon/public key |
| `SMTP_USER` | Your Gmail address (for OTP) |
| `SMTP_PASSWORD` | Your Gmail App Password |
| `PORT` | `8080` (Railway usually sets this automatically) |

### 4. Deploy
Once the variables are set, Railway will automatically trigger a build using the `Dockerfile`.
- **Build Stage**: It will install Node.js, build your React app, then install Python and your AI dependencies.
- **Deploy Stage**: It will start the FastAPI server which will serve your frontend at the root URL.

## 🔍 Verification
After deployment:
1. Railway will provide a public URL (e.g., `https://your-project.up.railway.app`).
2. Open it in your browser.
3. You should see the **Biometric Auth** screen immediately.
4. Verify that you can still login and access the **Sentiment Analyzer**.

> [!TIP]
> Since we are using the **CPU version** of PyTorch in the Dockerfile, the feature comparison might be slightly slower than on a high-end local machine, but it will fit within Railway's memory limits.
