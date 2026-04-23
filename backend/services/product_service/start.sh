#!/bin/bash
set -e

echo "Starting product_service..."

python manage.py migrate --noinput || true
python manage.py seed_categories || true
python manage.py collectstatic --noinput --clear || true

exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8002 \
    --workers ${GUNICORN_WORKERS:-3} \
    --worker-class sync \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info