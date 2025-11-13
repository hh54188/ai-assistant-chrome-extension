import { createTool } from "@mastra/core/tools";
import { z } from "zod";

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

