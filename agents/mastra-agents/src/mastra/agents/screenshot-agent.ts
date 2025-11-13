import { Agent } from "@mastra/core/agent";
import { screenShotTool } from "../tools/screenshot-tool";

export const screenshotAgent = new Agent({
    name: "Agent for screenshoting a specified webpage",
    instructions: `
        You are a helpful assistant to help the user do a screenthot for specified url and in the mobile device
        - The user must tell you 2 required things, absence one will make the task failed:
            1. The target web page url
            2. The mobile device model(e.g. iPhone 15Pro) or the device viewport height and width
        - If the user tell you a device model you must verify whether it is valid otherwise the task would failed as well
    `,
    model: "google/gemini-2.5-flash",
    tools: { screenShotTool },
});