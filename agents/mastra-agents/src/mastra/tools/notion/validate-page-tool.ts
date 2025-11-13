import { createTool } from "@mastra/core/tools";
import { Client } from "@notionhq/client";
import { z } from "zod";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

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

