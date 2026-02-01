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

describe('Chrome Extension Drag and Drop E2E Tests', () => {
  let browser;
  let page;
  let backendProcess;
  const BACKEND_PORT = 3001;
  let BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
  const EXTENSION_PATH = path.resolve(__dirname, '../../dist');
  const TEST_URL = 'https://httpi.dev/';
  const EXPECTED_TEXT = 'HTTPSpot';

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
    console.log('🚀 Starting Drag and Drop E2E test setup...');
    
    // Start backend server
    await startBackendServer();
    
    // Launch browser with extension
    await launchBrowserWithExtension();
    
    console.log('✅ Drag and Drop E2E test setup complete');
  }, 60000); // 60 second timeout for setup

  afterAll(async () => {
    console.log('🧹 Cleaning up Drag and Drop E2E test resources...');
    
    if (page) await page.close();
    if (browser) await browser.close();
    if (backendProcess) {
      backendProcess.kill();
      // Wait a bit for process to terminate
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('✅ Drag and Drop E2E test cleanup complete');
  });

  async function startBackendServer() {
    return new Promise((resolve, reject) => {
      console.log('📡 Starting backend server...');
      
      const backendDir = path.resolve(__dirname, '../../../backend');
      
      backendProcess = spawn('node', ['server.js'], {
        cwd: backendDir,
        env: { ...process.env, ...TEST_ENV },
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
        const errorOutput = data.toString();
        console.error('Backend stderr:', errorOutput);
        
        // Check for port already in use error
        if (errorOutput.includes('EADDRINUSE') && !serverStarted) {
          console.log('⚠️ Port already in use, trying to use existing backend...');
          // Try to use the existing backend on port 3001
          TEST_ENV.PORT = 3001;
          BACKEND_URL = 'http://localhost:3001';
          
          // Test if existing backend is responsive using page.evaluate
          // We'll do this check after the browser is launched
          console.log('✅ Will use existing backend server on port 3001');
          serverStarted = true;
          resolve();
        }
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
    
    // Navigate to the test page
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    
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
    await page.keyboard.press('KeyA');
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
        await page.keyboard.press('KeyA');
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
    
    // Check if setup modal is showing and handle it
    await handleSetupModal();
    
    console.log('✅ AI Copilot sidebar opened');
  }

  async function handleSetupModal() {
    console.log('🔧 Checking for setup modal...');
    
    // Look for the setup modal in the iframe
    const iframe = await page.$('#ai-copilot-sidebar-container iframe');
    if (!iframe) {
      console.log('❌ No iframe found, cannot check for setup modal');
      return;
    }
    
    const frame = await iframe.contentFrame();
    if (!frame) {
      console.log('❌ Cannot access iframe content');
      return;
    }
    
    // Wait a moment for the modal to appear
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if setup modal is visible
    const setupModalVisible = await frame.evaluate(() => {
      // Look for the setup modal elements
      const modal = document.querySelector('[style*="overlay"]') || 
                   document.querySelector('.ant-modal') ||
                   document.querySelector('[role="dialog"]');
      
      if (!modal) return false;
      
      // Check if it contains setup-related text
      const text = modal.textContent || modal.innerText;
      return text.includes('Setup Required') || 
             text.includes('Choose how you\'d like to use') ||
             text.includes('Backend server is not available');
    });
    
    if (setupModalVisible) {
      console.log('⚠️ Setup modal detected, configuring backend URL...');
      
      // Find and fill the backend URL input
      const backendUrlInput = await frame.$('input[placeholder*="localhost"]');
      if (backendUrlInput) {
        await frame.focus('input[placeholder*="localhost"]');
        await frame.type('input[placeholder*="localhost"]', BACKEND_URL);
        console.log(`✅ Set backend URL to: ${BACKEND_URL}`);
        
        // Click the "Save & Test Connection" button
        const saveButton = await frame.$('button:has-text("Save & Test Connection")');
        if (saveButton) {
          await frame.click('button:has-text("Save & Test Connection")');
          console.log('✅ Clicked Save & Test Connection button');
          
          // Wait for the modal to close
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          console.log('⚠️ Save button not found, trying alternative selectors...');
          
          // Try alternative button selectors
          const buttonSelectors = [
            'button[style*="retryButton"]',
            'button:contains("Save")',
            'button:contains("Test")',
            '.ant-btn-primary'
          ];
          
          for (const selector of buttonSelectors) {
            try {
              await frame.click(selector);
              console.log(`✅ Clicked button with selector: ${selector}`);
              break;
            } catch (error) {
              console.log(`❌ Button selector ${selector} not found`);
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } else {
        console.log('⚠️ Backend URL input not found; backend URL is required to continue.');
      }
    } else {
      console.log('✅ No setup modal detected, extension is ready');
    }
  }

  async function selectText() {
    console.log('📝 Selecting text on the page...');
    
    // Find the h1 element with the expected text
    const h1Element = await page.$('h1');
    if (!h1Element) {
      throw new Error('Could not find h1 element on the page');
    }
    
    // Get the text content to verify
    const textContent = await page.evaluate(el => el.textContent, h1Element);
    console.log(`📄 Found h1 text: "${textContent}"`);
    
    if (!textContent.includes(EXPECTED_TEXT)) {
      throw new Error(`Expected text "${EXPECTED_TEXT}" not found in h1 element. Found: "${textContent}"`);
    }
    
    // Select the text using JavaScript selection API
    const selectedText = await page.evaluate((expectedText) => {
      // Find the h1 element
      const h1 = document.querySelector('h1');
      if (!h1) return '';
      
      // Create a range to select the text
      const range = document.createRange();
      range.selectNodeContents(h1);
      
      // Clear any existing selection
      const selection = window.getSelection();
      selection.removeAllRanges();
      
      // Add the range to selection
      selection.addRange(range);
      
      // Return the selected text
      return selection.toString();
    }, EXPECTED_TEXT);
    
    console.log(`✅ Text selected: "${selectedText}"`);
    
    if (!selectedText.trim()) {
      throw new Error('No text was selected');
    }
    
    return selectedText.trim();
  }

  async function startDragOperation() {
    console.log('🖱️ Starting drag operation...');
    
    // Get the selected text and trigger drag programmatically
    const selectedText = await page.evaluate(() => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : '';
      
      if (!text) return '';
      
      // Find the h1 element
      const h1 = document.querySelector('h1');
      if (!h1) return text;
      
      // Create a custom drag event
      const dragEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer()
      });
      
      // Set the drag data
      dragEvent.dataTransfer.setData('text/plain', text);
      dragEvent.dataTransfer.effectAllowed = 'copy';
      
      // Dispatch the dragstart event on the h1 element
      h1.dispatchEvent(dragEvent);
      
      return text;
    });
    
    if (!selectedText) {
      throw new Error('No text selected for dragging');
    }
    
    // Wait a moment for drag events to be processed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ Started dragging text: "${selectedText}"`);
    return selectedText;
  }

  async function verifyDropZoneAppears() {
    console.log('🎯 Verifying drop zone overlay appears...');
    
    // Get the sidebar iframe
    const iframe = await page.$('#ai-copilot-sidebar-container iframe');
    if (!iframe) {
      throw new Error('Could not find sidebar iframe');
    }
    
    const frame = await iframe.contentFrame();
    if (!frame) {
      throw new Error('Could not access sidebar iframe content');
    }
    
    // Wait for drop zone to appear (it should show when drag starts)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Look for drop zone overlay elements
    const dropZoneSelectors = [
      '[style*="rgba(24, 144, 255, 0.08)"]', // Drop zone background color
      '[style*="border: 3px dashed #1890ff"]', // Drop zone border
      '[style*="Drop text here to import"]', // Drop zone text
      '.drop-zone-overlay',
      '[data-testid*="drop"]'
    ];
    
    let dropZoneFound = false;
    let dropZoneSelector = null;
    
    for (const selector of dropZoneSelectors) {
      try {
        const element = await frame.$(selector);
        if (element) {
          const isVisible = await frame.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          }, element);
          
          if (isVisible) {
            dropZoneFound = true;
            dropZoneSelector = selector;
            console.log(`✅ Found visible drop zone with selector: ${selector}`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Drop zone selector ${selector} not found:`, error.message);
      }
    }
    
    if (!dropZoneFound) {
      // Try to find by text content
      try {
        const dropZoneText = await frame.evaluate(() => {
          const elements = document.querySelectorAll('*');
          for (const el of elements) {
            const text = el.textContent || el.innerText;
            if (text && (text.includes('Drop text here to import') || text.includes('Release to open Reference Modal'))) {
              return true;
            }
          }
          return false;
        });
        
        if (dropZoneText) {
          dropZoneFound = true;
          console.log('✅ Found drop zone by text content');
        }
      } catch (error) {
        console.log('❌ Error checking for drop zone text:', error.message);
      }
    }
    
    expect(dropZoneFound).toBe(true);
    console.log('✅ Drop zone overlay is visible during drag operation');
    
    return dropZoneFound;
  }

  async function performDropOperation() {
    console.log('💧 Performing drop operation on sidebar...');
    
    // Get the sidebar container bounds
    const sidebarBounds = await page.evaluate(() => {
      const container = document.querySelector('#ai-copilot-sidebar-container');
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    });
    
    if (!sidebarBounds) {
      throw new Error('Could not get sidebar bounds for drop operation');
    }
    
    // Trigger drop programmatically
    await page.evaluate((bounds) => {
      // Find the sidebar container
      const container = document.querySelector('#ai-copilot-sidebar-container');
      if (!container) return;
      
      // Create drop event
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        clientX: bounds.x,
        clientY: bounds.y,
        dataTransfer: new DataTransfer()
      });
      
      // Set the dropped text data
      dropEvent.dataTransfer.setData('text/plain', 'HTTPSpot');
      
      // Dispatch the drop event on the sidebar container
      container.dispatchEvent(dropEvent);
    }, sidebarBounds);
    
    console.log('✅ Drop operation completed');
  }

  async function verifyReferenceModalOpens() {
    console.log('📋 Verifying reference modal opens...');
    
    // Get the sidebar iframe
    const iframe = await page.$('#ai-copilot-sidebar-container iframe');
    if (!iframe) {
      throw new Error('Could not find sidebar iframe');
    }
    
    const frame = await iframe.contentFrame();
    if (!frame) {
      throw new Error('Could not access sidebar iframe content');
    }
    
    // Wait for reference modal to appear
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Look for reference modal elements
    const modalSelectors = [
      '[style*="Reference Material"]',
      '[style*="AI Prompt"]',
      'textarea[placeholder*="No content available"]',
      '.ant-modal',
      '[role="dialog"]'
    ];
    
    let modalFound = false;
    let modalSelector = null;
    
    for (const selector of modalSelectors) {
      try {
        const element = await frame.$(selector);
        if (element) {
          const isVisible = await frame.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          }, element);
          
          if (isVisible) {
            modalFound = true;
            modalSelector = selector;
            console.log(`✅ Found visible reference modal with selector: ${selector}`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Modal selector ${selector} not found:`, error.message);
      }
    }
    
    // Also check for modal by looking for reference modal text
    if (!modalFound) {
      const modalText = await frame.evaluate(() => {
        const elements = document.querySelectorAll('*');
        for (const el of elements) {
          const text = el.textContent || el.innerText;
          if (text.includes('Reference Material') || text.includes('AI Prompt') || text.includes('Send to AI')) {
            return el;
          }
        }
        return null;
      });
      
      if (modalText) {
        modalFound = true;
        console.log('✅ Found reference modal by text content');
      }
    }
    
    expect(modalFound).toBe(true);
    console.log('✅ Reference modal is open');
    
    return modalFound;
  }

  async function verifySelectedTextInModal() {
    console.log('📝 Verifying selected text appears in reference modal...');
    
    // Get the sidebar iframe
    const iframe = await page.$('#ai-copilot-sidebar-container iframe');
    if (!iframe) {
      throw new Error('Could not find sidebar iframe');
    }
    
    const frame = await iframe.contentFrame();
    if (!frame) {
      throw new Error('Could not access sidebar iframe content');
    }
    
    // Look for textarea with the selected text
    const textareaSelectors = [
      'textarea[placeholder*="No content available"]',
      'textarea',
      '.ant-input'
    ];
    
    let textareaFound = false;
    let selectedTextInModal = '';
    
    for (const selector of textareaSelectors) {
      try {
        const textarea = await frame.$(selector);
        if (textarea) {
          const value = await frame.evaluate(el => el.value, textarea);
          const textContent = await frame.evaluate(el => el.textContent, textarea);
          const innerText = await frame.evaluate(el => el.innerText, textarea);
          
          const text = value || textContent || innerText;
          if (text && text.trim()) {
            selectedTextInModal = text.trim();
            textareaFound = true;
            console.log(`✅ Found text in textarea (${selector}): "${selectedTextInModal}"`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Textarea selector ${selector} not found:`, error.message);
      }
    }
    
    // Also check all elements for the selected text
    if (!textareaFound) {
      const allText = await frame.evaluate(() => {
        const elements = document.querySelectorAll('*');
        for (const el of elements) {
          const text = el.textContent || el.innerText;
          if (text.includes('HTTPSpot')) {
            return text;
          }
        }
        return '';
      });
      
      if (allText) {
        selectedTextInModal = allText;
        textareaFound = true;
        console.log(`✅ Found selected text in page content: "${selectedTextInModal}"`);
      }
    }
    
    expect(textareaFound).toBe(true);
    expect(selectedTextInModal).toContain(EXPECTED_TEXT);
    
    console.log(`✅ Selected text "${EXPECTED_TEXT}" found in reference modal`);
    
    return selectedTextInModal;
  }

  it('should show drop zone when dragging and open reference modal with selected text when dropped', async () => {
    console.log('🧪 Starting drag and drop test...');
    
    // Wait for extension to load
    await waitForExtensionToLoad();
    
    // Open the AI Copilot sidebar
    await openSidebar();
    
    // Select text on the page
    const selectedText = await selectText();
    expect(selectedText).toContain(EXPECTED_TEXT);
    
    // Start drag operation
    await startDragOperation();
    
    // Verify drop zone appears
    await verifyDropZoneAppears();
    
    // Perform drop operation
    await performDropOperation();
    
    // Verify reference modal opens
    await verifyReferenceModalOpens();
    
    // Verify selected text appears in the modal
    const textInModal = await verifySelectedTextInModal();
    expect(textInModal).toContain(EXPECTED_TEXT);
    
    console.log('✅ Drag and drop test completed successfully!');
    
    // Take a screenshot before closing to show the final result
    console.log('📸 Taking screenshot of the final result...');
    const timestamp = Date.now();
    const screenshotPath = `tests/e2e/screenshots/drag-drop-test-result-${timestamp}.png`;
    
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
    console.log('🔍 This screenshot shows the drag and drop functionality working!');
  }, 60000); // 60 second timeout for the full test

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
