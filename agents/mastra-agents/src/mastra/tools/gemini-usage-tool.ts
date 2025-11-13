import { createTool } from "@mastra/core/tools";
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import puppeteer, { Browser } from 'puppeteer';
import type { CookieParam } from 'puppeteer';
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadCookies(): Promise<CookieParam[]> {
    const cookiePath = process.env.GEMINI_COOKIE_PATH!
    const cookieJson = JSON.parse(await readFile(cookiePath, 'utf-8')) as CookieParam[];
    console.log(cookieJson);
    return cookieJson;
}

const isWindows = process.platform === 'win32';
const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR!

export const geminiUsageTool = createTool({
    id: "gemini-usage-checker",
    description: "Check Gemini API usage by taking a screenshot of the Google AI Studio usage page. Returns a base64-encoded screenshot of the usage page.",
    inputSchema: z.object({}),
    outputSchema: z.object({
        screenshot: z.string().describe("Base64-encoded screenshot of the Gemini usage page"),
    }),
    execute: async ({ context }) => {
        let browser: Browser | null = null;

        try {
            const cookieJson = await loadCookies();
            browser = await puppeteer.launch({
                headless: false,
                args: ['--window-size=1920,1080'],
                defaultViewport: {
                    width: 1920,
                    height: 1080,
                },
            });

            const page = await browser.newPage();
            await page.setCookie(...cookieJson);

            await page.goto('https://aistudio.google.com/usage?project=gen-lang-client-0173248074&tab=billing');

            await page.evaluate(() => {
                document.querySelectorAll('.cdk-overlay-container').forEach(element => element.remove());
            });

            await new Promise(resolve => setTimeout(resolve, 10 * 1000));

            const screenshotFileName = `gemini-usage-checker-${Date.now()}.png` as const;
            const screenshotPath = isWindows 
                ? `${SCREENSHOTS_DIR}\\${screenshotFileName}` as `${string}.png`
                : `${SCREENSHOTS_DIR}/${screenshotFileName}` as `${string}.png`;
            const screenshotBuffer = await page.screenshot({ path: screenshotPath, fullPage: true });

            if (!screenshotBuffer) {
                throw new Error('Failed to capture Gemini usage screenshot');
            }

            return {
                screenshot: Buffer.from(screenshotBuffer).toString('base64')
            };
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
});

