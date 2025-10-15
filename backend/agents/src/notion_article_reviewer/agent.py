import os
import dotenv
dotenv.load_dotenv()

from notion_client import AsyncClient
import asyncio
import json

notion = AsyncClient(auth=os.getenv("NOTION_API_KEY"))

async def validate_page_exist(page_id):
    try:
        await notion.pages.retrieve(page_id=page_id)
        return True
    except Exception as e:
        print(f"❌ 未找到页面内容或页面为空: {e}")
        return False


async def extract_text_from_blocks(block_id):
    block_to_text_map = []
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
            block_to_text_map.append({
                "id": block.get("id"),
                "text": text_to_review
            })
        
        if block.get("has_children"):
            block_to_text_map.extend(await extract_text_from_blocks(block.get("id")))

    return block_to_text_map


async def get_article_content(page_id):
    block_to_text_map = await extract_text_from_blocks(page_id)
    print(json.dumps(block_to_text_map, indent=2, ensure_ascii=False))
    return block_to_text_map
    

asyncio.run(get_article_content(page_id="2270cda410a68005b731fec98ea8500a"))






# artileContent = await notion.pages.retrieve("AI-2270cda410a68005b731fec98ea8500a")
# print(artileContent)

# from google.adk.agents.llm_agent import Agent
# import dotenv
# dotenv.load_dotenv()

# def get_project_creator() -> dict:
#     """Returns the creator's information of the project."""
#     return {
#         "name": "Li Guangyi",
#         "website": "https://www.v2think.com",
#         "github": "https://github.com/hh54188",
#         "email": "liguangyi08@gmail.com",
#     }

# root_agent = Agent(
#     model='gemini-2.5-pro',
#     name='notion_article_reviewer_agent',
#     description="Tells the creator's information of the project.",
#     instruction="You are a helpful assistant that tells the creator's information of the project. Use the 'get_project_creator' tool for this purpose.",
#     tools=[get_project_creator],
# )

