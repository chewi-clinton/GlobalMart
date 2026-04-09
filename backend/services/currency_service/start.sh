#!/bin/sh
set -e
echo "Running migrations..."
python manage.py migrate
echo "Seeding currencies..."
python manage.py seed_currencies
echo "Starting gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8003 --workers 3 --timeout 120