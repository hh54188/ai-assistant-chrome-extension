# 🚀 AI Copilot Power Apps

A comprehensive AI-powered assistant system consisting of a Node.js backend server and a Chrome extension frontend. This project provides streaming AI chat capabilities with multiple AI providers, MCP (Model Context Protocol) integration, advanced features like Turbo Mode, and screenshot capture functionality.

## 🌟 Features

### 🤖 AI Chat System
- **Multi-Provider Support**: OpenAI GPT-4 and Google Gemini Pro models
- **Streaming Responses**: Real-time streaming using Server-Sent Events (SSE)
- **Conversation History**: Persistent chat sessions with full conversation context
- **Model Switching**: Switch between different AI models within conversations

### ⚡ Turbo Mode
- **Multi-Model Comparison**: Send messages to multiple AI models simultaneously
- **Side-by-Side Responses**: Compare responses from different AI providers
- **Model Selection**: Choose the best response to continue your conversation
- **Session Management**: Automatically save turbo conversations as sessions

### 🔧 MCP Integration
- **Tool Execution**: AI models can execute tools via Model Context Protocol
- **Automatic Server Management**: MCP server starts automatically with the backend
- **Native Tool Binding**: Proper integration with Gemini's tool system
- **Extensible**: Easy to add new tools and capabilities

### 📸 Screenshot Capture
- **Area Selection**: Drag to select any rectangular area on web pages
- **Scroll Support**: Captures content even when scrolled
- **Chrome Extension Compatible**: Works seamlessly in extension context
- **Base64 Output**: Easy integration with chat attachments

### 🛡️ Security & Performance
- **Secure API Key Management**: All API keys stored securely on backend
- **CORS Protection**: Configurable CORS with security headers
- **Health Monitoring**: Built-in health check endpoints
- **Compression**: Response compression for better performance

## 🏗️ Architecture

```
power-apps/
├── backend/              # Node.js Express server
│   ├── services/         # AI service integrations
│   ├── routes/          # API endpoints
│   ├── mcp-servers/     # MCP tool implementations
│   └── tests/           # Backend tests
├── chrome-extension/     # React Chrome extension
│   ├── src/             # React components and services
│   ├── public/          # Extension manifest and assets
│   └── dist/            # Built extension (generated)
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Chrome browser** (for extension)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env with your API keys (see configuration section below)
# Start the server
npm run dev
```

The backend server will start on `http://localhost:3001`

### 2. Chrome Extension Setup

```bash
# Navigate to chrome extension directory
cd chrome-extension

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env with your settings
# Build the extension
npm run build:extension
```

### 3. Install Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **"Load unpacked"** and select the `chrome-extension/dist` folder
4. The extension will appear in your Chrome toolbar

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Required API Keys
OPENAI_API_KEY=sk-your-actual-openai-key-here
GEMINI_API_KEY=AIza-your-actual-gemini-key-here
NOTION_API_KEY=ntn_your-actual-notion-key-here
FIRECRAWL_API_KEY=fc-your-actual-firecrawl-key-here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Chrome Extension Environment Variables

Create a `.env` file in the `chrome-extension/` directory:

```env
# App Configuration
VITE_APP_NAME=AI Copilot
VITE_API_BASE_URL=http://localhost:3001
VITE_DEFAULT_MODEL=gemini-2.5-flash

# Development Settings
VITE_DEBUG_MODE=true
```

### Getting API Keys

