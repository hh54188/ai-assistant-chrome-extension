import os
import dotenv
dotenv.load_dotenv()

from notion_client import AsyncClient
import asyncio
import json
from typing import TypedDict

notion = AsyncClient(auth=os.getenv("NOTION_API_KEY"))

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
        - Images are converted to markdown image tags without URLs: ![alt]()
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
            # Add newline before current block if needed
            if previous_block_type and previous_block_type != block_type:
                markdown_lines.append("")
            # Keep image tag but skip URL as per requirement
            markdown_lines.append(f"![{alt_text}]()")
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

if __name__ == "__main__":
    title = asyncio.run(extract_title_from_page("2270cda410a68005b731fec98ea8500a"))
    print(title)
    # asyncio.run(print_article_as_markdown("2910cda410a6802ba735ddab8b768898"))

# Write a function to analyse the markdown content, and pick max 2 tags from the tag options I shared with you. Here are the reuqirements:
# - The function only accept the string markdown as parameters
# - Here are the tag options: 'ai', 'angular', 'architecture', 'backend', 'book', 'code', 'design', 'css', 'flux', 'frontend', 'interview', 'javascript', 'jquery', 'leadership', 'mobx', 'mvc', 'nodejs', 'other', 'performance', 'principle', 'react', 'redux', 'serverless', 'sql', 'vue', 'xss'
# - Dont feed the whole content, it may exceeds the max allowd tokens window, following these steps: 1) Summary each paragrah into max 3 sentences 2) Put all summary together , analyse them and then pick the tag 