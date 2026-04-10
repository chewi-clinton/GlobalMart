#!/bin/sh
set -e
echo "Running migrations..."
python manage.py migrate
echo "Seeding warehouses..."
python manage.py seed_warehouses
echo "Starting gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8004 --workers 3 --timeout 120