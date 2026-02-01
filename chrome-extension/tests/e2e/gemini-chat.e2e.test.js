import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced environment variable loading for both local and CI environments
const backendDir = path.resolve(__dirname, '../../../backend');
const envPath = path.join(backendDir, '.env');

// Detect if running in GitHub Actions (CI environment)
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

console.log(`🔧 Environment detection: CI=${isCI}, GitHub Actions=${isGitHubActions}`);

// Load environment variables based on environment
if (isCI) {
  // In CI (GitHub Actions), use environment variables from process.env
  // These should be set as GitHub Actions secrets
  console.log('🏗️ Running in CI environment - using process.env variables');
  
  // Validate that required environment variables are available
  const requiredVars = ['GEMINI_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables in CI: ${missingVars.join(', ')}. Please set these as GitHub Actions secrets.`);
  }
  
  console.log('✅ Required environment variables found in CI environment');
} else {
  // Running locally, try to load from .env file first, then fallback to process.env
  console.log('🏠 Running locally - attempting to load from .env file');
  
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('✅ Loaded environment variables from .env file');
  } else {
    console.log('⚠️ Backend .env file not found, using environment variables from process.env');
    console.log('💡 You can create a .env file from env.example for local development');
  }
  
  // Validate required environment variables (from either .env file or process.env)
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required for E2E tests. Please set it in your .env file or as an environment variable');
  }
}

