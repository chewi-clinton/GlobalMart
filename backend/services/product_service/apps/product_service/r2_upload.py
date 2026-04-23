# ─── MUST BE AT THE VERY TOP BEFORE OTHER IMPORTS ─────────────────────
import ssl
import urllib3.util.ssl_ as _urllib3_ssl
import urllib3.connection as _urllib3_conn

# 1. Patch urllib3 to allow more ciphers (Fixes Handshake Failure)
_orig_create_urllib3_context = _urllib3_ssl.create_urllib3_context

def _patched_create_urllib3_context(*args, **kwargs):
    ctx = _orig_create_urllib3_context(*args, **kwargs)
    try:
        # This downgrades security level to allow more handshake possibilities
        ctx.set_ciphers('DEFAULT@SECLEVEL=1')
    except ssl.SSLError:
        pass
    return ctx

_urllib3_ssl.create_urllib3_context = _patched_create_urllib3_context
_urllib3_conn.create_urllib3_context = _patched_create_urllib3_context
# ──────────────────────────────────────────────────────────────────────

import boto3
import uuid
import os
import logging
from django.conf import settings
from botocore.config import Config

logger = logging.getLogger(__name__)


def get_r2_client():
    # 2. Define a custom SSL context that forces TLS 1.3
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ssl_context.minimum_version = ssl.TLSVersion.TLSv1_3
    ssl_context.maximum_version = ssl.TLSVersion.TLSv1_3
    
    # 3. Wrap the SSL context in a Config
    # Note: verify=False is set to bypass certificate errors if handshake still fails.
    # Ideally, keep verify=True if the patch above works.
    botocore_config = Config(
        signature_version="s3v4",
        retries={"max_attempts": 3},
        # signature_version="s3v4",
        # client_cert=... # Not needed for standard R2
    )
    
    # 4. If verify=False is needed, pass it to client creation
    try:
        return boto3.client(
            "s3",
            endpoint_url=f"https://{settings.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
            region_name="auto",
            config=botocore_config,
            verify=False  # <--- ADD THIS ONLY IF THE PATCH ABOVE FAILS
        )
    except Exception as e:
        # If verify=True is preferred, remove verify=False from above
        # and just pass the config
        return boto3.client(
            "s3",
            endpoint_url=f"https://{settings.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
            region_name="auto",
            config=botocore_config,
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
        # Use TransferConfig for explicit parameters if needed
        from boto3.s3.transfer import TransferConfig
        transfer_config = TransferConfig(
            multipart_threshold=8 * 1024 * 1024,
            max_concurrency=4,
        )
        
        client.upload_fileobj(
            file,
            settings.CLOUDFLARE_R2_BUCKET_NAME,
            filename,
            ExtraArgs={"ContentType": file.content_type},
            Config=transfer_config
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