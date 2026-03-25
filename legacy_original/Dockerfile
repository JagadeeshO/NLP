# Build stage for frontend
FROM node:18-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Python stage
FROM python:3.11-slim

WORKDIR /app

# Copy requirements first (better caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY api.py .
COPY senti_lr.pkl .
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Expose port for deployment (Render/Railway)
EXPOSE 8080

# Start application - use bash to expand PORT variable
CMD ["/bin/bash", "-c", "gunicorn api:app --bind 0.0.0.0:${PORT} --workers 2 --timeout 120"]

