import os
import uuid
import logging
import requests

logger = logging.getLogger(__name__)


def _get_r2_headers(content_type):
    account_id = os.environ.get('CLOUDFLARE_R2_ACCOUNT_ID')
    access_key = os.environ.get('CLOUDFLARE_R2_ACCESS_KEY_ID')
    secret_key = os.environ.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
    
    from datetime import datetime, timezone
    import hmac
    import hashlib
    import base64
    
    now = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    date_stamp = datetime.now(timezone.utc).strftime('%Y%m%d')
    
    def sign(key, msg):
        return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()
    
    def get_signature_key():
        k_date = sign(('AWS4' + secret_key).encode('utf-8'), date_stamp)
        k_region = sign(k_date, 'auto')
        k_service = sign(k_service, 's3')
        return sign(k_signing, 'aws4_request')
    
    payload_hash = hashlib.sha256(b'UNSIGNED-PAYLOAD').hexdigest()
    
    canonical_request = f"PUT\n/{bucket}/{key}\n\nhost:{host}\nx-amz-content-sha256:{payload_hash}\nx-amz-date:{now}\n\nhost;x-amz-content-sha256;x-amz-date\n{payload_hash}"
    
    credential_scope = f"{date_stamp}/auto/s3/aws4_request"
    string_to_sign = f"AWS4-HMAC-SHA256\n{now}\n{credential_scope}\n{hashlib.sha256(canonical_request.encode()).hexdigest()}"
    
    signing_key = get_signature_key()
    signature = hmac.new(signing_key, string_to_sign.encode(), hashlib.sha256).hexdigest()
    
    authorization = f"AWS4-HMAC-SHA256 Credential={access_key}/{credential_scope}, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature={signature}"
    
    return {
        'Host': host,
        'x-amz-content-sha256': payload_hash,
        'x-amz-date': now,
        'Authorization': authorization,
        'Content-Type': content_type,
    }


def upload_image_to_r2(file, folder="products"):
    ext = os.path.splitext(file.name)[1].lower()
    filename = f"{folder}/{uuid.uuid4().hex}{ext}"
    
    account_id = os.environ.get('CLOUDFLARE_R2_ACCOUNT_ID')
    access_key = os.environ.get('CLOUDFLARE_R2_ACCESS_KEY_ID')
    secret_key = os.environ.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
    bucket = os.environ.get('CLOUDFLARE_R2_BUCKET_NAME')
    public_url = os.environ.get('CLOUDFLARE_R2_PUBLIC_URL')
    host = f"{account_id}.r2.cloudflarestorage.com"
    url = f"https://{host}/{bucket}/{key}"
    
    headers = {
        'Content-Type': file.content_type,
    }
    
    try:
        resp = requests.put(
            url,
            data=file,
            headers=headers,
            auth=(access_key, secret_key),
            timeout=30,
        )
        resp.raise_for_status()
        
        logger.info(f"Uploaded {filename} to R2 - Status: {resp.status_code}")
        return f"{public_url}/{filename}"
        
    except requests.exceptions.SSLError as e:
        logger.error(f"R2 SSL Error: {e}")
        raise Exception(f"R2 SSL connection failed: {e}")
        
    except requests.exceptions.RequestException as e:
        logger.error(f"R2 Request Error: {e}")
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
    host = f"{account_id}.r2.cloudflarestorage.com"
    url = f"https://{host}/{bucket}/{key}"
    
    try:
        resp = requests.delete(
            url,
            auth=(access_key, secret_key),
            timeout=15,
        )
        logger.info(f"Deleted {key} from R2 - Status: {resp.status_code}")
        
    except Exception as e:
        logger.warning(f"R2 delete warning: {e}")