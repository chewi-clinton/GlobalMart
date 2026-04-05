#!/bin/sh
set -e
echo "Running migrations..."
python manage.py migrate
echo "Seeding categories..."
python manage.py seed_categories
echo "Starting gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8002 --workers 3 --timeout 120