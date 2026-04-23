FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Upgrade SSL-related packages FIRST to fix Cloudflare R2 handshake failures
RUN pip install --no-cache-dir --upgrade pip urllib3 botocore boto3

RUN pip install --no-cache-dir --timeout 120 -r requirements.txt

COPY . .

RUN chmod +x start.sh

EXPOSE 8002

CMD ["./start.sh"]