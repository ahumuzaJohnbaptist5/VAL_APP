#!/usr/bin/env bash
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn whitenoise

# Collect static files (this is what creates the admin CSS/JS)
python manage.py collectstatic --no-input --clear

# Run migrations
python manage.py migrate --no-input