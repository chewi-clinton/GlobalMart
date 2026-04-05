FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --timeout 120 -r requirements.txt

COPY . .

EXPOSE 8002

CMD ["sh", "-c", "python manage.py migrate && python manage.py seed_categories && gunicorn config.wsgi:application --bind 0.0.0.0:8002 --workers 3 --timeout 120"]
