FROM python:3.11-slim

# Set working directory — all commands run from here inside the container
WORKDIR /app

# Install system dependencies psycopg2 needs libpq to talk to Postgres
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first
# Docker caches this layer — so if requirements.txt hasn't changed
# it won't reinstall everything on every build
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project into the container
COPY . .

EXPOSE 8001