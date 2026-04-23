
FROM python:3.12-slim

WORKDIR /app

ARG CACHEBUST=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    ca-certificates \
    libssl-dev \
    libssl3 \
    openssl \
    && update-ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV OPENSSL_CONF=/etc/ssl/openssl_r2.cnf

COPY requirements.txt .
RUN pip install --no-cache-dir --timeout 120 -r requirements.txt && pip install --no-cache-dir --upgrade urllib3 certifi minio

COPY . .
RUN chmod +x start.sh

EXPOSE 8002
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

CMD ["./start.sh"]