- **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Google Gemini**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Notion**: Create an integration at [Notion Developers](https://developers.notion.com/)
- **Firecrawl**: Sign up at [Firecrawl](https://firecrawl.dev/) for web scraping capabilities

## 🎯 Usage

### Chrome Extension

1. **Activate Extension**: Click the extension icon or use `Ctrl+Shift+A` (Windows/Linux) or `Cmd+Shift+A` (Mac)
2. **Chat Interface**: The sidebar will appear on the right side of any webpage
3. **Send Messages**: Type your message and press Enter or click Send
4. **Switch Models**: Click the model dropdown to change AI providers
5. **Screenshot**: Click the camera icon to capture screen areas
6. **Turbo Mode**: Click the ⚡ icon to enable multi-model comparison

### Backend API

The backend provides RESTful APIs:

- `GET /health` - Health check
- `POST /api/chat/stream` - Stream chat responses
- `GET /api/chat/models` - Get available AI models
- `POST /api/chat/non-stream` - Non-streaming chat responses

### MCP Tools

The system includes built-in MCP tools:
- **check-creator**: Get project creator information
- **get-project-info**: Get comprehensive project details

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Test MCP integration
npm run test-mcp

# Test specific MCP servers
node tests/test-notion-article-correction-mcp.js
node tests/test-openai-cost-mcp.js
node tests/test-web-page-summary-for-firecrawl-mcp.js
```

### Chrome Extension Tests

```bash
cd chrome-extension

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:stores
npm run test:components
```

## 📚 Detailed Documentation

For more detailed information, see the following documentation:

### Setup & Configuration
- [Environment Setup Guide](./ENVIRONMENT_SETUP.md) - Comprehensive setup instructions
- [Backend Environment Setup](./backend/ENVIRONMENT_SETUP.md) - Backend-specific configuration
- [Chrome Extension Environment](./chrome-extension/ENVIRONMENT.md) - Extension configuration

### Features & Usage
- [MCP Integration Guide](./backend/MCP_INTEGRATION_README.md) - Model Context Protocol setup and usage
- [Turbo Mode Documentation](./chrome-extension/TURBO_MODE_README.md) - Multi-model comparison feature
- [Screenshot Capture Guide](./chrome-extension/SCREENSHOT_README.md) - Screen capture functionality
- [Settings Management](./chrome-extension/SETTINGS_README.md) - Extension settings and preferences

### Development & Testing
- [Backend README](./backend/README.md) - Backend development guide
- [Chrome Extension README](./chrome-extension/README.md) - Extension development guide
- [Chat Sessions](./backend/CHAT_SESSIONS_README.md) - Session management system

## 🔧 Development

### Backend Development

```bash
cd backend

# Development with auto-reload
npm run dev

# Start MCP server manually (if needed)
npm run mcp-server

# Run example MCP usage
npm run demo-mcp
```

### Chrome Extension Development

```bash
cd chrome-extension

# Development mode
npm run dev

# Build for production
npm run build

# Build extension package
npm run build:extension

# Lint code
npm run lint
```

## 🛠️ Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run mcp-server` - Start MCP server manually
- `npm run test-mcp` - Test MCP integration
- `npm run demo-mcp` - Run MCP usage examples

### Chrome Extension Scripts
- `npm run dev` - Start Vite development server
- `npm run build` - Build React application
- `npm run build:extension` - Build complete Chrome extension
- `npm test` - Run test suite
- `npm run lint` - Lint code

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check that all required environment variables are set in `.env`
- Verify API keys are valid and have sufficient credits
- Ensure port 3001 is not in use

**Chrome extension not loading:**
- Make sure the extension is built: `npm run build:extension`
- Check that Developer Mode is enabled in Chrome
- Verify the `dist` folder contains all necessary files

**CORS errors:**
- Verify `ALLOWED_ORIGINS` in backend `.env` includes your frontend URL
- Check that backend is running on the expected port

**API key errors:**
- Ensure API keys are correctly formatted (no extra spaces/quotes)
- Verify API keys have sufficient credits and are not expired
- Check API key permissions and rate limits

### Debug Mode

Enable debug logging:

**Backend:** Set `NODE_ENV=development` in `.env`
**Chrome Extension:** Set `VITE_DEBUG_MODE=true` in `.env`

## 📄 License

MIT License - see the [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for GPT models
- [Google](https://ai.google.dev/) for Gemini models
- [Model Context Protocol](https://modelcontextprotocol.io/) for tool integration
- [React](https://reactjs.org/) for the frontend framework
- [Ant Design](https://ant.design/) for UI components
- [Express.js](https://expressjs.com/) for the backend framework

---

**Happy coding! 🚀**

For questions or support, please check the detailed documentation in the respective directories or open an issue on GitHub.
