# E2E Tests for Chrome Extension

This directory contains end-to-end tests for the AI Assistant Chrome Extension.

## Test Files

### 1. `gemini-chat.e2e.test.js`
Tests basic chat functionality with Gemini AI:
- Opens the extension sidebar
- Sends a text message ("who are you")
- Verifies the response contains "google" or AI-related keywords

### 2. `image-upload.e2e.test.js` (NEW)
Tests image upload and analysis functionality:
- Uploads a dog image (`dog.jpg`)
- Asks "What's inside this image?"
- Verifies the response contains animal-related keywords ("dog", "animal", "corgi", etc.)

## Prerequisites

1. **Backend Server**: The backend server must be running with proper API keys
2. **Environment Variables**: Set up your `.env` file in the backend directory
3. **Extension Build**: The extension must be built (`npm run build`)
4. **Test Image**: The `dog.jpg` file must be present in this directory

## Running Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test
```bash
# Run only the image upload test
npm run test:e2e -- image-upload.e2e.test.js

# Run only the chat test
npm run test:e2e -- gemini-chat.e2e.test.js
```

### Run with Watch Mode
```bash
npm run test:e2e:watch
```

## Test Configuration

### Environment Setup
The tests automatically detect whether they're running in:
- **Local environment**: Loads `.env` from `../../../backend/.env`
- **CI environment**: Uses environment variables from `process.env`

### Required Environment Variables
- `GEMINI_API_KEY`: Required for AI responses
- `OPENAI_API_KEY`: Optional (uses dummy if not set)
- `NOTION_API_KEY`: Optional (uses dummy if not set)
- `FIRECRAWL_API_KEY`: Optional (uses dummy if not set)

### Backend Ports
- Chat test uses port `3001`
- Image upload test uses port `3002` (to avoid conflicts)

## Test Features

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

### Common Issues

1. **Extension Not Loading**: Ensure the extension is built and the path is correct
2. **File Upload Not Found**: Check if the extension UI has changed
3. **API Timeout**: Verify API keys are set correctly
4. **Image Not Found**: Ensure `dog.jpg` exists in the test directory

## Test Structure

Each test follows this pattern:
1. **Setup**: Start backend server, launch browser with extension
2. **Load Extension**: Wait for extension to initialize
3. **Open Sidebar**: Trigger the extension UI
4. **Interact**: Upload image and send message
5. **Wait for Response**: Monitor for AI response
6. **Verify**: Check response contains expected keywords
7. **Cleanup**: Close browser and stop backend server

## Contributing

When adding new E2E tests:
1. Follow the existing pattern and structure
2. Use descriptive console logging
3. Include comprehensive error handling
4. Add screenshots for visual verification
5. Update this README with test details
