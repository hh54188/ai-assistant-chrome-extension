# E2E Tests for Chrome Extension

This directory contains end-to-end tests for the AI Assistant Chrome Extension using Puppeteer.

## Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Build the extension**:
   ```bash
   npm run build
   ```

3. **Set up environment variables**:
   - Copy `../../backend/env.example` to `../../backend/.env`
   - Add your actual `GEMINI_API_KEY` to the backend `.env` file
   - The test will automatically read the API key from the backend's `.env` file

## Running Tests

### Run all E2E tests:
```bash
npm run test:e2e
```

### Run E2E tests in watch mode:
```bash
npm run test:e2e:watch
```

### Run specific test:
```bash
npx vitest run tests/e2e/gemini-chat.e2e.test.js
```

## Test Structure

### `gemini-chat.e2e.test.js`
Tests the complete flow:
1. Starts the backend server automatically
2. Launches Chrome browser with the extension loaded
3. Opens the AI Copilot sidebar
4. Sends "who are you" message to Gemini
5. Verifies the response contains "google" or "gemini"
6. Cleans up resources

## Important Notes

- **Environment Variables**: The test automatically reads the Gemini API key from the backend's `.env` file. Make sure it's properly configured.
- **Headless Mode**: Tests run in headed mode (browser visible) to help with debugging. Change `headless: false` to `headless: true` for CI environments.
- **Backend Dependency**: The test automatically starts and stops the backend server.
- **Extension Loading**: The test loads the built extension from the `dist/` folder.
- **Real Extension Testing**: Uses the actual chrome extension loaded into Puppeteer browser for authentic E2E testing.

## Test Features

### ✅ What the E2E Test Covers
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

## Troubleshooting

1. **Extension not loading**: Make sure you've run `npm run build` first
2. **Backend startup fails**: Check that all required environment variables are set
3. **Gemini API errors**: Verify your API key is correct and has quota
4. **Timeout errors**: Increase timeout values in the test if needed
5. **Real Extension Issues**: Ensure the extension builds properly and all files are in `dist/` folder

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

## Future Improvements

- [ ] Add more comprehensive test scenarios
- [ ] Add CI/CD integration
- [ ] Add screenshot capture on test failures
- [ ] Add performance monitoring
- [ ] Test different AI models
- [ ] Test error scenarios and edge cases
