# ─── MUST BE AT THE VERY TOP BEFORE OTHER IMPORTS ─────────────────────
import ssl
import functools

# urllib3 v2+ ignores DEFAULT_CIPHERS; patch create_default_context instead.
# Required to fix SSLV3_ALERT_HANDSHAKE_FAILURE with Cloudflare R2 on Python 3.12.
_orig_create_default_context = ssl.create_default_context

@functools.wraps(_orig_create_default_context)
def _patched_create_default_context(*args, **kwargs):
    ctx = _orig_create_default_context(*args, **kwargs)
    ctx.set_ciphers('DEFAULT@SECLEVEL=1')
    return ctx

ssl.create_default_context = _patched_create_default_context
# ──────────────────────────────────────────────────────────────────────

import boto3
import uuid
import os
import logging
from django.conf import settings
from botocore.config import Config

logger = logging.getLogger(__name__)


def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(
            signature_version="s3v4",
            retries={"max_attempts": 3},
        ),
    )


def upload_image_to_r2(file, folder="products"):
    """
    Upload an image file to Cloudflare R2.
    Returns the public URL of the uploaded file.
    """
    ext = os.path.splitext(file.name)[1].lower()
    filename = f"{folder}/{uuid.uuid4().hex}{ext}"

    client = get_r2_client()
    
    try:
        client.upload_fileobj(
            file,
            settings.CLOUDFLARE_R2_BUCKET_NAME,
            filename,
            ExtraArgs={"ContentType": file.content_type},
        )
    except Exception as e:
        logger.error(f"R2 upload failed: {e}")
        raise Exception(f"Image upload to R2 failed: {e}")

    return f"{settings.CLOUDFLARE_R2_PUBLIC_URL}/{filename}"


def delete_image_from_r2(image_url):
    """
    Delete an image from Cloudflare R2 by its public URL.
    """
    try:
        key = image_url.replace(f"{settings.CLOUDFLARE_R2_PUBLIC_URL}/", "")
        client = get_r2_client()
        client.delete_object(
            Bucket=settings.CLOUDFLARE_R2_BUCKET_NAME,
            Key=key,
        )
    except Exception as e:
        logger.warning(f"R2 delete failed: {e}")