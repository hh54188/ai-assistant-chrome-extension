## Store listing

🚀 Powerful AI Assistant Right in Your Browser
Transform your browsing experience with Hiim, the ultimate AI-powered assistant that brings advanced artificial intelligence directly to any webpage. No more switching between tabs or applications - get instant AI help wherever you are on the web.

And this is totally open source! See the source code and full instruction here: https://github.com/hh54188/ai-assistant-chrome-extension

🤖 Key Features:
AI Chat - Talk to Google Gemini AI on any website
Screenshot Analysis - Capture and analyze any part of a webpage
Turbo Mode - Compare responses from multiple AI models at once
Smart Tools - AI can summarize web pages, review Notion articles, track costs

🌐 Open Source & Free:
100% Free - No subscriptions, no hidden fees
Open Source - Full code available on GitHub (MIT License): https://github.com/hh54188/ai-assistant-chrome-extension
Community Driven - Contribute, modify, extend as you want

🎯 Why Choose Hiim:
Other AI assistants charge $20+/month - this is completely free
Works on any webpage without switching tabs
You control your data and API keys
Built by developers, for developers

## Single purpose

Allow the user to communicate with the Gemini AI model in any web page

## Permission justification

**activeTab**

Required to access the currently active browser tab to read user-selected text content and inject the AI assistant sidebar. The extension uses this permission to capture user text selections from web pages and provide contextual AI assistance based on the current page content.

**scripting**

Required to inject content scripts and the sidebar interface into web pages. The extension uses chrome.scripting.executeScript() to dynamically inject the sidebar functionality into tabs when needed, allowing users to interact with the AI assistant on any website.

**storage**

Required to persistently store user settings, chat session history, AI model preferences, API keys, and conversation data across browser sessions. The extension uses Chrome's local and sync storage APIs to maintain user preferences and chat history, enabling a seamless experience across browser restarts and device synchronization.

**clipboardWrite**

Required to copy AI-generated responses and chat messages to the user's clipboard. The extension provides a "copy" button functionality that allows users to easily copy AI responses for use in other applications or documents.

**activeTab**

Required to capture screenshots of the visible tab content for AI analysis. The extension uses chrome.tabs.captureVisibleTab() to take high-quality screenshots of web pages that users can then attach to their AI conversations. This enables users to get AI assistance with visual content, analyze webpage layouts, troubleshoot UI issues, or get help with any visual elements they encounter while browsing. The activeTab permission provides temporary access to the current tab when the user interacts with the extension, allowing screenshot capture without broader tab access.

**desktopCapture**

Required for advanced screenshot capabilities and screen recording features. This permission enables the extension to capture content from the user's screen beyond just the current tab, providing additional functionality for comprehensive visual analysis and assistance.

