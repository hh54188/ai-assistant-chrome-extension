import os
import shutil


def create_file(file_name: str, file_content: str):
    """
    Creates a file in the folder where the Python file is running.
    
    Args:
        file_name (str): The name of the file to create.
        file_content (str): The content to write to the file.
    
    Example:
        >>> create_file("example.txt", "Hello, World!")
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, file_name)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(file_content)


def insert_content_at_beginning(target_file_path: str, new_content: str):
    """
    Inserts new content at the beginning of the target file.
    
    This function reads the existing content of the file, prepends the new content
    to it, and writes the combined content back to the file. If the file does not
    exist, it will be created with only the new content.
    
    Args:
        target_file_path (str): The path to the target file where content will be inserted.
            This can be a relative or absolute path.
        new_content (str): The content to insert at the beginning of the file.
    
    Example:
        >>> insert_content_at_beginning("example.txt", "New header\\n")
        >>> # If example.txt contains "Old content", it will become:
        >>> # "New header\\nOld content"
    
    Note:
        - The file encoding is UTF-8
        - If the file does not exist, it will be created
        - Existing file content is preserved after the new content
    """
    try:
        # Read existing content if file exists
        if os.path.exists(target_file_path):
            with open(target_file_path, 'r', encoding='utf-8') as f:
                existing_content = f.read()
            # Combine new content with existing content
            combined_content = new_content + existing_content
        else:
            # File doesn't exist, use only new content
            combined_content = new_content
        
        # Write the combined content back to the file
        with open(target_file_path, 'w', encoding='utf-8') as f:
            f.write(combined_content)
    except Exception as e:
        print(f"❌ Error inserting content at beginning of file: {e}")
        raise


def create_folder(folder_name: str):
    """
    Creates a folder in the folder where the Python file is running.
    
    Args:
        folder_name (str): The name of the folder to create.
    
    Example:
        >>> create_folder("my_folder")
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    folder_path = os.path.join(script_dir, folder_name)
    os.makedirs(folder_path, exist_ok=True)


def cleanup_blog_folders():
    """
    Deletes all markdown files in the blog/_posts folder and all folders in the blog/images folder.
    
    This function is useful for cleaning up old blog posts and images before publishing new content.
    It deletes:
    - All .md files in the blog/_posts directory
    - All subdirectories in the blog/images directory
    
    Returns:
        dict: A dictionary containing:
            - success (bool): Whether the operation was successful
            - message (str): Success or error message
            - files_deleted (int): Number of markdown files deleted
            - folders_deleted (int): Number of image folders deleted
    
    Example:
        >>> result = cleanup_blog_folders()
        >>> print(result)
        {'success': True, 'message': 'Cleanup completed successfully', 'files_deleted': 5, 'folders_deleted': 3}
    
    Note:
        - The .gitkeep file in blog/_posts is preserved
        - The blog/images directory itself is preserved
        - Individual files within blog/images subdirectories are deleted along with their folders
    """
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        posts_dir = os.path.join(script_dir, "blog", "_posts")
        images_dir = os.path.join(script_dir, "blog", "images")
        
        files_deleted = 0
        folders_deleted = 0
        
        # Delete all markdown files in blog/_posts
        if os.path.exists(posts_dir):
            for file_name in os.listdir(posts_dir):
                file_path = os.path.join(posts_dir, file_name)
                # Only delete .md files, skip .gitkeep and other files
                if file_name.endswith('.md') and os.path.isfile(file_path):
                    os.remove(file_path)
                    files_deleted += 1
                    print(f"✓ Deleted: {file_path}")
        
        # Delete all folders in blog/images
        if os.path.exists(images_dir):
            for item_name in os.listdir(images_dir):
                item_path = os.path.join(images_dir, item_name)
                # Only delete directories, skip files
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                    folders_deleted += 1
                    print(f"✓ Deleted folder: {item_path}")
        
        return {
            "success": True,
            "message": f"Cleanup completed successfully",
            "files_deleted": files_deleted,
            "folders_deleted": folders_deleted
        }
    except Exception as e:
        print(f"❌ Error cleaning up blog folders: {e}")
        return {
            "success": False,
            "message": f"Failed to cleanup blog folders: {str(e)}",
            "files_deleted": 0,
            "folders_deleted": 0
        }

