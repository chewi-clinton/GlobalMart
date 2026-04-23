"""
Media File Upload Handler
=========================

Handles file uploads to local storage (mapped to Dokploy volume).
All files are persisted in the '/app/media' directory which is 
mounted to the 'product_media' Docker volume.
"""

import os
import uuid
import logging
from django.conf import settings  # ← CRITICAL: Use Django settings!

logger = logging.getLogger(__name__)


def upload_image_to_r2(file, folder="products"):
    """
    Upload an image file to local media storage.
    
    Args:
        file: Uploaded file object (from request.FILES)
        folder: Subfolder within MEDIA_ROOT (default: 'products')
    
    Returns:
        str: URL path to the uploaded file (e.g., '/media/products/abc123.jpg')
    
    Example:
        >>> url = upload_image_to_r2(request.FILES['image'])
        >>> print(url)
        '/media/products/550e8400e29b41d4a716446655440000.jpg'
    """
    # Get file extension safely
    ext = os.path.splitext(file.name)[1].lower()
    if not ext:
        ext = '.jpg'  # Default extension if none found
    
    # Generate unique filename using UUID
    filename = f"{folder}/{uuid.uuid4().hex}{ext}"
    
    # Build full filesystem path using DJANGO SETTINGS (not hardcoded!)
    # This ensures we use /app/media which matches the Dokploy volume mount
    folder_path = os.path.join(settings.MEDIA_ROOT, folder)
    
    # Create directory if it doesn't exist
    os.makedirs(folder_path, exist_ok=True)
    
    # Full path where file will be saved
    file_path = os.path.join(settings.MEDIA_ROOT, filename)
    
    # Write file in chunks (memory-efficient for large files)
    try:
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        logger.info(f"✅ Successfully saved image: {filename}")
        logger.info(f"   Full path: {file_path}")
        logger.info(f"   File size: {os.path.getsize(file_path)} bytes")
        
        # Return URL path (not filesystem path)
        # This will be: /media/products/xxxxx.jpg
        return f"{settings.MEDIA_URL}{filename}"
        
    except Exception as e:
        logger.error(f"❌ Failed to save image: {e}")
        raise


def delete_image_from_r2(image_url):
    """
    Delete an image file from local storage.
    
    Args:
        image_url: URL path of the image (e.g., '/media/products/abc123.jpg')
    
    Returns:
        bool: True if deleted successfully, False otherwise
    """
    if not image_url or settings.MEDIA_URL not in image_url:
        logger.warning(f"⚠️ Invalid image URL format: {image_url}")
        return False
    
    # Extract relative path from URL
    # e.g., '/media/products/abc.jpg' → 'products/abc.jpg'
    key = image_url.replace(settings.MEDIA_URL, '')
    
    # Build full filesystem path
    file_path = os.path.join(settings.MEDIA_ROOT, key)
    
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"🗑️ Successfully deleted: {key}")
            
            # Optionally remove empty parent directories
            parent_dir = os.path.dirname(file_path)
            if os.path.isdir(parent_dir) and not os.listdir(parent_dir):
                os.rmdir(parent_dir)
                logger.info(f"📁 Removed empty directory: {parent_dir}")
            
            return True
        else:
            logger.warning(f"⚠️ File not found for deletion: {file_path}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error deleting file: {e}")
        return False


def get_file_info(image_url):
    """
    Get information about a stored image file.
    
    Args:
        image_url: URL path of the image
    
    Returns:
        dict: File information or None if not found
    """
    if not image_url or settings.MEDIA_URL not in image_url:
        return None
    
    key = image_url.replace(settings.MEDIA_URL, '')
    file_path = os.path.join(settings.MEDIA_ROOT, key)
    
    if not os.path.exists(file_path):
        return None
    
    stat = os.stat(file_path)
    return {
        'path': file_path,
        'size': stat.st_size,
        'size_human': _format_size(stat.st_size),
        'created': stat.st_ctime,
        'modified': stat.st_mtime,
    }


def _format_size(size_bytes):
    """Format file size in human-readable format."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"


# ─── Utility Functions for Testing/Debugging ──────────────────────────

def list_uploaded_files(folder="products"):
    """List all files in a media subfolder."""
    folder_path = os.path.join(settings.MEDIA_ROOT, folder)
    if not os.path.exists(folder_path):
        return []
    
    files = []
    for filename in os.listdir(folder_path):
        filepath = os.path.join(folder_path, filename)
        files.append({
            'name': filename,
            'url': f"{settings.MEDIA_URL}{folder}/{filename}",
            'size': os.path.getsize(filepath),
            'modified': os.path.getmtime(filepath),
        })
    
    return sorted(files, key=lambda x: x['modified'], reverse=True)


def get_storage_stats():
    """Get statistics about media storage usage."""
    total_size = 0
    file_count = 0
    
    for root, dirs, files in os.walk(settings.MEDIA_ROOT):
        for file in files:
            file_path = os.path.join(root, file)
            total_size += os.path.getsize(file_path)
            file_count += 1
    
    return {
        'total_files': file_count,
        'total_size': total_size,
        'total_size_human': _format_size(total_size),
        'media_root': settings.MEDIA_ROOT,
    }