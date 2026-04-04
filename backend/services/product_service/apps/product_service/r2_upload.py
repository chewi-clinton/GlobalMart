import boto3
import uuid
import os
from django.conf import settings


def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )


def upload_image_to_r2(file, folder="products"):
    """
    Upload an image file to Cloudflare R2.
    Returns the public URL of the uploaded file.
    """
    ext = os.path.splitext(file.name)[1].lower()
    filename = f"{folder}/{uuid.uuid4().hex}{ext}"

    client = get_r2_client()
    client.upload_fileobj(
        file,
        settings.CLOUDFLARE_R2_BUCKET_NAME,
        filename,
        ExtraArgs={"ContentType": file.content_type},
    )

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
        import logging
        logging.getLogger(__name__).warning(f"R2 delete failed: {e}")