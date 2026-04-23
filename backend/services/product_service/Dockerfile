FROM python:3.12-slim

WORKDIR /app


ARG CACHEBUST=1

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --timeout 120 -r requirements.txt

COPY . .

RUN chmod +x start.sh

EXPOSE 8002

CMD ["./start.sh"]