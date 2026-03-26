import sys
import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import torch
import torch.nn.functional as F
from PIL import Image
import io
import json
import os
import random
import datetime
from typing import Dict
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
import aiosmtplib
from email.message import EmailMessage
from contextlib import asynccontextmanager
import pandas as pd
import joblib
import time

# Load environment variables
load_dotenv()

# Add backend root to sys.path to allow imports from core
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

# Import our trained CNN
from core.model import SiameseNetwork
from torchvision import transforms

import logging

# Use simple stdout logging for production (captured by Railway logs)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    force=True
)

# --- Global State ---
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = None
senti_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models on startup to save memory if needed
    global model, senti_model
    
    # 1. Face Model
    from core.model import SiameseNetwork
    model = SiameseNetwork(embedding_dim=128).to(device)
    try:
        weights_path = os.path.join(os.path.dirname(__file__), "..", "weights", "siamese_model.pth")
        if os.path.exists(weights_path):
            if hasattr(torch.serialization, 'add_safe_globals'):
                model.load_state_dict(torch.load(weights_path, map_location=device, weights_only=True))
            else:
                model.load_state_dict(torch.load(weights_path, map_location=device))
            logging.info(f"Loaded face weights from {weights_path}")
        else:
            logging.warning(f"Weights not found at {weights_path}. Using random initialization.")
    except Exception as e:
        logging.error(f"Error loading face weights: {e}")
    model.eval()

    # 2. Sentiment Model
    senti_path = os.path.join(os.path.dirname(__file__), "..", "weights", "senti_lr.pkl")
    try:
        if os.path.exists(senti_path):
            senti_model = joblib.load(senti_path)
            logging.info(f"Loaded sentiment model from {senti_path}")
        else:
            logging.warning(f"Sentiment model not found at {senti_path}")
    except Exception as e:
        logging.error(f"Error loading sentiment model: {e}")
        
    yield
    # Clean up on shutdown
    model = None
    senti_model = None

app = FastAPI(title="Face Auth API", lifespan=lifespan)

# Same transform used in training
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# --- OTP Logic ---
# Simple in-memory store: {email: {"otp": str, "expires": datetime}}
otp_store: Dict[str, dict] = {}

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

@app.post("/send-otp")
async def send_otp(request: OTPRequest):
    otp = f"{random.randint(100000, 999999)}"
    expires = datetime.datetime.now() + datetime.timedelta(minutes=5)
    otp_store[request.email] = {"otp": otp, "expires": expires}
    
    # Email configuration
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    
    if not smtp_user or not smtp_password:
        # Fallback for development if no credentials provided
        print(f"[DEVELOPMENT] No SMTP credentials found. OTP for {request.email}: {otp}")
        return {"success": True, "message": "OTP generated (check server logs in dev mode)"}

    print(f"[INFO] Attempting to send OTP to {request.email} via {smtp_host}:{smtp_port}...")

    message = EmailMessage()
    message["From"] = smtp_user
    message["To"] = request.email
    message["Subject"] = "Your Face-Auth Verification Code"
    message.set_content(f"Your verification code is: {otp}\n\nThis code will expire in 5 minutes.")

    try:
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            use_tls=False,
            start_tls=True,
        )
        print(f"[SUCCESS] OTP sent to {request.email}")
        return {"success": True, "message": "OTP sent successfully"}
    except Exception as e:
        print(f"[ERROR] Failed to send email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP email")

