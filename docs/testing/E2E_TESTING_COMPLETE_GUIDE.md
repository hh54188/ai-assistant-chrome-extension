# E2E Testing Complete Guide

This comprehensive guide covers everything you need to know about end-to-end testing for the AI Assistant Chrome Extension using Puppeteer.

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Test Files](#test-files)
4. [Running Tests](#running-tests)
5. [Test Configuration](#test-configuration)
6. [Test Features](#test-features)
7. [Debugging](#debugging)
8. [Troubleshooting](#troubleshooting)
9. [Technical Implementation](#technical-implementation)
10. [CI/CD Integration](#cicd-integration)
11. [Future Improvements](#future-improvements)

## Overview

This directory contains end-to-end tests for the AI Assistant Chrome Extension using Puppeteer. The tests provide comprehensive coverage of the extension's functionality including chat interactions, image uploads, and AI responses.

## Environment Setup

### Local Development

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Build the Extension
```bash
npm run build
```

#### 3. Create Backend Environment File
Create a `.env` file in the `backend/` directory by copying from the example:

```bash
cd backend
cp env.example .env
```

#### 4. Configure Required Variables
Edit `backend/.env` and set the required API keys:

```env
# Required for E2E tests
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Optional (will use dummy values if not set)
OPENAI_API_KEY=your_openai_api_key_here
NOTION_API_KEY=your_notion_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

### GitHub Actions CI

#### 1. Set Repository Secrets
In your GitHub repository, go to Settings → Secrets and variables → Actions, and add the following secrets:

**Required:**
- `GEMINI_API_KEY`: Your Google Gemini API key

**Optional:**
- `OPENAI_API_KEY`: Your OpenAI API key
- `NOTION_API_KEY`: Your Notion API key  
- `FIRECRAWL_API_KEY`: Your Firecrawl API key

#### 2. Environment Detection
The E2E tests automatically detect the environment:
- **Local**: Loads variables from `backend/.env` file
- **CI**: Uses environment variables from GitHub Actions secrets

#### 3. Environment Variable Priority
1. **CI Environment**: Uses `process.env` variables (GitHub Actions secrets)
2. **Local Environment**: Falls back to `.env` file if CI variables not available

## Test Files

### 1. `gemini-chat.e2e.test.js`
Tests basic chat functionality with Gemini AI:
- Opens the extension sidebar
- Sends a text message ("who are you")
- Verifies the response contains "google" or AI-related keywords

**Complete Flow:**
1. Starts the backend server automatically
2. Launches Chrome browser with the extension loaded
3. Opens the AI Copilot sidebar
4. Sends "who are you" message to Gemini
5. Verifies the response contains "google" or "gemini"
6. Cleans up resources

### 2. `image-upload.e2e.test.js`
Tests image upload and analysis functionality:
- Uploads a dog image (`dog.jpg`)
- Asks "What's inside this image?"
- Verifies the response contains animal-related keywords ("dog", "animal", "corgi", etc.)

## Running Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run E2E Tests in Watch Mode
```bash
npm run test:e2e:watch
```

### Run Specific Test
```bash
# Run only the image upload test
npm run test:e2e -- image-upload.e2e.test.js

# Run only the chat test
npm run test:e2e -- gemini-chat.e2e.test.js

# Run specific test with vitest
npx vitest run tests/e2e/gemini-chat.e2e.test.js
```

## Test Configuration

### Environment Detection Logic
The test automatically detects the environment using these conditions:

```javascript
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
```

- `CI=true` - Standard CI environment variable
- `GITHUB_ACTIONS=true` - GitHub Actions specific variable

### Required Environment Variables
- `GEMINI_API_KEY`: Required for AI responses
- `OPENAI_API_KEY`: Optional (uses dummy if not set)
- `NOTION_API_KEY`: Optional (uses dummy if not set)
- `FIRECRAWL_API_KEY`: Optional (uses dummy if not set)

### Backend Ports
- Chat test uses port `3001`
- Image upload test uses port `3002` (to avoid conflicts)

## Test Features

### ✅ What the E2E Tests Cover
- **Backend Server**: Automatically starts with proper environment
- **Chrome Extension**: Loads real extension into Puppeteer browser
- **Extension Activation**: Opens via Ctrl+Shift+A keyboard shortcut  
- **Real UI Interaction**: Finds textarea, types "who are you", clicks send button
- **Response Detection**: Waits for and detects new content
- **Verification**: Confirms "gemini" appears in response
- **Health Check**: Backend API responding correctly
- **Cleanup**: All resources properly cleaned up

### 🎯 Complete E2E Flow Verified
1. **Backend Server**: ✅ Auto-starts with proper environment
2. **Chrome Extension**: ✅ Loads real extension into Puppeteer browser
3. **Extension Activation**: ✅ Opens via Ctrl+Shift+A keyboard shortcut  
4. **Real UI Interaction**: ✅ Finds textarea, types "who are you", clicks send button
5. **Response Detection**: ✅ Waits for and detects new content
6. **Verification**: ✅ Confirms "gemini" appears in response
7. **Health Check**: ✅ Backend API responding correctly
8. **Cleanup**: ✅ All resources properly cleaned up

### Image Upload Test Features
- **File Upload Detection**: Automatically finds file input elements
- **Multiple Upload Methods**: Tries direct file input, button-triggered upload
- **Image Analysis**: Sends image to AI for analysis
- **Keyword Verification**: Checks for animal-related keywords in response
- **Screenshot Capture**: Takes screenshots of test results
- **Comprehensive Logging**: Detailed console output for debugging

### Supported Upload Selectors
The test tries multiple selectors to find file upload elements:
- `input[type="file"]`
- `input[accept*="image"]`
- `.ant-upload input`
- `[data-testid*="upload"]`
- `.file-upload input`
- `input[multiple]`

### Supported Upload Buttons
If no direct file input is found, the test tries these button selectors:
- `button[aria-label*="upload"]`
- `button[title*="upload"]`
- `.ant-upload button`
- `button[data-testid*="upload"]`
- `.upload-button`
- `button:has-text("Upload")`
- `button:has-text("Attach")`
- `button:has-text("Image")`

## Debugging

### Screenshots
Test screenshots are saved to `tests/e2e/screenshots/` with timestamps:
- `test-result-{timestamp}.png` - Chat test results
- `image-upload-test-result-{timestamp}.png` - Image upload test results

### Console Output
The tests provide detailed logging:
- Environment detection
- Extension loading status
- File upload progress
- API response analysis
- Error details

### Environment Status Logging
The test provides detailed logging about environment variable status:

```
🔧 Environment detection: CI=true, GitHub Actions=true
🏗️ Running in CI environment - using process.env variables
✅ Required environment variables found in CI environment
🔧 Test environment variables status:
  - GEMINI_API_KEY: ✅ Set
  - OPENAI_API_KEY: ⚠️ Using dummy
  - NOTION_API_KEY: ⚠️ Using dummy
  - FIRECRAWL_API_KEY: ⚠️ Using dummy
  - Environment: CI/GitHub Actions
```

## Troubleshooting

### Common Issues

1. **Extension not loading**: Make sure you've run `npm run build` first
2. **Backend startup fails**: Check that all required environment variables are set
3. **Gemini API errors**: Verify your API key is correct and has quota
4. **Timeout errors**: Increase timeout values in the test if needed
5. **Real Extension Issues**: Ensure the extension builds properly and all files are in `dist/` folder
6. **File Upload Not Found**: Check if the extension UI has changed
7. **Image Not Found**: Ensure `dog.jpg` exists in the test directory

### Error Handling

#### Missing Required Variables
If required variables are missing, the test will fail with clear error messages:

**Local:**
```
GEMINI_API_KEY is required in backend .env file for E2E tests
```

**CI:**
```
Missing required environment variables in CI: GEMINI_API_KEY. Please set these as GitHub Actions secrets.
```

#### Missing .env File (Local Only)
```
Backend .env file not found at /path/to/backend/.env. Please create it from env.example
```

## Technical Implementation

### Real Extension Loading
- Uses actual built extension from `dist/` folder
- Loads extension into Puppeteer Chrome with proper arguments
- Tests real user interactions with authentic extension UI

### Environment Integration
- Reads API keys from backend `.env` file automatically
- No hardcoded credentials in test files
- Proper environment variable validation

### Robust Testing
- Waits for real DOM elements to appear
- Handles dynamic content loading
- Proper error handling and cleanup
- Real browser automation testing

### Test Structure
Each test follows this pattern:
1. **Setup**: Start backend server, launch browser with extension
2. **Load Extension**: Wait for extension to initialize
3. **Open Sidebar**: Trigger the extension UI
4. **Interact**: Upload image and send message
5. **Wait for Response**: Monitor for AI response
6. **Verify**: Check response contains expected keywords
7. **Cleanup**: Close browser and stop backend server

## CI/CD Integration

### GitHub Actions Workflow
The included `.github/workflows/e2e-tests.yml` file shows how to configure the CI environment:

```yaml
- name: Run E2E tests
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
    FIRECRAWL_API_KEY: ${{ secrets.FIRECRAWL_API_KEY }}
    CI: true
    GITHUB_ACTIONS: true
  run: |
    cd chrome-extension
    npm run test:e2e
```

### Best Practices
1. **Never commit `.env` files** - They contain sensitive API keys
2. **Use GitHub Secrets** for CI environment variables
3. **Provide clear error messages** when variables are missing
4. **Use dummy values** for optional variables in tests
5. **Log environment status** for debugging purposes

## Important Notes

- **Environment Variables**: The test automatically reads the Gemini API key from the backend's `.env` file. Make sure it's properly configured.
- **Headless Mode**: Tests run in headed mode (browser visible) to help with debugging. Change `headless: false` to `headless: true` for CI environments.
- **Backend Dependency**: The test automatically starts and stops the backend server.
- **Extension Loading**: The test loads the built extension from the `dist/` folder.
- **Real Extension Testing**: Uses the actual chrome extension loaded into Puppeteer browser for authentic E2E testing.

## Contributing

When adding new E2E tests:
1. Follow the existing pattern and structure
2. Use descriptive console logging
3. Include comprehensive error handling
4. Add screenshots for visual verification
5. Update this guide with test details

## Future Improvements

- [ ] Add more comprehensive test scenarios
- [ ] Add CI/CD integration
- [ ] Add screenshot capture on test failures
- [ ] Add performance monitoring
- [ ] Test different AI models
- [ ] Test error scenarios and edge cases
