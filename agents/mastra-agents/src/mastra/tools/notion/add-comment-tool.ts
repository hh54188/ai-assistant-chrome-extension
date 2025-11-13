import { createTool } from "@mastra/core/tools";
import { Client } from "@notionhq/client";
import { z } from "zod";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

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

