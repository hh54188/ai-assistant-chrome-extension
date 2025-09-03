# Environment Setup Guide

## 🔐 Security Notice
**IMPORTANT**: This project contains sensitive API keys that have been moved to environment variables for security. Never commit your actual API keys to version control.

## 📋 Required Environment Variables

### 1. Create Environment File
Copy the example environment file and rename it to `.env`:
```bash
cp env.example .env
```

### 2. Required API Keys

#### OpenAI API Key
- **Variable**: `OPENAI_API_KEY`
- **Description**: Your OpenAI API key for GPT-4 access
- **How to get**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
- **Format**: `sk-...`

#### Google Gemini API Key
- **Variable**: `GEMINI_API_KEY`
- **Description**: Your Google Gemini API key for AI model access
- **How to get**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Format**: `AIza...`

#### Notion API Key
- **Variable**: `NOTION_API_KEY`
- **Description**: Your Notion integration API key
- **How to get**: Visit [Notion Developers](https://www.notion.so/my-integrations)
- **Format**: `ntn_...`

#### Firecrawl API Key
- **Variable**: `FIRECRAWL_API_KEY`
- **Description**: Your Firecrawl API key for web scraping
- **How to get**: Visit [Firecrawl](https://firecrawl.dev/)
- **Format**: `fc-...`

### 3. Optional Configuration

#### OpenAI Settings
- `OPENAI_MODEL`: Model to use (default: `gpt-4`)
- `OPENAI_MAX_TOKENS`: Maximum tokens per request (default: `1000`)
- `OPENAI_TEMPERATURE`: Response creativity (default: `0.7`)

#### Gemini Settings
- `GEMINI_MODEL`: Model to use (default: `gemini-1.5-pro`)
- `GEMINI_MAX_TOKENS`: Maximum tokens per request (default: `1000`)
- `GEMINI_TEMPERATURE`: Response creativity (default: `0.7`)

#### Server Settings
- `PORT`: Server port (default: `3001`)
- `NODE_ENV`: Environment mode (default: `development`)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

## 🚀 Quick Start

1. **Copy environment template**:
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file** with your actual API keys:
   ```bash
   # Example .env file
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   GEMINI_API_KEY=AIza-your-actual-gemini-key-here
   NOTION_API_KEY=ntn_your-actual-notion-key-here
   FIRECRAWL_API_KEY=fc-your-actual-firecrawl-key-here
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

## ✅ Validation

The application will automatically validate that all required environment variables are present when starting. If any are missing, you'll see an error message listing the missing variables.

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different API keys** for development and production
3. **Rotate API keys** regularly
4. **Monitor API usage** to detect unauthorized access
5. **Use environment-specific files** (`.env.development`, `.env.production`)

## 🆘 Troubleshooting

### "Missing required environment variables" Error
- Ensure your `.env` file exists in the backend directory
- Check that all required variables are set
- Verify there are no extra spaces or quotes around values

### API Key Invalid Errors
- Verify your API keys are correct
- Check if your API keys have expired
- Ensure you have sufficient API credits/quota

### CORS Errors
- Check your `ALLOWED_ORIGINS` setting
- Ensure your frontend URL is included in the allowed origins list
