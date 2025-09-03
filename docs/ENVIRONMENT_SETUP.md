# 🔐 Environment Setup Guide

## 🚨 Security Alert
**CRITICAL**: This project contained hardcoded API keys that have been extracted to environment variables. 
**NEVER commit your actual API keys to version control.**

## 📁 Project Structure

```
power-apps/
├── backend/           # Node.js backend server
│   ├── .env          # Backend environment variables (create this)
│   ├── env.example   # Backend environment template
│   └── ENVIRONMENT_SETUP.md  # Detailed backend setup
├── chrome-extension/ # Chrome extension frontend
│   ├── .env          # Frontend environment variables (create this)
│   └── env.example  # Frontend environment template
└── .gitignore        # Already configured to ignore .env files
```

## 🚀 Quick Setup

### Backend Setup
1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Copy environment template**:
   ```bash
   cp env.example .env
   ```

3. **Edit `.env` with your API keys**:
   ```bash
   # Required API Keys
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   GEMINI_API_KEY=AIza-your-actual-gemini-key-here
   NOTION_API_KEY=ntn_your-actual-notion-key-here
   FIRECRAWL_API_KEY=fc-your-actual-firecrawl-key-here
   
   # Optional Settings
   PORT=3001
   NODE_ENV=development
   ```

### Frontend Setup
1. **Navigate to chrome-extension directory**:
   ```bash
   cd chrome-extension
   ```

2. **Copy environment template**:
   ```bash
   cp env.example .env
   ```

3. **Edit `.env` with your settings**:
   ```bash
   VITE_APP_NAME=YourAppName
   VITE_API_BASE_URL=http://localhost:3001
   VITE_DEFAULT_MODEL=gemini-2.5-flash
   ```

## 🔑 Required API Keys

### Backend Services
- **OpenAI**: For GPT-4 AI model access
- **Google Gemini**: For Gemini AI model access  
- **Notion**: For Notion integration features
- **Firecrawl**: For web scraping capabilities

### Frontend Services
- **API Base URL**: Points to your backend server
- **Default Model**: Preferred AI model for chat

## ✅ Verification

### Backend Validation
The backend will automatically validate all required environment variables on startup. If any are missing, you'll see:
```
❌ Missing required environment variables:
   - OPENAI_API_KEY
   - GEMINI_API_KEY
   Please check your .env file and ensure all required variables are set.
```

### Frontend Validation
Check the browser console for any environment-related errors.

## 🔒 Security Best Practices

1. **Environment Files**: 
   - ✅ `.env.example` - Safe to commit (contains placeholders)
   - ❌ `.env` - Never commit (contains real API keys)

2. **API Key Management**:
   - Use different keys for development/production
   - Rotate keys regularly
   - Monitor usage for unauthorized access

3. **Version Control**:
   - `.gitignore` already excludes `.env` files
   - Double-check before committing sensitive data

## 🆘 Troubleshooting

### Common Issues

**"Missing required environment variables"**
- Ensure `.env` file exists in the correct directory
- Check for typos in variable names
- Verify no extra spaces or quotes around values

**"API key invalid" errors**
- Verify API keys are correct and active
- Check if keys have expired or hit rate limits
- Ensure sufficient API credits/quota

**CORS errors**
- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check that backend and frontend ports match

### Getting Help

- **Backend issues**: See [BACKEND_ENVIRONMENT_SETUP.md](./BACKEND_ENVIRONMENT_SETUP.md)
- **Frontend issues**: See [CHROME_EXTENSION_ENVIRONMENT.md](./CHROME_EXTENSION_ENVIRONMENT.md)
- **General issues**: Check the main [README.md](../README.md)

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Notion API Documentation](https://developers.notion.com/)
- [Firecrawl Documentation](https://docs.firecrawl.dev/)
