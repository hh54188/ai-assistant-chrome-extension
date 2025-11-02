import os
import base64
import pathlib
import shutil
import dotenv
dotenv.load_dotenv()
from .fileDownloader import download_image

from notion_client import AsyncClient
import asyncio
import json
from typing import TypedDict

notion = AsyncClient(auth=os.getenv("NOTION_API_KEY"))

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

class BlockTextMap(TypedDict):
    id: str
    text: str

async def extract_uuid_from_page_url(page_url: str) -> str:
    """
    Extracts the UUID from a Notion page URL.
    
    This function extracts the UUID from a given Notion page URL by parsing the URL and extracting the UUID.
    Handles URLs with query strings and hash fragments by removing them before extraction.
    
    Args:
        page_url (str): The URL of the Notion page to extract the UUID from.
    Returns:
        str: The UUID of the Notion page.
    Example:
        >>> extract_uuid_from_page_url("https://www.notion.so/DONE-E20-AI-23b0cda410a68001b52ad66e1ead92e8")
        "23b0cda410a68001b52ad66e1ead92e8"
        >>> extract_uuid_from_page_url("https://www.notion.so/DONE-E20-AI-23b0cda410a68001b52ad66e1ead92e8?v=123")
        "23b0cda410a68001b52ad66e1ead92e8"
        >>> extract_uuid_from_page_url("https://www.notion.so/DONE-E20-AI-23b0cda410a68001b52ad66e1ead92e8#section")
        "23b0cda410a68001b52ad66e1ead92e8"
    """
    last_path_part = page_url.split("/")[-1]
    # Remove query string and hash if they exist
    last_path_part = last_path_part.split("?")[0].split("#")[0]
    page_id = last_path_part.split("-")[-1]
    return page_id

async def validate_page_exist(page_id: str) -> bool:
    """
    Validates whether a Notion page exists and is accessible.
    
    This function checks if a given Notion page ID corresponds to an existing and 
    accessible page by attempting to retrieve it through the Notion API. This is 
    typically used as a validation step before performing operations on a page.
    
    Args:
        page_id (str): The unique identifier of the Notion page to validate.
            This should be a valid Notion page ID (e.g., "2270cda410a68005b731fec98ea8500a").
            The ID can be found in the page URL or obtained through the Notion API.
    
    Returns:
        bool: True if the page exists and is accessible, False if the page is not 
            found, inaccessible, or an error occurs during retrieval.
    
    Example:
        >>> page_exists = await validate_page_exist("2270cda410a68005b731fec98ea8500a")
        >>> if page_exists:
        >>>     print("Page is valid and accessible")
        >>> else:
        >>>     print("Page not found or inaccessible")
    
    Note:
        - The function requires a valid NOTION_API_KEY environment variable
        - The Notion integration must have read permissions for the page
        - Returns False for any errors including network issues, permission errors, 
          or invalid page IDs
        - Error messages are printed to console in Chinese
        - This is a non-destructive operation that only reads page metadata
    """
    try:
        await notion.pages.retrieve(page_id=page_id)
        return True
    except Exception as e:
        print(f"❌ 未找到页面内容或页面为空: {e}")
        return False