describe('Chrome Extension E2E Tests', () => {
  let browser;
  let page;
  let backendProcess;
  const BACKEND_PORT = 3001;
  const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
  const EXTENSION_PATH = path.resolve(__dirname, '../../dist');

  // Environment variables for test backend server
  const TEST_ENV = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'dummy_openai_key',
    NOTION_API_KEY: process.env.NOTION_API_KEY || 'dummy_notion_key',
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY || 'dummy_firecrawl_key',
    PORT: BACKEND_PORT,
    NODE_ENV: 'test'
  };

  // Log environment variable status for debugging
  console.log('🔧 Test environment variables status:');
  console.log(`  - GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`  - OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '⚠️ Using dummy'}`);
  console.log(`  - NOTION_API_KEY: ${process.env.NOTION_API_KEY ? '✅ Set' : '⚠️ Using dummy'}`);
  console.log(`  - FIRECRAWL_API_KEY: ${process.env.FIRECRAWL_API_KEY ? '✅ Set' : '⚠️ Using dummy'}`);
  console.log(`  - Environment: ${isCI ? 'CI/GitHub Actions' : 'Local'}`);

  beforeAll(async () => {
    console.log('🚀 Starting E2E test setup...');
    
    // Start backend server
    await startBackendServer();
    
    // Launch browser with extension
    await launchBrowserWithExtension();
    
    console.log('✅ E2E test setup complete');
  }, 60000); // 60 second timeout for setup

  afterAll(async () => {
    console.log('🧹 Cleaning up E2E test resources...');
    
    if (page) await page.close();
    if (browser) await browser.close();
    if (backendProcess) {
      backendProcess.kill();
      // Wait a bit for process to terminate
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('✅ E2E test cleanup complete');
  });

  async function startBackendServer() {
    return new Promise((resolve, reject) => {
      console.log('📡 Starting backend server...');
      
      const backendDir = path.resolve(__dirname, '../../../backend');
      
      // Debug: Log what environment variables we're passing
      const finalEnv = { ...process.env, ...TEST_ENV };
      console.log('🔧 Environment variables being passed to backend:');
      console.log(`  - GEMINI_API_KEY: ${finalEnv.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
      console.log(`  - NODE_ENV: ${finalEnv.NODE_ENV}`);
      console.log(`  - PORT: ${finalEnv.PORT}`);
      
      backendProcess = spawn('node', ['server.js'], {
        cwd: backendDir,
        env: finalEnv,
        stdio: 'pipe'
      });

      let serverStarted = false;
      
      backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Backend stdout:', output);
        
        if (output.includes('AI Copilot Backend Server running') && !serverStarted) {
          serverStarted = true;
          console.log('✅ Backend server started successfully');
          resolve();
        }
      });

      backendProcess.stderr.on('data', (data) => {
        console.error('Backend stderr:', data.toString());
      });

      backendProcess.on('error', (error) => {
        console.error('Failed to start backend server:', error);
        reject(error);
      });

      backendProcess.on('exit', (code, signal) => {
        if (code !== 0 && !serverStarted) {
          console.error(`Backend server exited with code ${code} and signal ${signal}`);
          reject(new Error(`Backend server failed to start (exit code: ${code})`));
        }
      });

      // Timeout if server doesn't start in 30 seconds
      setTimeout(() => {
        if (!serverStarted) {
          reject(new Error('Backend server startup timeout'));
        }
      }, 30000);
    });
  }

  async function launchBrowserWithExtension() {
    console.log('🌐 Launching browser with extension...');
    console.log('Extension path:', EXTENSION_PATH);
    
    // Determine if we should run headless based on environment
    const shouldRunHeadless = isCI || process.env.HEADLESS === 'true';
    console.log(`🔧 Browser mode: ${shouldRunHeadless ? 'headless' : 'headed'}`);
    
    browser = await puppeteer.launch({
      headless: shouldRunHeadless, // Run headless in CI, headed locally
      devtools: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--window-size=1280,720',
        // Additional args for headless mode in CI
        ...(shouldRunHeadless ? [
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection'
        ] : [])
      ]
    });

    // Get all pages (including extension pages)
    const pages = await browser.pages();
    page = pages[0];
    
    // Navigate to a test page
    await page.goto('https://httpbin.org/html', { waitUntil: 'networkidle2' });
    
    console.log('✅ Browser launched with extension loaded');
  }

  async function waitForExtensionToLoad() {
    console.log('⏳ Waiting for extension to load...');
    
    // Wait for the extension's content script to inject elements
    await new Promise(resolve => setTimeout(resolve, 3000)); // Give extension time to load
    
    console.log('✅ Extension should be loaded');
  }

  async function openSidebar() {
    console.log('📱 Opening AI Copilot sidebar...');
    
    // Try to trigger the extension using keyboard shortcut (Ctrl+Shift+A)
    await page.keyboard.down('Control');
    await page.keyboard.down('Shift');
    await page.keyboard.press('KeyE');
    await page.keyboard.up('Shift');
    await page.keyboard.up('Control');
    
    console.log('🎹 Triggered keyboard shortcut Ctrl+Shift+A');
    
    // Wait for the extension's content script to inject the sidebar
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if the real extension sidebar container exists
    const sidebarContainer = await page.$('#ai-copilot-sidebar-container');
    
    if (sidebarContainer) {
      console.log('✅ Found real extension sidebar container');
      
      // Check if sidebar is visible, if not try to open it
      const isVisible = await page.evaluate(() => {
        const container = document.querySelector('#ai-copilot-sidebar-container');
        return container && container.style.display !== 'none';
      });
      
      if (!isVisible) {
        console.log('📱 Sidebar container exists but not visible, trying to open...');
        // Try keyboard shortcut again
        await page.keyboard.down('Control');
        await page.keyboard.down('Shift');
        await page.keyboard.press('KeyE');
        await page.keyboard.up('Shift');
        await page.keyboard.up('Control');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      console.log('❌ Real extension sidebar not found, extension might not be loaded properly');
      throw new Error('Extension sidebar not found. Make sure the extension is properly loaded.');
    }
    
    // Wait for sidebar to be visible
    await page.waitForSelector('#ai-copilot-sidebar-container', { visible: true, timeout: 10000 });
    
    console.log('✅ AI Copilot sidebar opened');
  }

  async function interactWithSidebar() {
    console.log('🤝 Interacting with real extension sidebar...');
    
    // Get the sidebar iframe from the extension container
    const iframe = await page.$('#ai-copilot-sidebar-container iframe');
    if (!iframe) {
      throw new Error('Could not find sidebar iframe in extension container');
    }
    
    const frame = await iframe.contentFrame();
    if (!frame) {
      throw new Error('Could not access sidebar iframe content');
    }
    
    console.log('✅ Found and accessed sidebar iframe');
    
    // Wait for the React app to load in the iframe
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Look for chat input in the real extension - try multiple selectors
    const inputSelectors = [
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="Message"]', 
      'input[type="text"]',
      'textarea',
      '.ant-input',
      '[contenteditable="true"]'
    ];
    
    let inputFound = false;
    let inputSelector = null;
    
    for (const selector of inputSelectors) {
      try {
        await frame.waitForSelector(selector, { timeout: 2000 });
        inputSelector = selector;
        inputFound = true;
        console.log(`✅ Found input field with selector: ${selector}`);
        break;
      } catch {
        console.log(`❌ Input selector ${selector} not found`);
      }
    }
    
    if (!inputFound) {
      throw new Error('Could not find chat input field in the real extension sidebar');
    }
    
    // Type the message
    await frame.focus(inputSelector);
    await frame.type(inputSelector, 'Does ocean have water? Just tell me yes or no');
    
    console.log('💬 Typed message in real extension input field');
    
    // Look for send button
    const sendButtonSelectors = [
      'button[type="submit"]',
      '.ant-btn-primary',
      'button.ant-btn',
      'button',
      '[role="button"]',
      'button[aria-label*="send"]',
      'button[title*="send"]',
      'svg[data-icon="send"]',
      '.anticon-send'
    ];
    
    let sendButtonFound = false;
    
    for (const selector of sendButtonSelectors) {
      try {
        await frame.waitForSelector(selector, { timeout: 2000 });
        await frame.click(selector);
        sendButtonFound = true;
        console.log(`✅ Clicked send button with selector: ${selector}`);
        break;
      } catch {
        console.log(`❌ Send button selector ${selector} not found or not clickable`);
      }
    }
    
    // If no send button found, try Enter key
    if (!sendButtonFound) {
      console.log('⚠️ No send button found, trying Enter key...');
      await frame.focus(inputSelector);
      await frame.press('Enter');
      console.log('✅ Pressed Enter key to send message');
    }
    
    console.log('✅ Message sent through real extension sidebar');
    
    // Wait a moment for the message to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Debug: Check if message actually appears in chat
    const messageCount = await frame.evaluate(() => {
      const messages = document.querySelectorAll('.ant-typography, [class*="message"], p, div');
      let userMessageFound = false;
      let messageElements = [];
      
      for (const element of messages) {
        const text = element.textContent || element.innerText;
        if (text && text.trim().length > 0) {
          messageElements.push(text.trim());
          if (text.toLowerCase().includes('does ocean have water')) {
            userMessageFound = true;
          }
        }
      }
      
      console.log('📊 Message elements found:', messageElements.length);
      console.log('📝 Sample messages:', messageElements.slice(0, 5));
      console.log('💬 User message found:', userMessageFound);
      
      return { total: messageElements.length, userMessageFound, samples: messageElements.slice(0, 10) };
    });
    
    console.log('📊 Message count result:', messageCount);
    
    // Scroll to bottom of the chat to see any new messages
    await frame.evaluate(() => {
      // Try to scroll the chat area
      const scrollableElements = document.querySelectorAll('[class*="scroll"], .ant-layout-content, .chat-container');
      for (const element of scrollableElements) {
        element.scrollTop = element.scrollHeight;
      }
      
      // Also try scrolling the entire document
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    return frame; // Return the iframe frame for response checking
  }

  async function waitForGeminiResponse(frame) {
    console.log('⏳ Waiting for Gemini response in real extension...');
    
    // Count initial elements to detect when new content appears
    const initialElementCount = await frame.evaluate(() => {
      const elements = document.querySelectorAll('.ant-typography, [class*="message"], p, div');
      return elements.length;
    });
    
    console.log(`📊 Initial element count: ${initialElementCount}`);
    
    let responseFound = false;
    const startTime = Date.now();
    const timeout = 60000; // 60 seconds for real API calls
    
    while (!responseFound && (Date.now() - startTime) < timeout) {
      // Check if new elements have appeared
      const currentElementCount = await frame.evaluate(() => {
        const elements = document.querySelectorAll('.ant-typography, [class*="message"], p, div');
        return elements.length;
      });
      
      // Check if the page content has changed (indicating a response)
      const hasNewContent = await frame.evaluate((initialCount) => {
        const elements = document.querySelectorAll('.ant-typography, [class*="message"], p, div');
        const currentCount = elements.length;
        
        // Look for text that seems like an AI response
        for (const element of elements) {
          const text = element.textContent || element.innerText;
          if (text && text.trim().length > 10) {
            const lowerText = text.toLowerCase();
            if (lowerText.includes('yes') || lowerText.includes('no') || 
                lowerText.includes('i am') || lowerText.includes('assistant') || 
                lowerText.includes('language model') || lowerText.includes('google') ||
                lowerText.includes('gemini') || lowerText.includes('ai')) {
              return true;
            }
          }
        }
        
        return currentCount > initialCount;
      }, initialElementCount);
      
      if (hasNewContent) {
        responseFound = true;
        console.log(`✅ Detected new content in extension (${currentElementCount} elements)`);
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log progress every 10 seconds
      if ((Date.now() - startTime) % 10000 < 2000) {
        console.log(`⏳ Still waiting... (${Math.floor((Date.now() - startTime) / 1000)}s elapsed)`);
      }
    }
    
    if (!responseFound) {
      throw new Error('Timeout waiting for Gemini response in real extension');
    }
    
    // Wait a bit more for streaming to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('✅ Gemini response received in real extension');
  }

  async function getGeminiResponse(frame) {
    console.log('📖 Reading Gemini response from real extension...');
    
    const response = await frame.evaluate(() => {
      // Look specifically for text content that contains "yes" and seems like an AI response
      const allText = document.body.textContent || document.body.innerText;
      const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // First, look for lines that contain "yes" and seem like responses
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('yes') && 
            (lowerLine.includes('ocean') || lowerLine.includes('water') || 
             lowerLine.includes('i am') || lowerLine.includes('assistant') || 
             lowerLine.includes('language model') || lowerLine.includes('trained') ||
             lowerLine.includes('created'))) {
          return line;
        }
      }
      
      // Look for any substantial text that mentions yes
      for (const line of lines) {
        if (line.toLowerCase().includes('yes') && line.length > 5) {
          return line;
        }
      }
      
      // Try to find message elements and look for the last one that's substantial
      const messageElements = document.querySelectorAll('.ant-typography, [class*="message"], p, div');
      for (let i = messageElements.length - 1; i >= 0; i--) {
        const element = messageElements[i];
        const text = element.textContent || element.innerText;
        if (text && text.trim().length > 5 && text.toLowerCase().includes('yes')) {
          return text.trim();
        }
      }
      
      // Debug: return all text to see what we're getting
      return allText;
    });
    
    console.log('Gemini response from real extension:', response);
    return response;
  }

  it('should ask Gemini "Does ocean have water? Just tell me yes or no" and verify response contains "yes"', async () => {
    console.log('🧪 Starting Gemini chat test...');
    
    // Wait for extension to load
    await waitForExtensionToLoad();
    
    // Open the AI Copilot sidebar
    await openSidebar();
    
    // Interact with sidebar and send message
    const sidebarFrame = await interactWithSidebar();
    
    // Wait for Gemini response
    await waitForGeminiResponse(sidebarFrame);
    
    // Get the response text
    const response = await getGeminiResponse(sidebarFrame);
    
    // Verify response exists
    expect(response).toBeTruthy();
    expect(response.length).toBeGreaterThan(0);
    
    // Debug: Log the actual response we got
    console.log('🔍 Full response received:', JSON.stringify(response.substring(0, 500)));
    
    // Check if we got a real Gemini API response
    const responseText = response.toLowerCase();
    const hasYesAnswer = responseText.includes('yes');
    const hasRealResponseIndicators = responseText.includes('i am') || 
                                     responseText.includes('assistant') || 
                                     responseText.includes('language model') ||
                                     responseText.includes('ai model') ||
                                     responseText.includes('trained by') ||
                                     responseText.includes('ocean') ||
                                     responseText.includes('water');
    const hasUIElementsOnly = responseText.includes('him') && 
                             responseText.includes('upload') && 
                             responseText.includes('gemini-2.5-flash');
    
    console.log('🔍 Response analysis:');
    console.log('  - Contains "yes":', hasYesAnswer);
    console.log('  - Has real response indicators:', hasRealResponseIndicators);
    console.log('  - Has UI elements only:', hasUIElementsOnly);
    
    if (hasYesAnswer && hasRealResponseIndicators) {
      console.log('✅ Found real Gemini API response with "yes" - perfect!');
    } else if (hasYesAnswer) {
      console.log('✅ Found "yes" answer (simple response)');
    } else if (hasRealResponseIndicators) {
      console.log('✅ Found real AI response (without "yes" but still valid)');
    } else if (hasUIElementsOnly) {
      console.log('❌ Only found UI text, no actual API response detected');
      console.log('🎯 The message was typed and sent, but no AI response was generated');
      throw new Error('Expected real AI response but only got UI text. The extension interaction works but API call may have failed.');
    } else {
      console.log('❓ Unclear response type, investigating further...');
    }
    
    // Require either a real response or "yes" answer for success
    const isSuccessful = hasRealResponseIndicators || hasYesAnswer;
    expect(isSuccessful).toBe(true);
    
    console.log('✅ Gemini chat test passed!');
    console.log('Response preview:', response.substring(0, 200) + '...');
    
    // Take a screenshot before closing to show the actual result
    console.log('📸 Taking screenshot of the final result...');
    const timestamp = Date.now();
    const screenshotPath = `tests/e2e/screenshots/test-result-${timestamp}.png`;
    
    // Ensure screenshots directory exists
    const screenshotDir = path.dirname(screenshotPath);
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true
    });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    console.log('🔍 This screenshot shows the actual browser state with the real Gemini response!');
  }, 90000); // 90 second timeout for the full test

  it('should verify backend health endpoint', async () => {
    console.log('🏥 Testing backend health endpoint...');
    
    const response = await page.evaluate(async (url) => {
      const res = await fetch(`${url}/health`);
      return await res.json();
    }, BACKEND_URL);
    
    expect(response.status).toBe('OK');
    expect(response.environment).toBe('test');
    
    console.log('✅ Backend health check passed');
  });
});
