# 🚀 Quick Start Guide

## Prerequisites Check
- ✅ Python 3.8 or higher installed
- ✅ Node.js 16 or higher installed
- ✅ `senti_lr.pkl` model file in project root

## Step-by-Step Setup

### 1️⃣ Backend Setup (Terminal 1)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start Flask backend
python api.py
```

**Expected Output:** 
```
* Running on http://127.0.0.1:5000
```

### 2️⃣ Frontend Setup (Terminal 2 - New Window)

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies (first time only)
npm install

# Start React development server
npm run dev
```

**Expected Output:**
```
Local: http://localhost:3000
```

### 3️⃣ Open Application

Open your browser and go to: **http://localhost:3000**

## 🎨 Features to Try

1. **Toggle Dark Mode** - Click moon/sun icon in top right
2. **Upload CSV** - Drag & drop or click to browse
3. **View Analytics** - See beautiful charts and predictions
4. **Interactive Elements** - Hover over cards and buttons for animations

## 📁 Sample CSV Format

Create a CSV file with these columns:

```csv
product_name,review
iPhone 14,Amazing phone with great camera quality!
Samsung Galaxy,Battery life is disappointing
MacBook Pro,Best laptop I've ever owned
Dell Laptop,Too expensive for the features
```

## 🐛 Troubleshooting

**Backend won't start?**
- Make sure `senti_lr.pkl` is in the project root
- Check if port 5000 is already in use

**Frontend shows connection error?**
- Ensure backend is running on port 5000
- Check browser console for CORS issues

**Animations not smooth?**
- Update your browser to the latest version
- Try disabling browser extensions

## 🎯 Next Steps

- Test with your own review data
- Explore both light and dark themes
- Share feedback with Aditya!

---

Made with ❤️ using Python & ML
