import { createTool } from "@mastra/core/tools";
import { Client } from "@notionhq/client";
import { z } from "zod";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

interface BlockTextMap {
    id: string;
    text: string;
}

function convertRichTextToMarkdown(richTextList: any[]): string {
    const markdownParts: string[] = [];
    
    for (const rt of richTextList) {
        let text = rt.plain_text || "";
        if (!text) continue;
        
        const annotations = rt.annotations || {};
        const href = rt.href;
        
        // Apply formatting in order: code, bold, italic, strikethrough, underline
        if (annotations.code) {
            text = `\`${text}\``;
        } else {
            const isBold = annotations.bold || false;
            const isItalic = annotations.italic || false;
            
            if (isBold && isItalic) {
                text = `***${text}***`;
            } else if (isBold) {
                text = `**${text}**`;
            } else if (isItalic) {
                text = `*${text}*`;
            }
            
            if (annotations.strikethrough) {
                text = `~~${text}~~`;
            }
            if (annotations.underline) {
                text = `<u>${text}</u>`;
            }
        }
        
        // Apply link if present
        if (href) {
            text = `[${text}](${href})`;
        }
        
        markdownParts.push(text);
    }
    
    return markdownParts.join("");
}

async function convertToMarkdown(blockId: string): Promise<string> {
    const markdownLines: string[] = [];
    const blockResult = await notion.blocks.children.list({
        block_id: blockId,
        page_size: 100
    });
    
    const blocks = blockResult.results;
    let previousBlockType: string | null = null;
    
    for (const block of blocks) {
        const blockType = (block as any).type;
        
        if (blockType === "paragraph") {
            const richText = (block as any).paragraph?.rich_text || [];
            if (richText.length > 0) {
                const text = convertRichTextToMarkdown(richText);
                if (text) {
                    if (previousBlockType) {
                        if (previousBlockType === "paragraph") {
                            markdownLines.push("");
                        } else if (previousBlockType !== blockType) {
                            markdownLines.push("");
                        }
                    }
                    markdownLines.push(text);
                    previousBlockType = "paragraph";
                }
            }
        } else if (blockType === "heading_1") {
            const richText = (block as any).heading_1?.rich_text || [];
            if (richText.length > 0) {
                const text = convertRichTextToMarkdown(richText);
                if (text) {
                    if (previousBlockType && previousBlockType !== blockType) {
                        markdownLines.push("");
                    }
                    markdownLines.push(`# ${text}`);
                    previousBlockType = "heading_1";
                }
            }
        } else if (blockType === "heading_2") {
            const richText = (block as any).heading_2?.rich_text || [];
            if (richText.length > 0) {
                const text = convertRichTextToMarkdown(richText);
                if (text) {
                    if (previousBlockType && previousBlockType !== blockType) {
                        markdownLines.push("");
                    }
                    markdownLines.push(`## ${text}`);
                    previousBlockType = "heading_2";
                }
            }
        } else if (blockType === "heading_3") {
            const richText = (block as any).heading_3?.rich_text || [];
            if (richText.length > 0) {
                const text = convertRichTextToMarkdown(richText);
                if (text) {
                    if (previousBlockType && previousBlockType !== blockType) {
                        markdownLines.push("");
                    }
                    markdownLines.push(`### ${text}`);
                    previousBlockType = "heading_3";
                }
            }
        } else if (blockType === "bulleted_list_item") {
            const richText = (block as any).bulleted_list_item?.rich_text || [];
            if (richText.length > 0) {
                const text = convertRichTextToMarkdown(richText);
                if (text) {
                    if (previousBlockType && previousBlockType !== "bulleted_list_item") {
                        markdownLines.push("");
                    }
                    markdownLines.push(`- ${text}`);
                    previousBlockType = "bulleted_list_item";
                }
            }
        } else if (blockType === "numbered_list_item") {
            const richText = (block as any).numbered_list_item?.rich_text || [];
            if (richText.length > 0) {
                const text = convertRichTextToMarkdown(richText);
                if (text) {
                    if (previousBlockType && previousBlockType !== "numbered_list_item") {
                        markdownLines.push("");
                    }
                    markdownLines.push(`1. ${text}`);
                    previousBlockType = "numbered_list_item";
                }
            }
        } else if (blockType === "quote") {
            const richText = (block as any).quote?.rich_text || [];
            if (richText.length > 0) {
                const text = convertRichTextToMarkdown(richText);
                if (text) {
                    if (previousBlockType && previousBlockType !== blockType) {
                        markdownLines.push("");
                    }
                    markdownLines.push(`> ${text}`);
                    previousBlockType = "quote";
                }
            }
        } else if (blockType === "image") {
            const imageBlock = (block as any).image || {};
            let caption = "";
            if (imageBlock.caption) {
                caption = convertRichTextToMarkdown(imageBlock.caption);
            }
            const altText = caption || "Image";
            
            let imageUrl = "";
            if (imageBlock.file) {
                imageUrl = imageBlock.file.url || "";
            } else if (imageBlock.external) {
                imageUrl = imageBlock.external.url || "";
            }
            
            if (previousBlockType && previousBlockType !== blockType) {
                markdownLines.push("");
            }
            markdownLines.push(`![${altText}](${imageUrl})`);
            previousBlockType = "image";
        } else if (blockType === "divider") {
            if (previousBlockType && previousBlockType !== blockType) {
                markdownLines.push("");
            }
            markdownLines.push("---");
            previousBlockType = "divider";
        } else if (blockType === "code") {
            const richText = (block as any).code?.rich_text || [];
            const language = (block as any).code?.language || "";
            if (richText.length > 0) {
                const text = convertRichTextToMarkdown(richText);
                if (text) {
                    if (previousBlockType && previousBlockType !== blockType) {
                        markdownLines.push("");
                    }
                    markdownLines.push(`\`\`\`${language}`);
                    markdownLines.push(text);
                    markdownLines.push("```");
                    previousBlockType = "code";
                }
            }
        }
        
        // Recursively process children blocks
        if ((block as any).has_children) {
            const childMarkdown = await convertToMarkdown(block.id);
            if (childMarkdown) {
                const childLines = childMarkdown.split("\n");
                while (childLines.length > 0 && childLines[0] === "") {
                    childLines.shift();
                }
                while (childLines.length > 0 && childLines[childLines.length - 1] === "") {
                    childLines.pop();
                }
                
                if (childLines.length > 0) {
                    if (previousBlockType && markdownLines.length > 0 && markdownLines[markdownLines.length - 1] !== "") {
                        markdownLines.push("");
                    }
                    markdownLines.push(...childLines);
                }
            }
        }
    }
    
    return markdownLines.join("\n");
}

