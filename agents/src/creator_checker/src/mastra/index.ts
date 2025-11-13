import { Mastra } from "@mastra/core/mastra";
import { creatorAgent } from "./agents/creator-agent";

export const mastra = new Mastra({
    agents: { creatorAgent },
});