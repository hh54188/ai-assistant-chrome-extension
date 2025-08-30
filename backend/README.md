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

**📋 For detailed environment setup instructions, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)**

Create a `.env` file in the backend directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Gemini Configuration (optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Notion Configuration
NOTION_API_KEY=your_notion_api_key_here

# Firecrawl Configuration
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

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

### Logs

The server provides detailed logging for debugging:

- Connection tests
- API errors
- Streaming errors
- General server errors

## License

MIT License 