#!/bin/sh
set -e
echo "Running migrations..."
python manage.py migrate
echo "Starting gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8005 --workers 3 --timeout 120