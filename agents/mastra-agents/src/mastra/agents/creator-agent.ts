import { Agent } from "@mastra/core/agent";
import { creatorCheckerTool } from "../tools/creator-tool";

export const creatorAgent = new Agent({
    name: "Project Creator Check Agent",
    instructions: "You are a helpful assistant that tells the creator's information of the project. Use the 'get_project_creator' tool for this purpose.",
    model: "google/gemini-2.5-flash",
    tools: { creatorCheckerTool },
});