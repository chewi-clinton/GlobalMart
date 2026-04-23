import os
import uuid
import logging
import requests
from requests.auth import HTTPBasicAuth

logger = logging.getLogger(__name__)


def upload_image_to_r2(file, folder="products"):
    ext = os.path.splitext(file.name)[1].lower()
    filename = f"{folder}/{uuid.uuid4().hex}{ext}"

    account_id = os.environ.get('CLOUDFLARE_R2_ACCOUNT_ID')
    access_key = os.environ.get('CLOUDFLARE_R2_ACCESS_KEY_ID')
    secret_key = os.environ.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
    bucket = os.environ.get('CLOUDFLARE_R2_BUCKET_NAME')
    public_url = os.environ.get('CLOUDFLARE_R2_PUBLIC_URL')

    url = f"https://{account_id}.r2.cloudflarestorage.com/{bucket}/{filename}"

    try:
        resp = requests.put(
            url,
            data=file,
            auth=HTTPBasicAuth(access_key, secret_key),
            headers={'Content-Type': file.content_type},
            timeout=30,
        )
        resp.raise_for_status()
        logger.info(f"Uploaded {filename} to R2 - {resp.status_code}")
        return f"{public_url}/{filename}"

    except requests.exceptions.SSLError as e:
        logger.error(f"R2 SSL Error: {e}")
        raise Exception(f"R2 SSL failed: {e}")
    except Exception as e:
        logger.error(f"R2 Error: {e}")
        raise Exception(f"R2 upload failed: {e}")


def delete_image_from_r2(image_url):
    public_url = os.environ.get('CLOUDFLARE_R2_PUBLIC_URL', '')
    if public_url not in image_url:
        return

    account_id = os.environ.get('CLOUDFLARE_R2_ACCOUNT_ID')
    access_key = os.environ.get('CLOUDFLARE_R2_ACCESS_KEY_ID')
    secret_key = os.environ.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
    bucket = os.environ.get('CLOUDFLARE_R2_BUCKET_NAME')

    key = image_url.replace(f"{public_url}/", "")
    url = f"https://{account_id}.r2.cloudflarestorage.com/{bucket}/{key}"

    try:
        resp = requests.delete(url, auth=HTTPBasicAuth(access_key, secret_key), timeout=15)
        logger.info(f"Deleted {key} from R2 - {resp.status_code}")
    except Exception as e:
        logger.warning(f"R2 delete warning: {e}")