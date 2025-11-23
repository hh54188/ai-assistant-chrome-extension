import { Mastra } from "@mastra/core/mastra";
import { creatorAgent } from "./agents/creator-agent";
import { screenshotAgent } from "./agents/screenshot-agent";
import { notionArticleReviewerAgent } from "./agents/notion-article-reviewer-agent";
import { notionArticlePublisherAgent } from "./agents/notion-article-publisher-agent";

export const mastra = new Mastra({
    agents: { 
        creatorAgent,
        screenshotAgent,
        notionArticleReviewerAgent,
        notionArticlePublisherAgent,
    },
});