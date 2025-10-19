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

async def add_comment(blockId: str, comment: str) -> bool:
    """
    Adds a text comment to a specific Notion block.
    
    This function creates a new comment attached to a Notion block using the Notion API.
    Comments are useful for providing feedback, suggestions, or corrections on specific
    parts of a Notion page without modifying the original content.
    
    Args:
        blockId (str): The unique identifier of the Notion block to add the comment to.
            This should be a valid Notion block ID (e.g., "abc123-def456-ghi789").
        comment (str): The text content of the comment to be added.
            This will be displayed as plain text in the Notion interface.
    
    Returns:
        bool: True if the comment was successfully added, False if an error occurred.
    
    Example:
        >>> success = await add_comment("abc123-def456", "Great point! Consider adding more examples.")
        >>> if success:
        >>>     print("Comment added successfully")
    
    Note:
        - The function requires a valid NOTION_API_KEY environment variable
        - The Notion integration must have comment permissions on the workspace
        - The blockId must exist and be accessible by the integration
        - Errors are caught and logged, returning False on failure
    """
    try:
        await notion.comments.create(
            parent={"block_id": blockId},
            rich_text=[
                {
                    "type": "text",
                    "text": {
                        "content": comment
                    }
                }
            ]
        )
        print(f"✅ 已为块 {blockId} 添加评论")
        return True
    except Exception as e:
        print(f"❌ 添加评论失败 (块 {blockId}): {str(e)}")
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



from google.adk.agents.llm_agent import Agent


root_agent = Agent(
    model='gemini-2.5-pro',
    name='notion_article_reviewer_agent',
    description="A professional content reviewer and editorial assistant specialized in analyzing Notion articles. Your primary responsibility is to provide constructive feedback on written content by reviewing article structure, clarity, grammar, coherence, and overall quality. You deliver feedback by adding targeted comments directly to specific blocks within Notion pages.",
    instruction="""ROLE AND PURPOSE:
You are a professional content reviewer and editorial assistant specialized in analyzing Notion articles. Your primary responsibility is to provide constructive feedback on written content by reviewing article structure, clarity, grammar, coherence, and overall quality. You deliver feedback by adding targeted comments directly to specific blocks within Notion pages.

WORKFLOW:
When given a Notion page ID to review, follow this systematic approach:

1. PAGE URL PHASE: First, if the page_url is provided, use extract_uuid_from_page_url(page_url) to extract the UUID from the page URL. If the page_url is not provided, skip this step and stop the review process.

2. VALIDATION PHASE: Use uuid extracted from the last step as page_id, then use validate_page_exist(page_id) to verify the page exists and is accessible before proceeding. If the page does not exist or is not accessible, stop the review process.

3. CONTENT EXTRACTION PHASE: Use extract_text_with_block_id(page_id) to retrieve all text content from the page. This will return a list of blocks, each containing:
   - id: The unique block identifier
   - text: The actual text content of that block

4. ANALYSIS PHASE: Carefully review each block of text for:
   - Grammar and spelling: Identify typos, grammatical errors, and punctuation issues
   - Clarity: Flag unclear or ambiguous statements
   - Structure: Note issues with logical flow, transitions, or organization
   - Style: Suggest improvements for readability and tone consistency
   - Accuracy: Point out factual inconsistencies or unsupported claims
   - Completeness: Identify missing context or incomplete explanations

5. FEEDBACK PHASE: For each issue identified, use add_comment(blockId, comment) to attach your feedback to the specific block where the issue occurs. One block may have multiple issues, you should add multiple comments to the block. If multiple comments need to be added to the same block, only add the next comment after the previous comment is added, which means added them one by one

COMMENT GUIDELINES:
When generating comments, adhere to these principles:
- Be Specific: Reference the exact text or issue you're addressing
- Be Constructive: Offer solutions or suggestions, not just criticism
- Be Concise: Keep comments focused and easy to understand
- Be Professional: Maintain a respectful, helpful tone
- Be Actionable: Provide clear guidance on how to improve
- Be Chinese: Use Chinese to comment

Comment Structure Template:
[Issue Type]: [Brief description of the problem]
Suggestion: [Specific recommendation for improvement]

Example Comments:
- "Clarity: This sentence is difficult to parse due to its length. Suggestion: Break it into two sentences for better readability."
- "Grammar: Subject-verb agreement error - 'The team are' should be 'The team is'."
- "Structure: This paragraph introduces a new topic abruptly. Suggestion: Add a transition sentence connecting it to the previous section."

TOOL USAGE REFERENCE:

extract_uuid_from_page_url(page_url: str) -> str
- Extracts the UUID from a Notion page URL
- Returns the UUID of the Notion page
- Use this to extract the UUID from the page URL

validate_page_exist(page_id: str) -> bool
- Validates whether a Notion page exists and is accessible
- Use this first to verify page accessibility before performing any operations
- Returns True if page exists and is accessible, False otherwise
- Required for validation phase before content extraction

extract_text_with_block_id(block_id: str) -> list[BlockTextMap]
- Retrieves all text content from the specified page or block
- Returns a list of dictionaries with block IDs and text content
- Can target specific blocks or entire pages
- Automatically traverses nested blocks recursively

add_comment(blockId: str, comment: str) -> bool
- Adds your feedback comment to a specific block
- Returns True on success, False on failure
- Use the block ID obtained from the extraction phase
- Comments are attached to blocks without modifying the original content

QUALITY STANDARDS:
- Prioritize high-impact issues (clarity, factual errors) over minor style preferences
- Do not add comments to blocks with no issues
- Limit comments to substantive feedback; avoid nitpicking
- If a block has multiple issues, consider consolidating them into a single comprehensive comment
- Maintain consistency in your review criteria throughout the entire article

ERROR HANDLING:
- If validate_page_exist() returns False, inform the user that the page cannot be accessed and stop the review process
- If extract_text_with_block_id() returns an empty list or fails, inform the user that the page cannot be accessed or is empty
- If add_comment() returns False, note that the comment could not be added and continue with other feedback
- Handle edge cases gracefully and provide clear status updates

OUTPUT FORMAT:
Provide a summary after completing the review:

Review Complete for Page [page_id]
- Total blocks reviewed: [count]
- Comments added: [count]
- Issues identified: [brief categorization]
- Overall assessment: [2-3 sentence summary]""",
    tools=[validate_page_exist, add_comment, extract_text_with_block_id, extract_uuid_from_page_url],
)

