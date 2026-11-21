# VAL Cakes

Django REST backend in `valcakes-backend-v2/`, static storefront in `valcakes-html/`.

## Local development (PowerShell)

Use Python 3.12 (Django 6 requires 3.12+).

```powershell
cd valcakes-backend-v2
uv venv --python 3.12
uv pip install -r requirements.txt
$env:DJANGO_DEBUG = "true"
.\.venv\Scripts\Activate.ps1
$env:SECRET_KEY = python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
python manage.py migrate
python manage.py createsuperuser
python manage.py test
python manage.py runserver
```

Serve the frontend separately on port 5500 (do not open HTML via file://).

## Production rollout (before merging)

- Back up the existing database and uploaded media. The committed SQLite snapshot, Python environment and generated static assets are removed from the branch only; previous Git history still contains them. Review whether private data was exposed and arrange authorized history cleanup separately.
- Rotate the previously committed Django secret and any exposed credentials. Existing sessions/tokens may require login again.
- Set SECRET_KEY, DATABASE_URL, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS (actual frontend origin), CSRF_TRUSTED_ORIGINS if needed, BREVO_SMTP_USER, BREVO_SMTP_PASSWORD, DEFAULT_FROM_EMAIL and STAFF_NOTIFICATION_EMAIL in production. Set DJANGO_ENV=production outside Render. Use Python 3.12+ (the legacy Render blueprint specifies 3.11 and must be updated before a new deployment). Do not deploy until these settings are ready.
- Configure durable media storage and migrate existing uploads before deploying; local media is not served in production. Keep existing images backed up.
- Access tokens default to 60 minutes; users must sign in again on expiry until automatic refresh is implemented. Throttling uses the default local cache; use shared cache for multiple production workers.
- Verify registration, login, cart checkout, quote, customer approval, owner dashboard and emails on staging before merge.
