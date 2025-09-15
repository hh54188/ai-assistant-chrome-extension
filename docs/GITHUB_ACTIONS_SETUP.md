# GitHub Actions Setup Guide

This guide explains how to set up the GitHub Actions test pipeline for the AI Assistant Chrome Extension project.

## Overview

The test pipeline runs automatically on:
- Pull requests targeting the `master` or `main` branch
- Pushes to the `master` or `main` branch

## Required GitHub Secrets

The pipeline requires several API keys to be configured as GitHub repository secrets. These secrets are used for testing the integration with external services.

### Required Secrets

You need to add the following secrets to your GitHub repository:

1. **`GEMINI_API_KEY`** (Required)
   - Google Gemini API key for AI chat functionality
   - Get it from: [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Used in: E2E tests, Backend tests

2. **`OPENAI_API_KEY`** (Optional but recommended)
   - OpenAI API key for GPT models
   - Get it from: [OpenAI Platform](https://platform.openai.com/api-keys)
   - Used in: Backend tests, MCP integration tests

3. **`NOTION_API_KEY`** (Optional)
   - Notion API key for Notion integration
   - Get it from: [Notion Developers](https://www.notion.so/my-integrations)
   - Used in: Backend tests, MCP integration tests

4. **`FIRECRAWL_API_KEY`** (Optional)
   - Firecrawl API key for web scraping functionality
   - Get it from: [Firecrawl](https://firecrawl.dev/)
   - Used in: Backend tests, MCP integration tests

### How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter the secret name and value
6. Click **Add secret**

## Pipeline Jobs

The test pipeline consists of 6 main jobs:

### 1. Unit Tests
- **Purpose**: Run React component and store unit tests
- **Dependencies**: None (uses mocks)
- **Commands**: 
  - `npm run test:components`
  - `npm run test:stores`
  - `npm run test`
  - `npm run test:coverage`

### 2. Backend Tests
- **Purpose**: Test backend API functionality
- **Dependencies**: All API keys (with fallback to dummy values)
- **Commands**: Individual test file execution
- **Tests**: Gemini integration, file uploads, chat sessions

### 3. E2E Tests
- **Purpose**: End-to-end testing with real Chrome browser
- **Dependencies**: Chrome Extension build, Backend server, API keys
- **Tests**: 
  - Gemini chat functionality
  - Image upload and analysis
  - Drag and drop functionality
- **Browser**: Google Chrome with Puppeteer

### 4. Lint and Code Quality
- **Purpose**: Code style and quality checks
- **Dependencies**: None
- **Commands**: `npm run lint`

### 5. Build Verification
- **Purpose**: Verify that the project builds successfully
- **Platforms**: Ubuntu, Windows, macOS
- **Verification**: Extension files, backend server startup

### 6. Test Summary
- **Purpose**: Generate a summary of all test results
- **Dependencies**: All other jobs
- **Output**: Markdown summary in GitHub Actions

## Test Categories

### Unit Tests (Fast)
- React component rendering tests
- Zustand store state management tests
- Utility function tests
- Uses mocks for external dependencies

### Backend Tests (Medium)
- API endpoint tests
- MCP server integration tests
- File upload/processing tests
- Uses real API keys (with rate limiting)

### E2E Tests (Slow)
- Full browser automation tests
- Real Chrome extension testing
- Backend server integration
- Screenshot capture for debugging

## Environment Variables

The pipeline sets the following environment variables:

```yaml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
  FIRECRAWL_API_KEY: ${{ secrets.FIRECRAWL_API_KEY }}
  NODE_ENV: test
  CI: true
  GITHUB_ACTIONS: true
```

## Artifacts

The pipeline generates several artifacts:

1. **Test Coverage Reports**: Uploaded to Codecov
2. **E2E Screenshots**: Saved for debugging failed tests
3. **Build Artifacts**: Extension files for verification

## Debugging Failed Tests

### Unit Test Failures
- Check the test output for specific assertion failures
- Review component mocks in `src/tests/setup.jsx`

### Backend Test Failures
- Verify API keys are correctly set
- Check network connectivity and API rate limits
- Review test logs for specific error messages

### E2E Test Failures
- Download and review E2E screenshots
- Check browser console logs in the test output
- Verify Chrome extension build is correct
- Ensure backend server starts successfully

## Local Testing

To run the same tests locally:

```bash
# Unit tests
cd chrome-extension
npm run test

# Backend tests
cd backend
node tests/test-gemini-conversation-tokens.js

# E2E tests
cd chrome-extension
npm run test:e2e
```

## Pipeline Status

The pipeline will show one of these statuses:

- ✅ **Success**: All tests passed
- ❌ **Failure**: Critical tests failed
- ⚠️ **Partial**: Some non-critical tests failed

## Cost Considerations

- **GitHub Actions**: Free tier includes 2,000 minutes/month
- **API Usage**: E2E tests make real API calls (monitor usage)
- **Storage**: Artifacts are retained for 7-30 days

## Security Notes

- API keys are stored as encrypted secrets
- Keys are only accessible during workflow execution
- No secrets are logged or exposed in outputs
- Dummy keys are used when secrets are not available

## Troubleshooting

### Common Issues

1. **Missing API Keys**: Add required secrets to repository
2. **Rate Limiting**: API calls may be throttled
3. **Chrome Installation**: Puppeteer may fail to install Chrome
4. **Build Failures**: Check Node.js version compatibility

### Getting Help

1. Check the GitHub Actions logs for detailed error messages
2. Review the test output for specific failures
3. Verify all required secrets are configured
4. Test locally to reproduce issues

## Updating the Pipeline

To modify the pipeline:

1. Edit `.github/workflows/test-pipeline.yml`
2. Test changes in a feature branch
3. Create a pull request to merge changes
4. Monitor the pipeline execution

The pipeline is designed to be robust and handle partial failures gracefully while providing comprehensive test coverage for the Chrome extension and backend services.
