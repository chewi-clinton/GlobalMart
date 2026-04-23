# ─── IMPORTS ─────────────────────────────────────────────────────────────────────
import ssl
import urllib3.util.ssl_ as _urllib3_ssl
import urllib3.connection as _urllib3_conn

# Patch urllib3 to allow more ciphers (fixes SSLV3_ALERT_HANDSHAKE_FAILURE on
# Python 3.12 / Debian bookworm where OpenSSL defaults to SECLEVEL=2)
_orig_create_urllib3_context = _urllib3_ssl.create_urllib3_context

def _patched_create_urllib3_context(*args, **kwargs):
    ctx = _orig_create_urllib3_context(*args, **kwargs)
    try:
        ctx.set_ciphers('DEFAULT@SECLEVEL=1')
    except ssl.SSLError:
        pass
    return ctx

_urllib3_ssl.create_urllib3_context = _patched_create_urllib3_context
_urllib3_conn.create_urllib3_context = _patched_create_urllib3_context
# ─────────────────────────────────────────────────────────────────────────────

import os
import uuid
import logging
from django.conf import settings
from minio import Minio

logger = logging.getLogger(__name__)


def get_r2_client():
    # MinIO takes the bare hostname; secure=True adds HTTPS automatically.
    # Cloudflare R2 endpoint format: <account_id>.r2.cloudflarestorage.com
    return Minio(
        endpoint=f"{settings.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        access_key=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secret_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        secure=True,
    )


def upload_image_to_r2(file, folder="products"):
    """
    Upload an image file to Cloudflare R2 using MinIO SDK.
    Returns the public URL of the uploaded file.
    """
    ext = os.path.splitext(file.name)[1].lower()
    filename = f"{folder}/{uuid.uuid4().hex}{ext}"

    client = get_r2_client()

    try:
        client.put_object(
            bucket_name=settings.CLOUDFLARE_R2_BUCKET_NAME,
            object_name=filename,
            data=file,
            length=file.size,
            content_type=file.content_type,
        )
    except Exception as e:
        logger.error(f"MinIO upload failed: {e}")
        raise Exception(f"Image upload to R2 failed: {e}")

    return f"{settings.CLOUDFLARE_R2_PUBLIC_URL}/{filename}"


def delete_image_from_r2(image_url):
    """
    Delete an image from Cloudflare R2 by its public URL.
    """
    try:
        if settings.CLOUDFLARE_R2_PUBLIC_URL in image_url:
            key = image_url.replace(f"{settings.CLOUDFLARE_R2_PUBLIC_URL}/", "")
            client = get_r2_client()
            client.remove_object(
                bucket_name=settings.CLOUDFLARE_R2_BUCKET_NAME,
                object_name=key,
            )
    except Exception as e:
        logger.warning(f"MinIO delete failed: {e}")
