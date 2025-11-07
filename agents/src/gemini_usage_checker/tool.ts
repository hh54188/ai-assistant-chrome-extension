import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import puppeteer, { Browser} from 'puppeteer';
import type { Protocol } from 'puppeteer-core';

type CookieParam = Protocol.Network.CookieParam;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


async function loadCookies(): Promise<CookieParam[]> {
    const cookiePath = join(__dirname, 'cookies', 'cookie.json');
    const cookieJson = JSON.parse(await readFile(cookiePath, 'utf-8')) as CookieParam[];
    console.log(cookieJson);
    return cookieJson;
}


export async function getGeminiUsage(): Promise<string> {
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
        const screenshotPath = join(__dirname, 'screenshots', screenshotFileName) as `${string}.png`;
        const screenshotBuffer = await page.screenshot({ path: screenshotPath, fullPage: true });

        if (!screenshotBuffer) {
            throw new Error('Failed to capture Gemini usage screenshot');
        }

        return Buffer.from(screenshotBuffer).toString('base64');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function main() {
    const screenshot = await getGeminiUsage();
    console.log(screenshot);
}

main();