export const convertToMarkdownTool = createTool({
    id: "convert-to-markdown",
    description: "Recursively converts a Notion article to markdown format. Retrieves all content from various Notion block types including paragraphs, headings (h1, h2, h3), bulleted lists, numbered lists, quotes, and images. Automatically traverses nested blocks recursively to capture all content in the hierarchy and converts them to markdown format.",
    inputSchema: z.object({
        block_id: z.string().describe("The ID of the Notion block or page to convert to markdown. This can be either a page ID or a specific block ID."),
    }),
    outputSchema: z.object({
        markdown: z.string().describe("The markdown formatted content of the article."),
    }),
    execute: async ({ context }) => {
        const { block_id } = context;
        const markdown = await convertToMarkdown(block_id);
        return {
            markdown
        };
    }
});

export const extractTitleTool = createTool({
    id: "extract-title-from-page",
    description: "Extracts the title from a Notion page.",
    inputSchema: z.object({
        page_id: z.string().describe("The unique identifier of the Notion page."),
    }),
    outputSchema: z.object({
        title: z.string().nullable().describe("The title of the Notion page, or null if not found."),
    }),
    execute: async ({ context }) => {
        const { page_id } = context;
        try {
            const pageResponse = await notion.pages.retrieve({ page_id });
            const properties = (pageResponse as any).properties || {};
            const titleProperty = properties.title || {};
            const titleArray = titleProperty.title || [];
            
            if (titleArray.length > 0) {
                return {
                    title: titleArray[0].plain_text || null
                };
            }
            
            return {
                title: null
            };
        } catch (error: any) {
            console.error(`❌ Unable to extract title: ${error.message}`);
            return {
                title: null
            };
        }
    }
});

export const extractUuidTool = createTool({
    id: "extract-uuid-from-page-url",
    description: "Extracts the UUID from a Notion page URL. Handles URLs with query strings and hash fragments by removing them before extraction.",
    inputSchema: z.object({
        page_url: z.string().url().describe("The URL of the Notion page to extract the UUID from"),
    }),
    outputSchema: z.object({
        page_id: z.string().describe("The UUID of the Notion page"),
    }),
    execute: async ({ context }) => {
        const { page_url } = context;
        const urlParts = page_url.split("/");
        const lastPathPart = urlParts[urlParts.length - 1];
        // Remove query string and hash if they exist
        const cleanedPath = lastPathPart.split("?")[0].split("#")[0];
        const pathParts = cleanedPath.split("-");
        const pageId = pathParts[pathParts.length - 1];
        
        return {
            page_id: pageId
        };
    }
});

export const validatePageTool = createTool({
    id: "validate-page-exist",
    description: "Validates whether a Notion page exists and is accessible. Returns True if the page exists and is accessible, False otherwise.",
    inputSchema: z.object({
        page_id: z.string().describe("The unique identifier of the Notion page to validate"),
    }),
    outputSchema: z.object({
        exists: z.boolean().describe("True if the page exists and is accessible, False otherwise"),
        error: z.string().optional().describe("Error message if validation failed"),
    }),
    execute: async ({ context }) => {
        const { page_id } = context;
        try {
            await notion.pages.retrieve({ page_id });
            return {
                exists: true
            };
        } catch (error: any) {
            console.error(`❌ Page content not found or page is empty: ${error.message}`);
            return {
                exists: false,
                error: error.message || "Page not found or inaccessible"
            };
        }
    }
});

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

export const addCommentTool = createTool({
    id: "add-comment",
    description: "Adds a text comment to a specific Notion block. Comments are useful for providing feedback, suggestions, or corrections on specific parts of a Notion page without modifying the original content.",
    inputSchema: z.object({
        blockId: z.string().describe("The unique identifier of the Notion block to add the comment to"),
        comment: z.string().describe("The text content of the comment to be added"),
    }),
    outputSchema: z.object({
        success: z.boolean().describe("True if the comment was successfully added, False if an error occurred"),
        error: z.string().optional().describe("Error message if adding comment failed"),
    }),
    execute: async ({ context }) => {
        const { blockId, comment } = context;
        try {
            await notion.comments.create({
                parent: { block_id: blockId } as any,
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: comment
                        }
                    }
                ]
            });
            console.log(`✅ Comment added successfully to block ${blockId}`);
            return {
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.message || String(error);
            console.error(`❌ Failed to add comment to block ${blockId}: ${errorMessage}`);
            return {
                success: false,
                error: errorMessage
            };
        }
    }
});