@app.post("/verify-otp")
async def verify_otp(request: OTPVerify):
    stored = otp_store.get(request.email)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP found for this email")
    
    if datetime.datetime.now() > stored["expires"]:
        del otp_store[request.email]
        raise HTTPException(status_code=400, detail="OTP has expired")
    
    if stored["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Success - clear OTP
    return {"success": True, "message": "OTP verified"}

@app.post("/embed")
async def embed_face(file: UploadFile = File(...)):
    """
    Accepts an uploaded image and returns a 128-d face embedding array.
    """
    try:
        start_time = time.time()
        contents = await file.read()
        read_time = time.time()
        
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        tensor = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            embedding = model.forward_once(tensor)
        inference_time = time.time()
            
        logging.info(f"Embed Time Breakdown:")
        logging.info(f"  - File Read: {read_time - start_time:.4f}s")
        logging.info(f"  - Model Inference: {inference_time - read_time:.4f}s")
        logging.info(f"  - Total: {inference_time - start_time:.4f}s")
            
        return {"embedding": embedding.cpu().numpy().tolist()[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/verify")
async def verify_face(
    file: UploadFile = File(...), 
    stored_embedding: str = Form(...)
):
    """
    Accepts a live image and a stored embedding string.
    Computes distance and returns biometric verification decision.
    """
    try:
        start_time = time.time()
        # 1. Process live image into embedding
        contents = await file.read()
        read_time = time.time()
        
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        tensor = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            live_embedding = model.forward_once(tensor)
        inference_time = time.time()
            
        # 2. Parse stored embedding
        stored_vector = json.loads(stored_embedding)
        stored_tensor = torch.tensor(stored_vector, dtype=torch.float32).unsqueeze(0).to(device)
        
        # 3. Compute Siamese Network Euclidean Distance
        distance = F.pairwise_distance(live_embedding, stored_tensor).item()
        end_time = time.time()
        
        logging.info(f"Verification Time Breakdown:")
        logging.info(f"  - File Read: {read_time - start_time:.4f}s")
        logging.info(f"  - Model Inference: {inference_time - read_time:.4f}s")
        logging.info(f"  - Vector Comparison: {end_time - inference_time:.4f}s")
        logging.info(f"  - Total: {end_time - start_time:.4f}s")
        
        # Adjust threshold based on your model's contrastive margin. 1.0 is standard.
        THRESHOLD = 1.0 
        
        return {
            "success": True,
            "distance": distance,
            "granted": distance < THRESHOLD
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Sentiment Analysis Endpoint ---
@app.post("/api/predict")
async def predict_sentiment(file: UploadFile = File(...)):
    if not senti_model:
        raise HTTPException(status_code=500, detail="Sentiment analysis model not loaded")
    
    try:
        # Read the CSV file
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        # Validate columns
        required_cols = ['product_name', 'review']
        if not all(col in df.columns for col in required_cols):
            raise HTTPException(status_code=400, detail=f"CSV must contain columns: {required_cols}")

        # Predict sentiment
        df['review'] = df['review'].fillna('no review').astype(str)
        predictions = senti_model.predict(df['review'])
        df['predicted_sentiment'] = predictions
        
        # Map numeric labels to text
        sentiment_map = {0: 'Negative', 1: 'Positive'}
        df['sentiment_label'] = df['predicted_sentiment'].map(sentiment_map)

        # Calculate sentiment distribution
        sentiment_counts = df['sentiment_label'].value_counts().to_dict()

        # Calculate top products by positive sentiment
        top_products = (
            df.groupby('product_name')['predicted_sentiment']
            .mean()
            .sort_values(ascending=False)
            .head(10)
            .to_dict()
        )

        # Get sample predictions
        sample_data = df[['product_name', 'review', 'sentiment_label']].head(20).to_dict('records')

        return {
            'success': True,
            'sentiment_distribution': sentiment_counts,
            'top_products': top_products,
            'sample_predictions': sample_data,
            'total_reviews': len(df)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Production Frontend Serving ---
# This serves the built React app from the 'dist' folder
dist_path = os.path.join(os.path.dirname(__file__), "..", "dist")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if os.path.exists(dist_path):
    # Mount static files (assets, etc.)
    # We don't use html=True here because we want the catch-all to handle index.html for SPA routing
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # If the path looks like a file (has an extension), try to serve it from dist
        file_path = os.path.join(dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise, serve index.html for React Router to handle
        return FileResponse(os.path.join(dist_path, "index.html"))
else:
    @app.get("/")
    async def root_fallback():
        return {"message": "Backend API is active. Frontend build placeholder."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    # Using full module path "app.server:app" for reliable loading in Docker
    uvicorn.run("app.server:app", host="0.0.0.0", port=port, reload=False)
