# AI Copilot Backend Server

A Node.js Express server that provides streaming AI chat capabilities using OpenAI and Google Gemini APIs.

## Features

- 🚀 **Streaming Responses**: Real-time streaming using Server-Sent Events (SSE)
- 🤖 **Multiple AI Providers**: Support for OpenAI GPT-4 and Google Gemini Pro
- 🔒 **Secure**: API keys stored securely on the backend
- 🛡️ **Security**: CORS, Helmet, and other security middleware
- 📊 **Health Checks**: Built-in health monitoring endpoints
- 🔧 **Configurable**: Easy configuration through environment variables

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

#### 🔐 Security Notice
**IMPORTANT**: This project contains sensitive API keys that have been moved to environment variables for security. Never commit your actual API keys to version control.

#### 📋 Required Environment Variables

##### 1. Create Environment File
Copy the example environment file and rename it to `.env`:
```bash
cp env.example .env
```

##### 2. Required API Keys

###### OpenAI API Key
- **Variable**: `OPENAI_API_KEY`
- **Description**: Your OpenAI API key for GPT-4 access
- **How to get**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
- **Format**: `sk-...`

###### Google Gemini API Key
- **Variable**: `GEMINI_API_KEY`
- **Description**: Your Google Gemini API key for AI model access
- **How to get**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Format**: `AIza...`

###### Notion API Key
- **Variable**: `NOTION_API_KEY`
- **Description**: Your Notion integration API key
- **How to get**: Visit [Notion Developers](https://www.notion.so/my-integrations)
- **Format**: `ntn_...`

###### Firecrawl API Key
- **Variable**: `FIRECRAWL_API_KEY`
- **Description**: Your Firecrawl API key for web scraping
- **How to get**: Visit [Firecrawl](https://firecrawl.dev/)
- **Format**: `fc-...`

##### 3. Optional Configuration

###### OpenAI Settings
- `OPENAI_MODEL`: Model to use (default: `gpt-4`)
- `OPENAI_MAX_TOKENS`: Maximum tokens per request (default: `1000`)
- `OPENAI_TEMPERATURE`: Response creativity (default: `0.7`)

###### Gemini Settings
- `GEMINI_MODEL`: Model to use (default: `gemini-1.5-pro`)
- `GEMINI_MAX_TOKENS`: Maximum tokens per request (default: `1000`)
- `GEMINI_TEMPERATURE`: Response creativity (default: `0.7`)

###### Server Settings
- `PORT`: Server port (default: `3001`)
- `NODE_ENV`: Environment mode (default: `development`)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

#### 🚀 Quick Start

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

#### ✅ Validation

The application will automatically validate that all required environment variables are present when starting. If any are missing, you'll see an error message listing the missing variables.

#### 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different API keys** for development and production
3. **Rotate API keys** regularly
4. **Monitor API usage** to detect unauthorized access
5. **Use environment-specific files** (`.env.development`, `.env.production`)

### 3. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Chat Endpoints
- `POST /api/chat/stream` - Stream chat response
- `GET /api/chat/models` - Get available AI models
- `GET /api/chat/test` - Test AI provider connections
- `POST /api/chat/non-stream` - Non-streaming chat response

### Chat Stream Request Format

```json
{
  "message": "Hello, how are you?",
  "provider": "openai", // or "gemini"
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant", 
      "content": "Previous response"
    }
  ]
}
```

### Chat Stream Response Format

Server-Sent Events (SSE) format:

```
data: {"content": "Hello", "provider": "openai"}

data: {"content": "! How", "provider": "openai"}

data: {"content": " can I", "provider": "openai"}

data: {"done": true, "provider": "openai"}
```

## Configuration

### AI Models

The server supports multiple AI providers:

- **OpenAI**: GPT-4 (default)
- **Google Gemini**: Gemini Pro 1.5

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `NOTION_API_KEY` | Notion API key | Required |
| `FIRECRAWL_API_KEY` | Firecrawl API key | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `ALLOWED_ORIGINS` | CORS origins | localhost URLs |

## Development

### Project Structure

```
backend/
├── config.js           # Configuration management
├── server.js           # Main server file
├── package.json        # Dependencies
├── services/
│   └── aiService.js    # AI provider integration
└── routes/
    └── chat.js         # Chat API routes
```

### Testing

Test the server endpoints:

```bash
# Health check
curl http://localhost:3001/health

# Test AI connections
curl http://localhost:3001/api/chat/test

# Get available models
curl http://localhost:3001/api/chat/models
```

## Security

- API keys are stored securely on the backend
- CORS is configured to allow only specified origins
- Helmet.js provides security headers
- Input validation and error handling

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `ALLOWED_ORIGINS` in your `.env` file
2. **API Key Errors**: Verify your OpenAI/Gemini API keys are valid
3. **Port Conflicts**: Change the `PORT` in your `.env` file

### Environment Setup Issues

#### "Missing required environment variables" Error
- Ensure your `.env` file exists in the backend directory
- Check that all required variables are set
- Verify there are no extra spaces or quotes around values

#### API Key Invalid Errors
- Verify your API keys are correct
- Check if your API keys have expired
- Ensure you have sufficient API credits/quota

#### CORS Errors
- Check your `ALLOWED_ORIGINS` setting
- Ensure your frontend URL is included in the allowed origins list

### Logs

The server provides detailed logging for debugging:

- Connection tests
- API errors
- Streaming errors
- General server errors

## License

MIT License 