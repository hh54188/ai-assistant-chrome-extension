import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import puppeteer, { Browser } from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export async function renderScreenshot(url:string, width: number, height: number): Promise<string> {
    /* 
        Use specifed viewport size to render the screenshot than the device emulation based on 2 reasons:
        1. There are image ovelap appear on the image when using the device emulation.
        2. Using width and height was more friendly to the AI model, the supported device was enumed in the puppeteer library.
    */
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
        const screenshotPath = join(__dirname, 'screenshots', screenshotFileName) as `${string}.png`;
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

async function main() {
    const screenshotBase64Str = await renderScreenshot("https://www.v2think.com/some-realistic-problems-in-team-management", 393, 852);
}

main();