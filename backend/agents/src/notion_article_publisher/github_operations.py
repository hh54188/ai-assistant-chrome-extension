import os
import base64
import pathlib
import dotenv
dotenv.load_dotenv()

from github import Github
from github import Auth

auth = Auth.Token(os.getenv("GITHUB_API_KEY"))
g = Github(auth=auth)


def create_github_file(file_content: str, file_path: str):
    """
    Creates a new file in the GitHub repository.
    
    This function uses the PyGithub library to create a new file in the
    GitHub repository at https://github.com/hh54188/horace-jekyll-theme-v1.2.0
    on the master branch.
    
    Args:
        file_content (str): The content to write to the file.
        file_path (str): The path to the file within the repository (e.g., "blog/_posts/new-post.md").
    
    Returns:
        dict: A dictionary containing success status and result information.
            - success (bool): Whether the operation was successful
            - message (str): Success or error message
            - commit (dict): Commit information if successful
    
    Example:
        >>> result = create_github_file("# My Blog Post\\n\\nContent here...", "blog/_posts/2025-01-01-new-post.md")
        >>> print(result)
        {'success': True, 'message': 'File created successfully', 'commit': {...}}
    
    Note:
        - Requires GITHUB_API_KEY environment variable to be set
        - Folders are created automatically if they don't exist
        - The file will be committed to the master branch
    """
    try:
        # Get the repository
        repo = g.get_repo("hh54188/horace-jekyll-theme-v1.2.0")
        
        # Create the file
        result = repo.create_file(
            path=file_path,
            message=f"Create {file_path}",
            content=file_content,
            branch="master"
        )
        
        return {
            "success": True,
            "message": "File created successfully",
            "commit": {
                "sha": result["commit"].sha,
                "html_url": result["commit"].html_url
            }
        }
    except Exception as e:
        print(f"❌ Error creating GitHub file: {e}")
        return {
            "success": False,
            "message": f"Failed to create file: {str(e)}"
        }


def create_github_image(local_image_path: str, target_file_path: str):
    """
    Uploads an image file from local filesystem to the GitHub repository.
    
    This function reads a local image file, encodes it to base64, and uploads it
    to the GitHub repository at https://github.com/hh54188/horace-jekyll-theme-v1.2.0
    on the master branch.
    
    Args:
        local_image_path (str): The local file path to the image to upload.
        target_file_path (str): The path to the image file within the repository 
            (e.g., "blog/images/my-image.jpg").
    
    Returns:
        dict: A dictionary containing success status and result information.
            - success (bool): Whether the operation was successful
            - message (str): Success or error message
            - commit (dict): Commit information if successful
    
    Example:
        >>> result = create_github_image("./local/image.jpg", "blog/images/image.jpg")
        >>> print(result)
        {'success': True, 'message': 'Image created successfully', 'commit': {...}}
    
    Note:
        - Requires GITHUB_API_KEY environment variable to be set
        - Requires the local image file to exist
        - Folders are created automatically if they don't exist
        - The image will be committed to the master branch
    """
    try:
        # Convert to absolute path if relative
        if not os.path.isabs(local_image_path):
            script_dir = os.path.dirname(os.path.abspath(__file__))
            local_image_path = os.path.join(script_dir, local_image_path)
        
        # Check if the file exists
        if not os.path.exists(local_image_path):
            error_msg = f"Local image file does not exist: {local_image_path}"
            print(f"❌ Error creating GitHub image: {error_msg}")
            return {
                "success": False,
                "message": error_msg
            }
        
        # Check if it's a file (not a directory)
        if not os.path.isfile(local_image_path):
            error_msg = f"Path is not a file: {local_image_path}"
            print(f"❌ Error creating GitHub image: {error_msg}")
            return {
                "success": False,
                "message": error_msg
            }
        
        # Read the local image file in binary mode
        with open(local_image_path, 'rb') as image_file:
            image_binary = image_file.read()
        
        # Encode the binary image to base64
        image_base64 = base64.b64encode(image_binary).decode('utf-8')
        
        # Get the repository
        repo = g.get_repo("hh54188/horace-jekyll-theme-v1.2.0")
        
        # Create the file
        result = repo.create_file(
            path=target_file_path,
            message=f"Create {target_file_path}",
            content=image_base64,
            branch="master"
        )
        
        return {
            "success": True,
            "message": "Image created successfully",
            "commit": {
                "sha": result["commit"].sha,
                "html_url": result["commit"].html_url
            }
        }
    except Exception as e:
        print(f"❌ Error creating GitHub image: {e}")
        return {
            "success": False,
            "message": f"Failed to create image: {str(e)}"
        }


