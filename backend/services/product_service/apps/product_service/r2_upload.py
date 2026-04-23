import os
import uuid
import logging

logger = logging.getLogger(__name__)

MEDIA_ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'media')
MEDIA_URL = '/media/'


def upload_image_to_r2(file, folder="products"):
    ext = os.path.splitext(file.name)[1].lower()
    filename = f"{folder}/{uuid.uuid4().hex}{ext}"

    folder_path = os.path.join(MEDIA_ROOT, folder)
    os.makedirs(folder_path, exist_ok=True)

    file_path = os.path.join(MEDIA_ROOT, filename)

    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    logger.info(f"Saved {filename} locally")
    return f"{MEDIA_URL}{filename}"


def delete_image_from_r2(image_url):
    if MEDIA_URL not in image_url:
        return

    key = image_url.replace(MEDIA_URL, '')
    file_path = os.path.join(MEDIA_ROOT, key)

    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Deleted {key}")
    except Exception as e:
        logger.warning(f"Delete warning: {e}")