FROM python:3.12-slim

WORKDIR /app

ARG CACHEBUST=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY requirements.txt .
RUN pip install --no-cache-dir --timeout 120 -r requirements.txt

COPY . .
RUN chmod +x start.sh

VOLUME ["/app/media"]

EXPOSE 8002

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

CMD ["./start.sh"]