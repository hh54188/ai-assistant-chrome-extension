import { createTool } from "@mastra/core/tools";
import { Client } from "@notionhq/client";
import { z } from "zod";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

interface BlockTextMap {
    id: string;
    text: string;
}

async function extractTextWithBlockId(blockId: string): Promise<BlockTextMap[]> {
    const blockTextList: BlockTextMap[] = [];
    const blockResult = await notion.blocks.children.list({
        block_id: blockId,
        page_size: 100
    });
    
    const blocks = blockResult.results;
    
    for (const block of blocks) {
        let textToReview = "";
        const blockType = (block as any).type;
        
        // Extract text based on block type
        if (blockType === "paragraph" && "paragraph" in block) {
            const paragraph = (block as any).paragraph;
            if (paragraph?.rich_text?.length > 0) {
                textToReview = paragraph.rich_text.map((rt: any) => rt.plain_text || "").join("");
            }
        } else if (blockType === "heading_1" && "heading_1" in block) {
            const heading1 = (block as any).heading_1;
            if (heading1?.rich_text?.length > 0) {
                textToReview = heading1.rich_text.map((rt: any) => rt.plain_text || "").join("");
            }
        } else if (blockType === "heading_2" && "heading_2" in block) {
            const heading2 = (block as any).heading_2;
            if (heading2?.rich_text?.length > 0) {
                textToReview = heading2.rich_text.map((rt: any) => rt.plain_text || "").join("");
            }
        } else if (blockType === "heading_3" && "heading_3" in block) {
            const heading3 = (block as any).heading_3;
            if (heading3?.rich_text?.length > 0) {
                textToReview = heading3.rich_text.map((rt: any) => rt.plain_text || "").join("");
            }
        } else if (blockType === "bulleted_list_item" && "bulleted_list_item" in block) {
            const bulletedListItem = (block as any).bulleted_list_item;
            if (bulletedListItem?.rich_text?.length > 0) {
                textToReview = bulletedListItem.rich_text.map((rt: any) => rt.plain_text || "").join("");
            }
        } else if (blockType === "numbered_list_item" && "numbered_list_item" in block) {
            const numberedListItem = (block as any).numbered_list_item;
            if (numberedListItem?.rich_text?.length > 0) {
                textToReview = numberedListItem.rich_text.map((rt: any) => rt.plain_text || "").join("");
            }
        } else if (blockType === "quote" && "quote" in block) {
            const quote = (block as any).quote;
            if (quote?.rich_text?.length > 0) {
                textToReview = quote.rich_text.map((rt: any) => rt.plain_text || "").join("");
            }
        }
        
        if (textToReview) {
            blockTextList.push({
                id: block.id,
                text: textToReview
            });
        }
        
        if ("has_children" in block && (block as any).has_children) {
            const childBlocks = await extractTextWithBlockId(block.id);
            blockTextList.push(...childBlocks);
        }
    }
    
    return blockTextList;
}

export const extractTextTool = createTool({
    id: "extract-text-with-block-id",
    description: "Recursively extracts text content from a Notion block and all its children blocks. Retrieves all text content from various Notion block types including paragraphs, headings (h1, h2, h3), bulleted lists, numbered lists, and quotes. Automatically traverses nested blocks recursively to capture all content in the hierarchy.",
    inputSchema: z.object({
        block_id: z.string().describe("The ID of the Notion block or page to extract text from. This can be either a page ID or a specific block ID."),
    }),
    outputSchema: z.object({
        blocks: z.array(z.object({
            id: z.string().describe("The unique identifier of the block"),
            text: z.string().describe("The plain text content extracted from the block"),
        })).describe("A list of blocks with their IDs and text content"),
    }),
    execute: async ({ context }) => {
        const { block_id } = context;
        const blocks = await extractTextWithBlockId(block_id);
        return {
            blocks
        };
    }
});