async def extract_text_with_block_id(block_id: str) -> list[BlockTextMap]:
    """
    Recursively extracts text content from a Notion block and all its children blocks.
    
    This function retrieves all text content from various Notion block types including 
    paragraphs, headings (h1, h2, h3), bulleted lists, numbered lists, and quotes. 
    It automatically traverses nested blocks recursively to capture all content in 
    the hierarchy.
    
    Args:
        block_id (str): The ID of the Notion block or page to extract text from.
            This can be either a page ID or a specific block ID.
    
    Returns:
        list[BlockTextMap]: A list of dictionaries, each containing:
            - id (str): The unique identifier of the block
            - text (str): The plain text content extracted from the block
    
    Example:
        >>> blocks = await extract_text_with_block_id("2270cda410a68005b731fec98ea8500a")
        >>> print(blocks)
        [
            {"id": "abc123", "text": "This is a paragraph"},
            {"id": "def456", "text": "This is a heading"}
        ]
    
    Note:
        - Empty blocks (blocks with no text content) are skipped
        - Only text content is extracted; formatting and other properties are ignored
        - The function processes up to 100 blocks per level (Notion API limit)
        - Nested blocks are automatically included in the result
    """
    block_text_list: list[BlockTextMap] = []
    blockResult = await notion.blocks.children.list(
        block_id=block_id,
        page_size=100
    )
    blocks = blockResult.get("results")
    for block in blocks:
        text_to_review = ""
        
        if block.get("type") == "paragraph" and len(block.get("paragraph", {}).get("rich_text", [])) > 0:
            text_to_review = "".join([rt.get("plain_text", "") for rt in block.get("paragraph").get("rich_text")])
        elif block.get("type") == "heading_1" and len(block.get("heading_1", {}).get("rich_text", [])) > 0:
            text_to_review = "".join([rt.get("plain_text", "") for rt in block.get("heading_1").get("rich_text")])
        elif block.get("type") == "heading_2" and len(block.get("heading_2", {}).get("rich_text", [])) > 0:
            text_to_review = "".join([rt.get("plain_text", "") for rt in block.get("heading_2").get("rich_text")])
        elif block.get("type") == "heading_3" and len(block.get("heading_3", {}).get("rich_text", [])) > 0:
            text_to_review = "".join([rt.get("plain_text", "") for rt in block.get("heading_3").get("rich_text")])
        elif block.get("type") == "bulleted_list_item" and len(block.get("bulleted_list_item", {}).get("rich_text", [])) > 0:
            text_to_review = "".join([rt.get("plain_text", "") for rt in block.get("bulleted_list_item").get("rich_text")])
        elif block.get("type") == "numbered_list_item" and len(block.get("numbered_list_item", {}).get("rich_text", [])) > 0:
            text_to_review = "".join([rt.get("plain_text", "") for rt in block.get("numbered_list_item").get("rich_text")])
        elif block.get("type") == "quote" and len(block.get("quote", {}).get("rich_text", [])) > 0:
            text_to_review = "".join([rt.get("plain_text", "") for rt in block.get("quote").get("rich_text")])
        
        if text_to_review:
            block_text_list.append({
                "id": block.get("id"),
                "text": text_to_review
            })
        
        if block.get("has_children"):
            block_text_list.extend(await extract_text_with_block_id(block.get("id")))

    return block_text_list


