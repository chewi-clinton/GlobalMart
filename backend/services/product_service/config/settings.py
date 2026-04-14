import os
import sys
import logging
import dj_database_url
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv                  # ← ADDED

load_dotenv()                                   # ← ADDED

# ─── Logging setup ────────────────────────────────────────────────────
logging.basicConfig(
    stream=sys.stdout,
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY")
DEBUG = os.environ.get("DEBUG", "True") == "True"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "*").split(",")

logger.info("Starting product_service...")
logger.info(f"DEBUG={DEBUG}")
logger.info(f"ALLOWED_HOSTS={ALLOWED_HOSTS}")
logger.info(f"DATABASE_URL present: {bool(os.environ.get('DATABASE_URL'))}")
logger.info(f"SECRET_KEY present: {bool(SECRET_KEY)}")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "corsheaders",                              # ← ADDED
    "rest_framework",
    "rest_framework_simplejwt",
    "drf_spectacular",
    # Local
    "apps.product_service",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",    # ← ADDED
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ─── Database ─────────────────────────────────────────────────────────
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    logger.error("DATABASE_URL environment variable is not set!")
    sys.exit(1)

try:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=True,
        )
    }
    logger.info("Database configured successfully")
except Exception as e:
    logger.error(f"Database configuration failed: {e}")
    sys.exit(1)

# ─── REST Framework ───────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
    ),
}

# ─── JWT ──────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(os.environ.get("JWT_ACCESS_TOKEN_LIFETIME_MINUTES", 60))
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=int(os.environ.get("JWT_REFRESH_TOKEN_LIFETIME_DAYS", 7))
    ),
    "ROTATE_REFRESH_TOKENS": False,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "user_id",
    "USER_ID_CLAIM": "user_id",
}

# ─── CORS ─────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "origin",
    "x-requested-with",
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

# ─── drf-spectacular ──────────────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    "TITLE": "GlobalMart Product Service API",
    "DESCRIPTION": "Product management — ICT 3212 Team 10 For Advanced Database",
    "VERSION": "2.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# ─── RabbitMQ ─────────────────────────────────────────────────────────
RABBITMQ_URL = os.environ.get("RABBITMQ_URL")
logger.info(f"RABBITMQ_URL present: {bool(RABBITMQ_URL)}")

# ─── Redis ────────────────────────────────────────────────────────────
REDIS_URL = os.environ.get("REDIS_URL")
logger.info(f"REDIS_URL present: {bool(REDIS_URL)}")

# ─── Cloudflare R2 ────────────────────────────────────────────────────
CLOUDFLARE_R2_ACCOUNT_ID      = os.environ.get("CLOUDFLARE_R2_ACCOUNT_ID")
CLOUDFLARE_R2_ACCESS_KEY_ID   = os.environ.get("CLOUDFLARE_R2_ACCESS_KEY_ID")
CLOUDFLARE_R2_SECRET_ACCESS_KEY = os.environ.get("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
CLOUDFLARE_R2_BUCKET_NAME     = os.environ.get("CLOUDFLARE_R2_BUCKET_NAME")
CLOUDFLARE_R2_PUBLIC_URL      = os.environ.get("CLOUDFLARE_R2_PUBLIC_URL")
logger.info(f"R2 configured: {bool(CLOUDFLARE_R2_ACCOUNT_ID)}")

# ─── Static files ─────────────────────────────────────────────────────
STATIC_URL = "/static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

logger.info("Settings loaded successfully")