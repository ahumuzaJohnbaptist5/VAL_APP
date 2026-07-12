#!/bin/bash
set -o errexit

# Install pip and upgrade
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Install gunicorn for production
pip install gunicorn

# Collect static files
python manage.py collectstatic --no-input