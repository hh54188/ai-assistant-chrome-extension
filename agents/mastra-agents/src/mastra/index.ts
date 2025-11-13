import { Mastra } from "@mastra/core/mastra";
import { creatorAgent } from "./agents/creator-agent";
import { screenshotAgent } from "./agents/screenshot-agent";

export const mastra = new Mastra({
    agents: { 
        creatorAgent,
        screenshotAgent
    },
});