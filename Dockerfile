# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /web
# Only copy package files first for better caching
COPY web/package*.json ./
# Run install on the container to set correct permissions
RUN npm install
# Copy the rest of the source
COPY web/ ./
# Run build
RUN npm run build

# Stage 2: Build the FastAPI backend
FROM python:3.11-slim

# Install system dependencies for image processing
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install CPU versions of torch/torchvision to save space
COPY backend/requirements.txt .
RUN pip install --no-cache-dir torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy the built frontend to the backend's dist folder for serving
COPY --from=frontend-builder /web/dist ./backend/dist

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080
ENV PYTHONPATH=/app/backend

# Expose port
EXPOSE 8080

# Run the server
CMD ["python", "backend/app/server.py"]
