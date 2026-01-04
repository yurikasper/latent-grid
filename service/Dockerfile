FROM python:3.13

# Install system dependencies required for PaddlePaddle and OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libx11-6 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
RUN python -m pip install paddlepaddle==3.2.1 -i https://www.paddlepaddle.org.cn/packages/stable/cpu/
COPY requirements.txt .
RUN pip install --no-cache-dir --break-system-packages -r requirements.txt

# Pre-download PaddleOCR models at build time
RUN python -c "from img2table.ocr import PaddleOCR; PaddleOCR(lang='en'); print('PaddleOCR models cached')"

# Copy the application code
COPY . .

# Disable model hoster connectivity checks (models are already cached)
ENV PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK True

# Expose the port the app runs on
EXPOSE 8000

# Add a health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
