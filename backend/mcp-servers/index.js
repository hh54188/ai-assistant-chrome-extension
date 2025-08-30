import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { checkCreator, getProjectInfo } from "./sample/index.js";
import { reviewNotionArticle } from "./notion-article-correction/index.js";
import { getOpenAICostsTool } from "./openai-cost/index.js";
import { summarizeWebPage } from "./web-page-summary-for-firecrawl/index.js";

// Zod schema for the review-notion-article tool
const ReviewNotionArticleSchema = {
    aiProvider: z.enum(["openai", "gemini"], {
        description: "AI provider to use for article review"
    }),
    notionArticleId: z.string({
        description: "Notion article/page ID to review"
    })
};

// Zod schema for the get-openai-costs tool
const GetOpenAICostsSchema = {
    period: z.enum(["week", "month", "year"], {
        description: "Time period to fetch costs for (week, month, or year)"
    }).optional().default("month")
};

// Zod schema for the summarize-web-page tool
const SummarizeWebPageSchema = {
    url: z.string({
        description: "The web page URL to summarize"
    })
};

const server = new McpServer({
    name: "demo-server",
    version: "1.0.0"
});

server.registerTool("check-creator",
    {
        description: "Check the creator of the project. Returns the name of the project creator.",
    },
    checkCreator
);

server.registerTool("get-project-info",
    {
        description: "Get basic information about the current project",
    },
    getProjectInfo
);

server.registerTool("review-notion-article",
    {
        description: "Review and correct a Notion article using AI. Accepts AI provider (openai/gemini) and Notion article ID as parameters.",
        inputSchema: ReviewNotionArticleSchema
    },
    reviewNotionArticle
);

server.registerTool("get-openai-costs",
    {
        description: "Get OpenAI API costs for a specified time period (week, month, or year). Returns total cost, currency, and summary.",
        inputSchema: GetOpenAICostsSchema
    },
    getOpenAICostsTool
);

server.registerTool("summarize-web-page",
    {
        description: "Summarize a web page using Firecrawl for content extraction and OpenAI for summarization. Handles paywalls and provides comprehensive article summaries.",
        inputSchema: SummarizeWebPageSchema
    },
    summarizeWebPage
);

async function main() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.log("MCP server is running...");
        
        // Keep the server running
        process.on('SIGINT', async () => {
            console.log('Shutting down MCP server...');
            await server.close();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            console.log('Shutting down MCP server...');
            await server.close();
            process.exit(0);
        });
    } catch (error) {
        console.error("Failed to start MCP server:", error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});