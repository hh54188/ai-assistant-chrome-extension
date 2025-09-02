# 🔧 Technical Documentation

This document contains all technical details, development information, and advanced configuration for the AI Assistant Chrome Extension.

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
└── README.md            # Main documentation
```

## 🚀 Development Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Chrome browser** (for extension)

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env with your API keys
# Start the server
npm run dev
```

The backend server will start on `http://localhost:3001`

### Chrome Extension Development

```bash
cd chrome-extension

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env with your settings
# Build the extension
npm run build:extension
```

## ⚙️ Advanced Configuration

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

## 🔌 API Reference

### Backend API Endpoints

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

## 🔧 Development Commands

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

## 📄 License

MIT License - see the [LICENSE](./LICENSE) file for details.
