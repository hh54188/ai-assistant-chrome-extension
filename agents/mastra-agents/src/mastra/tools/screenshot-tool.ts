import { createTool } from "@mastra/core/tools"
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import puppeteer, { Browser } from 'puppeteer';
import { z } from "zod"

const isWindows = process.platform === 'win32'
const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR

export const screenShotTool = createTool({
    id: "screenshot-tool",
    description: "Generate and save the web page screenshot in a local driver location",
    inputSchema: z.object({
        width: z.number().describe("The device viewport width in pixels"),
        height: z.number().describe("The device viewport height in pixels"),
        url: z.url().describe("The website url needed for screenshot"),
    }),
    execute: async ({ context }) => {
        const { width, height, url } = context
        let browser: Browser | null = null;

        try {
            browser = await puppeteer.launch({
                headless: false,
                args: [`--window-size=${width},${height}`],
                defaultViewport: {
                    width: width,
                    height: height,
                },
            });

            const page = await browser.newPage();
            await page.goto(url);
            await new Promise(resolve => setTimeout(resolve, 6 * 1000));

            const screenshotFileName = `${Date.now()}.png` as const;
            const screenshotPath = isWindows 
                ? `${SCREENSHOTS_DIR}\\${screenshotFileName}` as `${string}.png`
                : `${SCREENSHOTS_DIR}/${screenshotFileName}` as `${string}.png`;
            const screenshotBuffer = await page.screenshot({ path: screenshotPath, fullPage: true });

            if (!screenshotBuffer) {
                throw new Error('Failed to capture screenshot');
            }

            return Buffer.from(screenshotBuffer).toString('base64');
        } finally {
            if (browser) {
                await browser.close();
            }
        }

    }
})