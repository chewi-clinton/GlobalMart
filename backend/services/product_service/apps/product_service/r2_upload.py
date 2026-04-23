import os
import uuid
import logging
import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

logger = logging.getLogger(__name__)


def get_s3_client():
    """
    Initialize S3 client for Cloudflare R2 using boto3.
    
    Network Configuration:
    - Uses S3-compatible API endpoint
    - Path-style addressing for R2 compatibility
    - SSL verification disabled to bypass handshake issues
    - Signature v4 for authentication
    """
    account_id = os.environ.get('CLOUDFLARE_R2_ACCOUNT_ID')
    
    return boto3.client(
        's3',
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ.get('CLOUDFLARE_R2_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
        region_name='auto',
        config=Config(
            s3={'addressing_style': 'path'},
            signature_version='s3v4',
            connect_timeout=10,
            read_timeout=30,
            retries={'max_attempts': 3, 'mode': 'standard'},
        ),
        verify=False,
    )


def upload_image_to_r2(file, folder="products"):
    """
    Upload an image file to Cloudflare R2.
    
    Args:
        file: Django UploadedFile object
        folder: Subfolder path (default: "products")
    
    Returns:
        str: Public URL of uploaded file
    
    Raises:
        Exception: If upload fails
    """
    ext = os.path.splitext(file.name)[1].lower()
    filename = f"{folder}/{uuid.uuid4().hex}{ext}"
    
    bucket_name = os.environ.get('CLOUDFLARE_R2_BUCKET_NAME')
    public_url = os.environ.get('CLOUDFLARE_R2_PUBLIC_URL')
    
    client = get_s3_client()
    
    try:
        client.put_object(
            Bucket=bucket_name,
            Key=filename,
            Body=file,
            ContentType=file.content_type,
            ContentLength=file.size,
            Metadata={'original-name': file.name},
        )
        
        logger.info(f"Uploaded {filename} to R2 bucket {bucket_name}")
        return f"{public_url}/{filename}"
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        logger.error(f"R2 ClientError [{error_code}]: {e}")
        raise Exception(f"R2 upload failed ({error_code}): {e}")
        
    except BotoCoreError as e:
        logger.error(f"R2 BotoCoreError: {e}")
        raise Exception(f"R2 connection failed: {e}")
        
    except Exception as e:
        logger.error(f"R2 unexpected error: {e}")
        raise Exception(f"Image upload failed: {e}")


def delete_image_from_r2(image_url):
    """
    Delete an image from Cloudflare R2 by its public URL.
    
    Args:
        image_url: Full public URL of the image
    """
    public_url = os.environ.get('CLOUDFLARE_R2_PUBLIC_URL', '')
    bucket_name = os.environ.get('CLOUDFLARE_R2_BUCKET_NAME')
    
    if not public_url in image_url:
        logger.warning(f"URL does not match R2 public URL, skipping delete")
        return
    
    key = image_url.replace(f"{public_url}/", "")
    
    client = get_s3_client()
    
    try:
        client.delete_object(Bucket=bucket_name, Key=key)
        logger.info(f"Deleted {key} from R2")
        
    except Exception as e:
        logger.warning(f"R2 delete failed for {key}: {e}")