import os
import requests
from urllib.parse import urlparse
from pathlib import Path


async def download_image(image_url: str, target_folder: str, filename: str) -> str:
    """
    Downloads an image file from a URL to a target folder.
    
    Args:
        image_url (str): The URL of the image to download.
        target_folder (str): The folder path where the image should be saved.
            Can be absolute or relative to the script directory.
        filename (str): The filename to save the image as. If the filename doesn't 
            have an extension, the detected extension will be appended.
    
    Returns:
        str: The full path to the downloaded image file.
    
    Raises:
        ValueError: If image_url, target_folder, or filename are invalid.
        Exception: If the download fails or the URL is invalid.
    
    Example:
        >>> file_path = await download_image('https://example.com/image.jpg', './images', 'my_image')
        >>> print(file_path)
        './images/my_image.jpg'
        
        >>> file_path = await download_image('https://example.com/image.jpg', './images', 'my_image.png')
        >>> print(file_path)
        './images/my_image.png'
    """
    try:
        # Validate inputs
        if not image_url or not isinstance(image_url, str):
            raise ValueError('Image URL is required and must be a string')
        
        if not target_folder or not isinstance(target_folder, str):
            raise ValueError('Target folder is required and must be a string')
        
        if not filename or not isinstance(filename, str):
            raise ValueError('Filename is required and must be a string')
        
        # Resolve target folder path
        if os.path.isabs(target_folder):
            resolved_target_folder = target_folder
        else:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            resolved_target_folder = os.path.join(script_dir, target_folder)
        
        # Create target directory if it doesn't exist
        os.makedirs(resolved_target_folder, exist_ok=True)
        
        # Download the image
        response = requests.get(image_url, stream=True)
        response.raise_for_status()
        
        # Determine file extension from Content-Type header or URL
        content_type = response.headers.get('content-type', '')
        extension = ''
        
        if content_type:
            mime_to_ext = {
                'image/jpeg': '.jpg',
                'image/jpg': '.jpg',
                'image/png': '.png',
                'image/gif': '.gif',
                'image/webp': '.webp',
                'image/bmp': '.bmp',
                'image/svg+xml': '.svg',
                'image/tiff': '.tiff',
                'image/x-icon': '.ico',
                'image/avif': '.avif'
            }
            # Extract base MIME type (handle charset, etc.)
            base_content_type = content_type.split(';')[0].strip().lower()
            extension = mime_to_ext.get(base_content_type, '')
        
        # If no extension from Content-Type, try to extract from URL
        if not extension:
            parsed_url = urlparse(image_url)
            url_path = parsed_url.path
            url_ext = os.path.splitext(url_path)[1].lower()
            valid_image_exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.ico', '.avif']
            if url_ext in valid_image_exts:
                extension = url_ext
            else:
                # Default to .jpg if no extension found
                extension = '.jpg'
        
        # Use provided filename, append extension if not present
        if os.path.splitext(filename)[1]:
            # Filename has extension, use it as is
            final_filename = filename
        else:
            # Filename doesn't have extension, append the detected extension
            final_filename = f"{filename}{extension}"
        
        file_path = os.path.join(resolved_target_folder, final_filename)
        
        # Save the image
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Image downloaded successfully: {file_path}")
        return file_path
        
    except Exception as error:
        print(f"Error downloading image: {error}")
        raise

