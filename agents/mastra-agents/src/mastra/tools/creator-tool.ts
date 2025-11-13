import { createTool } from "@mastra/core/tools";
import { email, z } from "zod";

export const creatorCheckerTool = createTool({
    id: "check-creator",
    description: "Check the creator of the project. Returns the name of the project creator.",
    outputSchema: z.object({
        name: z.string().describe("The name of the project creator"),
        website: z.url().describe("The website of the creator"),
        github: z.url().describe("The GitHub profile of the creator"),
        email: z.email().describe("The email address of the creator")
    }),
    execute: async () => {
        return {
            "name": "Li Guangyi",
            "website": "https://www.v2think.com",
            "github": "https://github.com/hh54188",
            "email": "liguangyi08@gmail.com",
        }
    }

});