async def convert_to_markdown(block_id: str) -> str:
    """
    Recursively converts a Notion article to markdown format.
    
    This function retrieves all content from various Notion block types including 
    paragraphs, headings (h1, h2, h3), bulleted lists, numbered lists, quotes, and images.
    It automatically traverses nested blocks recursively to capture all content in 
    the hierarchy and converts them to markdown format.
    
    Args:
        block_id (str): The ID of the Notion block or page to convert to markdown.
            This can be either a page ID or a specific block ID.
    
    Returns:
        str: The markdown formatted content of the article.
    
    Example:
        >>> markdown = await convert_to_markdown("2270cda410a68005b731fec98ea8500a")
        >>> print(markdown)
        # Heading 1
        Some paragraph text
        - Bullet point
        1. Numbered item
        
    Note:
        - Empty blocks (blocks with no text content) are skipped
        - Images are converted to markdown image tags with caption and URL: ![caption](url)
        - The function processes up to 100 blocks per level (Notion API limit)
        - Nested blocks are automatically included in the result
    """
    markdown_lines: list[str] = []
    blockResult = await notion.blocks.children.list(
        block_id=block_id,
        page_size=100
    )
    blocks = blockResult.get("results")
    
    previous_block_type: str | None = None
    
    for block in blocks:
        block_type = block.get("type")
        
        if block_type == "paragraph":
            rich_text = block.get("paragraph", {}).get("rich_text", [])
            if len(rich_text) > 0:
                text = "".join([rt.get("plain_text", "") for rt in rich_text])
                if text:
                    # Add newline before current block if needed
                    if previous_block_type:
                        if previous_block_type == "paragraph":
                            markdown_lines.append("")
                        elif previous_block_type != block_type:
                            markdown_lines.append("")
                    markdown_lines.append(text)
                    previous_block_type = "paragraph"
        
        elif block_type == "heading_1":
            rich_text = block.get("heading_1", {}).get("rich_text", [])
            if len(rich_text) > 0:
                text = "".join([rt.get("plain_text", "") for rt in rich_text])
                if text:
                    # Add newline before current block if needed
                    if previous_block_type and previous_block_type != block_type:
                        markdown_lines.append("")
                    markdown_lines.append(f"# {text}")
                    previous_block_type = "heading_1"
        
        elif block_type == "heading_2":
            rich_text = block.get("heading_2", {}).get("rich_text", [])
            if len(rich_text) > 0:
                text = "".join([rt.get("plain_text", "") for rt in rich_text])
                if text:
                    # Add newline before current block if needed
                    if previous_block_type and previous_block_type != block_type:
                        markdown_lines.append("")
                    markdown_lines.append(f"## {text}")
                    previous_block_type = "heading_2"
        
        elif block_type == "heading_3":
            rich_text = block.get("heading_3", {}).get("rich_text", [])
            if len(rich_text) > 0:
                text = "".join([rt.get("plain_text", "") for rt in rich_text])
                if text:
                    # Add newline before current block if needed
                    if previous_block_type and previous_block_type != block_type:
                        markdown_lines.append("")
                    markdown_lines.append(f"### {text}")
                    previous_block_type = "heading_3"
        
        elif block_type == "bulleted_list_item":
            rich_text = block.get("bulleted_list_item", {}).get("rich_text", [])
            if len(rich_text) > 0:
                text = "".join([rt.get("plain_text", "") for rt in rich_text])
                if text:
                    # Add newline before current block if needed (but not for consecutive list items)
                    if previous_block_type and previous_block_type != "bulleted_list_item":
                        markdown_lines.append("")
                    markdown_lines.append(f"- {text}")
                    previous_block_type = "bulleted_list_item"
        
        elif block_type == "numbered_list_item":
            rich_text = block.get("numbered_list_item", {}).get("rich_text", [])
            if len(rich_text) > 0:
                text = "".join([rt.get("plain_text", "") for rt in rich_text])
                if text:
                    # Add newline before current block if needed (but not for consecutive list items)
                    if previous_block_type and previous_block_type != "numbered_list_item":
                        markdown_lines.append("")
                    markdown_lines.append(f"1. {text}")
                    previous_block_type = "numbered_list_item"
        
        elif block_type == "quote":
            rich_text = block.get("quote", {}).get("rich_text", [])
            if len(rich_text) > 0:
                text = "".join([rt.get("plain_text", "") for rt in rich_text])
                if text:
                    # Add newline before current block if needed
                    if previous_block_type and previous_block_type != block_type:
                        markdown_lines.append("")
                    markdown_lines.append(f"> {text}")
                    previous_block_type = "quote"
        
        elif block_type == "image":
            image_block = block.get("image", {})
            caption = ""
            if image_block.get("caption"):
                caption = "".join([rt.get("plain_text", "") for rt in image_block.get("caption", [])])
            alt_text = caption if caption else "Image"
            
            # Extract image URL (can be from file or external)
            image_url = ""
            if image_block.get("file"):
                image_url = image_block.get("file", {}).get("url", "")
            elif image_block.get("external"):
                image_url = image_block.get("external", {}).get("url", "")
            
            # Add newline before current block if needed
            if previous_block_type and previous_block_type != block_type:
                markdown_lines.append("")
            # Create markdown image tag with caption and URL
            markdown_lines.append(f"![{alt_text}]({image_url})")
            previous_block_type = "image"
        
        elif block_type == "divider":
            # Add newline before current block if needed
            if previous_block_type and previous_block_type != block_type:
                markdown_lines.append("")
            markdown_lines.append("---")
            previous_block_type = "divider"
        
        elif block_type == "code":
            rich_text = block.get("code", {}).get("rich_text", [])
            language = block.get("code", {}).get("language", "")
            if len(rich_text) > 0:
                text = "".join([rt.get("plain_text", "") for rt in rich_text])
                if text:
                    # Add newline before current block if needed
                    if previous_block_type and previous_block_type != block_type:
                        markdown_lines.append("")
                    markdown_lines.append(f"```{language}")
                    markdown_lines.append(text)
                    markdown_lines.append("```")
                    previous_block_type = "code"
        
        # Recursively process children blocks
        if block.get("has_children"):
            child_markdown = await convert_to_markdown(block.get("id"))
            if child_markdown:
                # Split child markdown into lines
                child_lines = child_markdown.split("\n")
                # Remove leading empty lines to avoid double newlines
                while child_lines and child_lines[0] == "":
                    child_lines.pop(0)
                # Remove trailing empty lines
                while child_lines and child_lines[-1] == "":
                    child_lines.pop()
                
                if child_lines:
                    # Only add newline before child content if parent block produced content
                    # and we need spacing (child content handles its own internal spacing)
                    if previous_block_type and markdown_lines and markdown_lines[-1] != "":
                        markdown_lines.append("")
                    # Add child lines
                    markdown_lines.extend(child_lines)
                    # Note: previous_block_type remains unchanged as child content
                    # handles its own internal spacing through recursion
    
    return "\n".join(markdown_lines)


