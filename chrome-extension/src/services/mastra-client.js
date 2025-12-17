import { MastraClient, createTool } from "@mastra/client-js";
import { z } from "zod";

const mastraClient = new MastraClient({
    baseUrl: "http://localhost:4111",
});

const openNewTabTool = createTool({
    id: "open-new-tab",
    description: "Opens a new tab in the browser",
    inputSchema: z.object({
        url: z.string({
            description: "The URL to open",
        }),
    }),
    outputSchema: z.object({
        success: z.boolean(),
    }),
    execute: async ({ context }) => {
        const { url } = context;
        console.log("==========> OPEN_NEW_TAB", url);
        // Send message to content script via window.postMessage
        // Content script will forward to background script which has chrome.tabs API access
        return new Promise((resolve) => {
            // Send message to parent window (content script)
            window.parent.postMessage({
                type: 'OPEN_NEW_TAB',
                url: url
            }, '*');

            resolve({ success: true });

            // // Listen for response from content script
            // const handleMessage = (event) => {
            //     if (event.data && event.data.type === 'OPEN_NEW_TAB_RESPONSE') {
            //         console.log("==========> OPEN_NEW_TAB_RESPONSE", event.data);
            //         window.removeEventListener('message', handleMessage);
            //         if (event.data.success) {
            //             resolve({ success: true });
            //         } else {
            //             reject(new Error(event.data.error || 'Failed to open new tab'));
            //         }
            //     }
            // };

            // window.addEventListener('message', handleMessage);

            // // Set timeout to avoid hanging forever
            // setTimeout(() => {
            //     window.removeEventListener('message', handleMessage);
            //     reject(new Error('Timeout waiting for response'));
            // }, 5000);
        });
    },
});

export const handleClientTool = async () => {
    try {
        const agent = mastraClient.getAgent("generalAgent");

        const colorChangeTool = createTool({
            id: "color-change-tool",
            description: "Changes the HTML background color",
            inputSchema: z.object({
                color: z.string(),
            }),
            outputSchema: z.object({
                success: z.boolean(),
            }),
            execute: async ({ context }) => {
                const { color } = context;

                document.body.style.backgroundColor = color;
                return { success: true };
            },
        });

        const response = await agent.generate({
            messages: "Change the background to blue",
            clientTools: { colorChangeTool },
        });

        console.log(response);
    } catch (error) {
        console.error(error);
    }
}

export const callGeneralAgent = async () => {
    try {
        const agent = mastraClient.getAgent("generalAgent");
        const response = await agent.generate({
            messages: [
                {
                    role: "user",
                    content: "Open a new tab to https://www.google.com",
                },
            ],
            clientTools: { openNewTabTool },
        });
        debugger;
        const { toolCalls } = response;
        if (toolCalls.length > 0) {
            for (let i = 0; i < toolCalls.length; i++) {
                const { payload: { args: { url }, toolName } } = toolCalls[i];
                if (toolName === "open-new-tab") {
                    await openNewTabTool.execute({
                        context: { url: url },
                    });
                }
                else {
                    console.error(`Unsupported tool: ${toolName}`);
                }
            }
        }
    } catch (error) {
        console.error(error);
        return "Error occurred while generating response";
    }
};

export const generalAgentStream = async () => {
    try {
        const agent = mastraClient.getAgent("generalAgent");

        const stream = await agent.stream({
            messages: [
                {
                    role: "user",
                    content: "Hello",
                },
            ],
        });

        stream.processDataStream({
            onTextPart: (text) => {
                console.log(text);
            },
        });
    } catch (error) {
        console.error(error);
        return "Error occurred while generating response";
    }
};