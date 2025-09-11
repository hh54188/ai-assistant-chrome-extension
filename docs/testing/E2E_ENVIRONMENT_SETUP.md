# E2E Test Environment Setup

This document explains how to set up environment variables for E2E tests in both local development and CI environments.

## Local Development

### 1. Create Backend Environment File

Create a `.env` file in the `backend/` directory by copying from the example:

```bash
cd backend
cp env.example .env
```

### 2. Configure Required Variables

Edit `backend/.env` and set the required API keys:

```env
# Required for E2E tests
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Optional (will use dummy values if not set)
OPENAI_API_KEY=your_openai_api_key_here
NOTION_API_KEY=your_notion_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

### 3. Run E2E Tests

```bash
cd chrome-extension
npm run test:e2e
```

## GitHub Actions CI

### 1. Set Repository Secrets

In your GitHub repository, go to Settings → Secrets and variables → Actions, and add the following secrets:

**Required:**
- `GEMINI_API_KEY`: Your Google Gemini API key

**Optional:**
- `OPENAI_API_KEY`: Your OpenAI API key
- `NOTION_API_KEY`: Your Notion API key  
- `FIRECRAWL_API_KEY`: Your Firecrawl API key

### 2. Environment Detection

The E2E tests automatically detect the environment:

- **Local**: Loads variables from `backend/.env` file
- **CI**: Uses environment variables from GitHub Actions secrets

### 3. Environment Variable Priority

1. **CI Environment**: Uses `process.env` variables (GitHub Actions secrets)
2. **Local Environment**: Falls back to `.env` file if CI variables not available

## Environment Detection Logic

The test automatically detects the environment using these conditions:

```javascript
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
```

- `CI=true` - Standard CI environment variable
- `GITHUB_ACTIONS=true` - GitHub Actions specific variable

## Debugging

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

## Error Handling

### Missing Required Variables

If required variables are missing, the test will fail with clear error messages:

**Local:**
```
GEMINI_API_KEY is required in backend .env file for E2E tests
```

**CI:**
```
Missing required environment variables in CI: GEMINI_API_KEY. Please set these as GitHub Actions secrets.
```

### Missing .env File (Local Only)

```
Backend .env file not found at /path/to/backend/.env. Please create it from env.example
```

## GitHub Actions Workflow

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

## Best Practices

1. **Never commit `.env` files** - They contain sensitive API keys
2. **Use GitHub Secrets** for CI environment variables
3. **Provide clear error messages** when variables are missing
4. **Use dummy values** for optional variables in tests
5. **Log environment status** for debugging purposes