async def extract_title_from_page(page_id: str) -> str | None:
    """
    Extracts the title from a Notion page.
    
    Args:
        page_id (str): The unique identifier of the Notion page.
    
    Returns:
        str | None: The title of the Notion page, or None if not found.
    
    Example:
        >>> title = await extract_title_from_page("2270cda410a68005b731fec98ea8500a")
        >>> print(title)
        "为什么我要写一本AI应用开发图书"
    """
    try:
        page_response = await notion.pages.retrieve(page_id=page_id)
        properties = page_response.get("properties", {})
        title_property = properties.get("title", {})
        title_array = title_property.get("title", [])
        
        if len(title_array) > 0:
            return title_array[0].get("plain_text")
        
        return None
    except Exception as e:
        print(f"❌ 无法提取标题: {e}")
        return None


async def print_article_as_markdown(block_id: str):
    """
    Converts a Notion article to markdown and prints it to the terminal.
    
    Args:
        block_id (str): The ID of the Notion block or page to convert to markdown.
            This can be either a page ID or a specific block ID.
    
    Example:
        >>> await print_article_as_markdown("2270cda410a68005b731fec98ea8500a")
    """
    markdown = await convert_to_markdown(block_id)
    print(markdown)


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

from google.adk.agents.llm_agent import Agent