def upload_folder_to_github(local_folder_path: str, target_repo_path: str):
    """
    Uploads all files from a local folder to the GitHub repository.
    
    This function recursively reads all files from a local folder, encodes them to base64,
    and uploads them to the GitHub repository at https://github.com/hh54188/horace-jekyll-theme-v1.2.0
    on the master branch. The folder structure is preserved in the repository.
    
    Args:
        local_folder_path (str): The local file path to the folder to upload (e.g., "./local/blog").
        target_repo_path (str): The base path within the repository where files will be uploaded
            (e.g., "blog"). Files will maintain their relative paths under this base path.
    
    Returns:
        dict: A dictionary containing success status and result information.
            - success (bool): Whether the operation was successful
            - message (str): Success or error message
            - files_uploaded (int): Number of files successfully uploaded
            - files_failed (int): Number of files that failed to upload
            - failed_files (list): List of file paths that failed to upload
            - commits (list): List of commit information for successfully uploaded files
    
    Example:
        >>> result = upload_folder_to_github("./local/blog", "blog")
        >>> print(result)
        {'success': True, 'message': 'Folder uploaded successfully', 'files_uploaded': 10, ...}
    
    Note:
        - Requires GITHUB_API_KEY environment variable to be set
        - Requires the local folder to exist
        - Folders are created automatically if they don't exist
        - All files will be committed to the master branch
        - Ignores hidden files and directories (starting with .)
        - Uses a single commit per file upload
    """
    try:
        # Get the repository
        repo = g.get_repo("hh54188/horace-jekyll-theme-v1.2.0")
        
        # Convert to pathlib.Path for easier handling
        local_path = pathlib.Path(local_folder_path)
        
        if not local_path.exists():
            return {
                "success": False,
                "message": f"Local folder does not exist: {local_folder_path}",
                "files_uploaded": 0,
                "files_failed": 0,
                "failed_files": [],
                "commits": []
            }
        
        if not local_path.is_dir():
            return {
                "success": False,
                "message": f"Path is not a directory: {local_folder_path}",
                "files_uploaded": 0,
                "files_failed": 0,
                "failed_files": [],
                "commits": []
            }
        
        files_uploaded = 0
        files_failed = 0
        failed_files = []
        commits = []
        
        # Recursively iterate through all files in the folder
        for local_file_path in local_path.rglob('*'):
            # Skip directories and hidden files
            if local_file_path.is_dir() or local_file_path.name.startswith('.'):
                continue
            
            try:
                # Read the file in binary mode
                with open(local_file_path, 'rb') as file:
                    file_binary = file.read()
                
                # Encode the binary file to base64
                file_base64 = base64.b64encode(file_binary).decode('utf-8')
                
                # Calculate the relative path from the local folder
                relative_path = local_file_path.relative_to(local_path)
                
                # Construct the target path in the repository
                target_file_path = str(pathlib.Path(target_repo_path) / relative_path).replace('\\', '/')
                
                # Create the file
                result = repo.create_file(
                    path=target_file_path,
                    message=f"Upload {target_file_path}",
                    content=file_base64,
                    branch="master"
                )
                
                files_uploaded += 1
                commits.append({
                    "sha": result["commit"].sha,
                    "html_url": result["commit"].html_url,
                    "file": target_file_path
                })
                
                print(f"✓ Uploaded: {target_file_path}")
                
            except Exception as e:
                files_failed += 1
                failed_files.append(str(local_file_path))
                print(f"❌ Error uploading {local_file_path}: {e}")
        
        return {
            "success": True,
            "message": f"Folder uploaded successfully: {files_uploaded} files uploaded, {files_failed} files failed",
            "files_uploaded": files_uploaded,
            "files_failed": files_failed,
            "failed_files": failed_files,
            "commits": commits
        }
        
    except Exception as e:
        print(f"❌ Error uploading folder to GitHub: {e}")
        return {
            "success": False,
            "message": f"Failed to upload folder: {str(e)}",
            "files_uploaded": 0,
            "files_failed": 0,
            "failed_files": [],
            "commits": []
        }

