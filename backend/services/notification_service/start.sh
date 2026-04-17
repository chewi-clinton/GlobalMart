#!/bin/sh
set -e
echo "Running migrations..."
python manage.py migrate
echo "Starting services..."
python manage.py start_consumer &
exec gunicorn config.wsgi:application --bind 0.0.0.0:8007 --workers 2 --timeout 120