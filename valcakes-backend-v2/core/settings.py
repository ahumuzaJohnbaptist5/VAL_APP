import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-ba_a-(qy1(fl2=*ya=+$f+h1m30b(v@pe6qf1#pgv=9no39gub'
DEBUG = os.environ.get('RENDER', 'False') != 'True'
# FIX #1: Allow all hosts in development
ALLOWED_HOSTS = ['*']  # Render will set the domain
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]
# We'll add the Vercel URL after deployment
CORS_ALLOW_ALL_ORIGINS = True  # For now, keep it open

AUTH_USER_MODEL = 'users.User'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'corsheaders',
    
    # Local apps
    'users',
    'shop',  # Changed from 'shopping' to match our clean build
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ← THIS MUST BE FIRST!
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# FIX #2: Allow all origins for development (this is the magic fix!)
CORS_ALLOW_ALL_ORIGINS = True

# If you want to be specific, use this instead:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://localhost:5500",
#     "http://127.0.0.1:5500",
# ]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# FIX #3: Add proper permissions
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=7),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

# FIX #4: Proper media settings
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# File upload limits
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Production database settings
if os.environ.get('DATABASE_URL'):
    import dj_database_url
    DATABASES['default'] = dj_database_url.parse(os.environ.get('DATABASE_URL'))