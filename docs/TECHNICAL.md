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

For comprehensive setup instructions, see:
- [Environment Setup Guide](./ENVIRONMENT_SETUP.md) - Complete environment configuration
- [GitHub Actions Setup Guide](./GITHUB_ACTIONS_SETUP.md) - CI/CD pipeline configuration
- [Backend Development Guide](./development/backend/BASIC_README.md) - Backend setup and configuration
- [Chrome Extension Development Guide](./development/frontend/BASIC_README.md) - Extension setup and building

## ⚙️ Advanced Configuration

For detailed configuration instructions, see:
- [Backend Environment Setup](./development/backend/BASIC_README.md) - Complete backend configuration guide
- [Chrome Extension Environment Setup](./development/frontend/ENVIRONMENT.md) - Extension configuration guide

## 🔌 API Reference

For comprehensive API documentation, see:
- [Backend API Documentation](./development/backend/BASIC_README.md) - Complete API endpoints and usage
- [MCP Integration Guide](./mcp/MCP_INTEGRATION_README.md) - Model Context Protocol tools and integration

## 🧪 Testing

For comprehensive testing documentation, see:
- [Backend Testing Guide](./development/backend/BASIC_README.md) - Backend testing procedures and MCP integration tests
- [Chrome Extension Testing Guide](./development/frontend/TESTS_README.md) - Extension testing, coverage, and E2E testing
- [E2E Testing Complete Guide](./testing/E2E_TESTING_COMPLETE_GUIDE.md) - End-to-end testing procedures

## 🛠️ Available Scripts

For detailed script documentation and development commands, see:
- [Backend Development Guide](./development/backend/BASIC_README.md) - Backend scripts and development commands
- [Chrome Extension Development Guide](./development/frontend/BASIC_README.md) - Extension scripts and build commands

## 🐛 Troubleshooting

For comprehensive troubleshooting guides, see:
- [Environment Setup Guide](./ENVIRONMENT_SETUP.md) - Common setup issues and solutions
- [Backend Development Guide](./development/backend/BASIC_README.md) - Backend troubleshooting and debug mode
- [Chrome Extension Development Guide](./development/frontend/BASIC_README.md) - Extension troubleshooting and debugging

## 📚 Complete Documentation Index

This section provides a comprehensive index of all documentation files in the project:

### 🚀 Setup & Configuration
- [Environment Setup Guide](./ENVIRONMENT_SETUP.md) - Comprehensive setup instructions

### 🤖 Backend Documentation
- [Backend README](./development/backend/BASIC_README.md) - Backend development guide
- [Chat Sessions](./development/backend/CHAT_SESSIONS_README.md) - Session management system

### 🌐 Frontend Documentation
- [Chrome Extension README](./development/frontend/BASIC_README.md) - Extension development guide
- [Chrome Extension Environment](./development/frontend/ENVIRONMENT.md) - Extension configuration
- [Chrome Extension Tests](./development/frontend/TESTS_README.md) - Testing documentation
- [Chrome Extension Stores](./development/frontend/STORES_README.md) - State management documentation

### 🔌 MCP (Model Context Protocol) Documentation
- [MCP Integration Guide](./mcp/MCP_INTEGRATION_README.md) - Model Context Protocol setup and usage
- [MCP Servers Overview](./mcp/MCP_SERVERS_README.md) - MCP servers documentation
- [Firecrawl MCP Server](./mcp/FIRECRAWL_MCP_README.md) - Web page summary MCP server
- [Notion MCP Server](./mcp/NOTION_MCP_README.md) - Notion article correction MCP server
- [OpenAI Cost MCP Server](./mcp/OPENAI_COST_MCP_README.md) - OpenAI cost tracking MCP server

### 🤖 AI Agents Documentation
- [Agent Documentation Index](./agent/README.md) - Overview and setup for all AI agents
- [Creator Checker Agent](./agent/creator_checker.md) - Project creator information agent
- [Notion Article Reviewer Agent](./agent/notion_article_reviewer.md) - Automated content review for Notion articles
- [Podcast Shownotes Creator Agent](./agent/podcast_shownotes_creator.md) - Audio transcription and shownotes generation

### ⚡ Features & Usage
- [Turbo Mode Documentation](./features/TURBO_MODE_README.md) - Multi-model comparison feature
- [Screenshot Capture Guide](./features/SCREENSHOT_README.md) - Screen capture functionality
- [Screenshot Fix Guide](./features/SCREENSHOT_FIX_README.md) - Screenshot functionality fixes
- [Settings Management](./features/SETTINGS_README.md) - Extension settings and preferences
- [Coverage Enforcer](./features/COVERAGE_ENFORCER_README.md) - Automatic test coverage improvement workflow
- [Fake Stream Debug Tool](./features/FAKE_STREAM_DEBUG_README.md) - Simulate and debug streaming responses
- [AI Test Generation Example](./features/AI_TEST_GENERATION_EXAMPLE.md) - AI-powered test generation examples

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

MIT License - see the [LICENSE](../LICENSE) file for details.
