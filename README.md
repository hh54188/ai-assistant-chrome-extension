# 🚀 AI Assistant Chrome Extension

[![Introduction Video](https://img.youtube.com/vi/VyPQvJeSp9w/0.jpg)](https://youtu.be/VyPQvJeSp9w)

> **📺 Watch the Introduction Video** - Click the thumbnail above to see the extension in action!

An AI-powered assistant that works directly in your browser. Chat with AI models, capture screenshots, and use advanced features like Multi-Model Mode for comparing multiple AI responses.

**I built this app because I was frustrated by other apps charging $20 per month for similar features. My Cursor subscription also costs about $20 per month, but with it, I feel I can create a new app with the same functionality every month—each time with a different twist. Why pay so much for something I can build myself?**

> **Note:** 99% of the code in this project was written by Cursor. I was mainly responsible for review and direction.


> **Note:** I am unable to support OpenAI because I live in Beijing and only have credit cards issued in mainland China, which OpenAI does not accept for subscription payments.  
> If you're interested, you can add support for OpenAI yourself—I've already implemented part of the code, but it's currently commented out.

## 🌟 Features

### 🤖 AI Chat
Chat with Google Gemini AI models. Get real-time responses and save your conversations.

### ⚡ Multi-Model Mode
Compare responses from multiple AI models side-by-side. Choose the best one to continue your conversation.

### 🔧 Tools
AI can use tools to access external data and perform actions. Tools are managed automatically.

### 📸 Screenshots
Capture any area of web pages and attach them to your chat. Works even with scrolled content.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Chrome browser**

### 1. Setup Backend

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your API keys (see below)
npm run dev
```

### 2. Setup Chrome Extension

```bash
cd chrome-extension
npm install
cp env.example .env
# Edit .env with your settings
npm run build
```

### 3. Install Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **"Load unpacked"** and select `chrome-extension/dist`
4. The extension will appear in your toolbar

## 🔑 API Keys Setup

### Required API Keys

You need these API keys to use the extension:

- **Google Gemini** (Required): Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **OpenAI** (Optional): Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Notion** (Optional): Create at [Notion Developers](https://developers.notion.com/)
- **Firecrawl** (Optional): Sign up at [Firecrawl](https://firecrawl.dev/)

### Backend Configuration

Create `backend/.env`:

```env
# Required - Google Gemini
GEMINI_API_KEY=AIza-your-actual-gemini-key-here

# Optional - Other services
OPENAI_API_KEY=sk-your-actual-openai-key-here
NOTION_API_KEY=ntn_your-actual-notion-key-here
FIRECRAWL_API_KEY=fc-your-actual-firecrawl-key-here

# Server settings
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Extension Configuration

Create `chrome-extension/.env`:

```env
VITE_APP_NAME=AI Copilot
VITE_API_BASE_URL=http://localhost:3001
VITE_DEFAULT_MODEL=gemini-2.5-flash
VITE_DEBUG_MODE=true
```

## 📚 More Information

For technical details, development setup, and advanced configuration, see:

**[📖 Technical Documentation](./docs/TECHNICAL.md)** - Complete technical reference

## 📄 License

MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Ready to get started?** Follow the Quick Start guide above to set up your AI assistant!


<!-- Security scan triggered at 2025-09-28 15:56:35 -->