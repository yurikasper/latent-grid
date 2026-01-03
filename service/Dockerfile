FROM python:3.10
# FROM paddlepaddle/paddle:3.2.1
# FROM ubuntu:22.04
#FROM paddlepaddle/paddle:latest-noavx
#FROM paddlecloud/paddleocr:2.6-cpu-latest

# print ubuntu version
#RUN lsb_release -a

# RUN lscpu | grep -i flags
# RUN cat /proc/cpuinfo | grep -o 'avx\|avx2\|sse4.2' | sort -u

# img2table suggested fix: https://github.com/PaddlePaddle/PaddleOCR/discussions/9989#discussioncomment-6642037
# RUN wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.0g-2ubuntu4_amd64.deb && \
#     dpkg -i libssl1.1_1.1.0g-2ubuntu4_amd64.deb && \
#     rm libssl1.1_1.1.0g-2ubuntu4_amd64.deb

RUN apt-get update && apt-get install -y cpuid && \
    cpuid -1 | grep -o "avx\|sse\|fma" | sort -u

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
    wget \
    # python3-pip \
    # python3.10 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN python3 -c "import platform; print(platform.python_version()); import sys; print(sys.executable)"

# Install Python dependencies
RUN python -m pip install paddlepaddle==3.2.1 -i https://www.paddlepaddle.org.cn/packages/stable/cpu/
# RUN pip3 install paddlepaddle==3.2.1 --only-binary=:all: --extra-index-url=https://pypi.tuna.tsinghua.edu.cn/simple
COPY requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Check PaddlePaddle installation
RUN python3 -c "import paddle; print(paddle.__version__); print(paddle.__file__)"

# Pre-download PaddleOCR models at build time
RUN python3 -c "from img2table.ocr import PaddleOCR; PaddleOCR(lang='en'); print('PaddleOCR models cached')"


# Copy the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
