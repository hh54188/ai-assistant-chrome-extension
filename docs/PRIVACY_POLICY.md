# Privacy Policy for Hiim AI Assistant Chrome Extension

**Last updated: [Current Date]**

## Introduction

This Privacy Policy describes the data practices of the Hiim Chrome browser extension ("Extension"). **Important: This is an open-source, self-hosted application. We (the developers) do not collect, store, or have access to any of your data.** All data processing happens locally on your device and any backend services you choose to run.

## Developer Data Collection: NONE

**We (the extension developers) do not collect, store, access, or have any ability to see your data.** This is a self-hosted, open-source application.

## How Your Data is Handled (Locally)

### Data Stored on Your Device Only
All of the following data remains on your local device and is never transmitted to us:

- **Chat Messages**: Stored in your browser's local storage
- **Chat History**: All conversation sessions stored locally
- **User Preferences**: Extension settings stored in Chrome's local storage
- **API Keys**: Your personal API keys for AI services (stored locally, never shared)
- **Screenshots**: Temporarily processed on your device
- **Selected Text**: Used locally for AI context
- **File Attachments**: Processed through your local backend service

### Data Processing Architecture

1. **Browser Extension** ↔️ **Your Local Backend** ↔️ **AI Services (Your Choice)**
2. **No Developer Servers**: We don't operate any servers that handle your data
3. **Your Control**: You run the backend service on your own machine
4. **Your API Keys**: You provide your own API keys for AI services

## Third-Party Services (Your Responsibility)

When you use this extension, YOU directly interact with third-party AI services using YOUR API keys:

### AI Service Providers (Your Direct Relationship)
- **OpenAI**: If you choose to use OpenAI models with your API key
  - Your data goes directly from your local backend to OpenAI
  - Privacy Policy: https://openai.com/privacy/
- **Google Gemini**: If you choose to use Gemini models with your API key  
  - Your data goes directly from your local backend to Google
  - Privacy Policy: https://policies.google.com/privacy

### Important Notes:
- **Your Responsibility**: You are responsible for reviewing the privacy policies of any AI services you choose to use
- **Direct Relationship**: Your data flows directly to these services; we are not involved in this data transfer
- **Your API Keys**: You control which services to use and how to configure them

## What We DON'T Do (Because We Can't)

As developers of this open-source, self-hosted extension, we have **zero access** to your data:

- **No Data Collection**: We don't collect any user data whatsoever
- **No Servers**: We don't operate servers that process your information  
- **No Analytics**: We don't track usage, behavior, or any metrics
- **No Monitoring**: We can't see your chats, preferences, or activity
- **No Remote Access**: We have no way to access your local installation
- **No Telemetry**: The extension doesn't send any data back to us
- **No User Accounts**: No sign-up, no user database, no user management
- **No Advertising**: No ads, no tracking for advertising purposes
- **No Selling**: Nothing to sell since we don't have your data

## How the Extension Works (Technical Overview)

### Local-Only Architecture
1. **Extension Frontend**: Runs in your browser, stores data locally
2. **Local Backend**: You run this on your computer (localhost:3001)
3. **Your API Keys**: You configure which AI services to use
4. **Direct API Calls**: Your backend calls AI services directly with your keys

### Data Flow
```
Your Browser → Your Local Backend → AI Service (with your API key)
     ↑                ↑                    ↑
 Local storage    Your computer        Your account
```

### What This Means for Privacy
- **Complete Control**: You control all components of the system
- **No Middleman**: No data passes through our servers
- **Open Source**: You can audit all code to verify these claims
- **Local Storage**: All data stays on your device unless you send it to AI services

## Data Storage and Security (Your Responsibility)

Since this is a self-hosted application, **you** are responsible for data storage and security:

### Your Local Data Storage
- **Browser Storage**: Chat history and preferences stored in Chrome's local storage on your device
- **Local Backend**: Any temporary files processed by your local backend service
- **API Keys**: Stored locally in your browser (never transmitted anywhere by the extension itself)

### Security Considerations
- **Local Security**: Secure your computer and browser as you normally would
- **API Key Security**: Keep your AI service API keys secure
- **Network Security**: Your local backend communicates with AI services over HTTPS
- **Open Source Transparency**: All code is open source and can be audited