root_agent = Agent(
    model='gemini-2.5-pro',
    name='notion_article_publisher_agent',
    description="A professional content publisher specialized in publishing Notion articles to Jekyll blog.",
    instruction="""ROLE AND PURPOSE:
You are a professional content publisher specialized in publishing Notion articles to Jekyll blog. Your primary responsibility is to publish Notion articles to Jekyll blog by converting the Notion article to markdown and then commit it to Github codebase.

WORKFLOW:
When given a Notion page ID to publish, follow this systematic approach:
- Before do everything, you need to cleanup the blog folders first, the folders are `blog/_posts` and `blog/images`.
- Convert the Notion article to markdown
- Extract the title from Notion page
- Generate the blog ID based on the title by the following rules:
    - You format the title to a slug string, remove all non-alphanumeric characters and replace spaces with hyphens.
    - You add a prefix "2025-11-02" to the slug string. The prefix is the current date in the format of "YYYY-MM-DD".
    - If the title was chinese, you need to translate it to english sentence first, then format the english sentence to a slug string.
    - You return the slug string as the blog ID.
    - Example:
        - Title: "我是如何解决AI应用开发图书的写作难题的"
        - Blog ID: "2025-11-02-how-i-solve-the-writing-problems-of-ai-application-development-book"
- Download all images from the markdown content with the following steps:
    - Capture the image caption and url first. The images are in the markdown content, and the url is like this: ![caption](url).
    - Decide the file name: The file name should be the caption of the image in english in slug string. If the caption is empty, use incrementing number to name the file.
    - Download the You need to download the images to the `blog/images/[blog_id]` folder.
    - Example:
        - Caption: "AI应用开发图书的封面"
        - File name: "ai-application-development-book-cover.jpg"
        - Caption: ""
        - File name: "1.jpg"
    - After downloading the images, you need to update the markdown content to replace the image url with the new url. The new url is like this: `![caption](../images/[blog_id]/[file_name])`
        - Example:
            - Markdown content:
                ```markdown
                ![AI应用开发图书的封面](https://example.com/image.jpg)
                ```
            - New markdown content:
                ```markdown
                ![AI应用开发图书的封面](../images/2025-11-02-how-i-solve-the-writing-problems-of-ai-application-development-book/ai-application-development-book-cover.jpg)
                ```
    - Delete the last image tag from the markdown content.
- Analyse the markdown content, and pick max 2 tags from the tag options I shared with you. Here are the tag options: 'ai', 'angular', 'architecture', 'backend', 'book', 'code', 'design', 'css', 'flux', 'frontend', 'interview', 'javascript', 'jquery', 'leadership', 'mobx', 'mvc', 'nodejs', 'other', 'performance', 'principle', 'react', 'redux', 'serverless', 'sql', 'vue', 'xss'
- Generate meta info for the Jekyll blog post. The meta info should looks like this:
    ```yaml
    ---
    layout: post
    title: xxx
    tags: [xxx, yyy]
    featured_image: /images/blog_id_xxx/cover.jpg
    ---
    ```
- Insert the meta info at the beginning of the markdown content.
- Create a new file in the blog folder `blog/_posts` with the blog ID. The file name is the blog ID. Write the markdown content updated in the last step to the file.
- Upload the file which created into the GitHub Jekyll blog repo, the repo is https://github.com/hh54188/horace-jekyll-theme-v1.2.0, and the targett path is `_posts/[blog_id].md`
- Upload the images which downloaded in the prevous step into the GitHub Jekyll blog repo, the repo is https://github.com/hh54188/horace-jekyll-theme-v1.2.0, and the target path is `images/[blog_id]`
- If the agent has successfully published all the blog content to GitHub, it should inform the user that the content has been successfully published to the GitHub repository.
""",
    tools=[
        create_folder,
        create_file,
        cleanup_blog_folders,
        create_github_file,
        create_github_image,
        download_image,
        extract_title_from_page,
        convert_to_markdown,
    ]
)

# Usage examples:
# Help me publish the Notion article which ID was 2910cda410a6802ba735ddab8b768898
# if __name__ == "__main__":
#     asyncio.run(print_article_as_markdown("2910cda410a6802ba735ddab8b768898"))
#
# Test GitHub file creation:
# result = create_github_file("# Test Post\n\nThis is a test.", "blog/_posts/test.md")
# print(result)
#
# Test GitHub image upload:
# result = create_github_image("./local/image.jpg", "blog/images/test.jpg")
# print(result)

# Write a function to analyse the markdown content, and pick max 2 tags from the tag options I shared with you. Here are the reuqirements:
# - The function only accept the string markdown as parameters
# - Here are the tag options: 'ai', 'angular', 'architecture', 'backend', 'book', 'code', 'design', 'css', 'flux', 'frontend', 'interview', 'javascript', 'jquery', 'leadership', 'mobx', 'mvc', 'nodejs', 'other', 'performance', 'principle', 'react', 'redux', 'serverless', 'sql', 'vue', 'xss'
# - Dont feed the whole content, it may exceeds the max allowd tokens window, following these steps: 1) Summary each paragrah into max 3 sentences 2) Put all summary together , analyse them and then pick the tag 