### Your Control
- **Data Retention**: You decide how long to keep chat history
- **Data Deletion**: You can clear all data by uninstalling the extension or clearing browser storage
- **Backup**: You can backup your chat history if desired (it's stored locally)
- **Migration**: You can move your data between devices by exporting/importing browser storage

## Third-Party Services (Your Direct Relationship)

**We don't share your information with anyone because we don't have access to it.** However, when you use the extension, YOU may choose to interact with third-party services:

### AI Services (Your Choice, Your API Keys)
If you configure the extension to use these services with your own API keys:

- **OpenAI**: Your local backend may send data directly to OpenAI using your API key
  - Privacy Policy: https://openai.com/privacy/
  - Your responsibility to review their terms
- **Google Gemini**: Your local backend may send data directly to Google using your API key
  - Privacy Policy: https://policies.google.com/privacy  
  - Your responsibility to review their terms

### MCP (Model Context Protocol) Services
If you enable optional MCP integrations, your local backend may interact with:
- **Notion API**: If you configure Notion integration with your API key
- **Web Crawling Services**: If you enable webpage summarization features
- **Other Services**: Any additional MCP servers you choose to run

### Important Notes:
- **Your API Keys**: All API keys are yours and stored locally
- **Your Choice**: You decide which services to use, if any
- **Direct Communication**: Your backend talks directly to these services
- **No Middleman**: We are not involved in these data transfers
- **Your Responsibility**: You should review the privacy policies of any services you choose to use

## Data Retention (Your Control)

Since all data is stored locally on your device:

- **Chat History**: Retained in your browser until you delete it
- **User Preferences**: Stored locally until you clear browser data or uninstall the extension
- **Temporary Files**: Processed locally by your backend, retention depends on your configuration
- **No Server Logs**: We don't have servers, so we don't retain any logs about your usage

## Your Rights and Control

Since you control all aspects of this self-hosted application:

### Complete Data Control
- **Full Access**: All your data is stored locally on your device
- **Delete Anytime**: Clear chat history, preferences, or all data through browser settings
- **Export Data**: Access your local browser storage to export chat history
- **Modify Everything**: Change settings, AI providers, configurations as you wish
- **Audit Code**: Review all source code to understand exactly how your data is handled

### Extension Management
- **Browser Permissions**: Manage extension permissions through Chrome settings
- **Feature Control**: Enable/disable features like screenshots, file uploads, MCP integrations
- **Complete Removal**: Uninstall the extension to remove all data
- **No Account Needed**: No sign-up, no account deletion process needed

### Technical Control
- **Backend Configuration**: You control your local backend server
- **API Key Management**: You manage your own API keys for AI services  
- **Network Control**: You control what external services your backend communicates with
- **Open Source**: Fork, modify, or audit the code as needed

## Children's Privacy

This extension can be used by anyone who can set up the technical requirements. Since we don't collect any data, there are no special considerations for children's data. However, parents should be aware that if children use AI services through this extension, those services' privacy policies will apply.

## International Data Transfers

Since this is a self-hosted application:
- **No International Transfers by Us**: We don't transfer any data internationally because we don't have access to your data
- **Your Choice**: If you choose to use AI services (OpenAI, Google, etc.), your data may be processed internationally according to their policies
- **Your Control**: You decide which services to use and can review their international data transfer policies

## Changes to This Privacy Policy

Since this is an open-source project, privacy policy updates will be:
- **Version Controlled**: All changes tracked in the project's Git repository
- **Transparent**: You can see exactly what changed and when
- **Community Driven**: Changes can be discussed through GitHub issues/pull requests
- **Your Choice**: You can review changes before updating the extension

## Contact Information

For questions about this Privacy Policy or the open-source project:

- **GitHub Repository**: [https://github.com/hh54188/ai-assistant-chrome-extension](https://github.com/hh54188/ai-assistant-chrome-extension) - Primary support channel
- **Issues**: Report privacy concerns or questions via GitHub Issues
- **Email**: liguangyi08@gmail.com (if applicable)
- **Community**: Join discussions in the project's community channels

## Open Source Transparency

This privacy policy reflects the reality of an open-source, self-hosted application:
- **Code Audit**: All source code is available for review at [GitHub Repository URL]
- **No Hidden Functionality**: Everything the extension does is visible in the source code
- **Community Oversight**: The open-source community can verify these privacy claims
- **Fork Freedom**: You can fork and modify the code if you have different privacy requirements

## Chrome Web Store Compliance

This Privacy Policy complies with Chrome Web Store Developer Program Policies by providing:
- **Accurate Disclosure**: Honest representation that we collect no data
- **Complete Transparency**: Full explanation of local-only data handling  
- **Third-Party Clarity**: Clear explanation of user's direct relationships with AI services
- **User Control**: Comprehensive description of user's complete control over their data

## Technical Details

### Extension Permissions (Why We Need Them)
- **activeTab**: Read current webpage content to provide AI context
- **scripting**: Inject the sidebar interface into web pages
- **storage**: Store your preferences and chat history locally in your browser
- **clipboardWrite/Read**: Copy AI responses and paste content
- **desktopCapture**: Take screenshots for AI analysis
- **tabs**: Manage the extension's integration with browser tabs

### Actual Data Flow
```
Your Browser (local storage) ↔ Your Local Backend ↔ AI Services (your API keys)
         ↑                            ↑                        ↑
    Extension UI              localhost:3001              Your accounts
```

### What This Architecture Means
- **No Developer Servers**: We don't operate any servers that process your data
- **No Data Collection**: Impossible for us to collect data since it never reaches us
- **Complete User Control**: You own and control every component of the system
- **Maximum Privacy**: Your data never leaves your control except when you send it to AI services
