# Settings Panel Documentation

## Overview
The Settings Panel allows users to configure how the application communicates with AI services. It provides two main configuration options:

1. **Direct API Mode** - Enables direct communication with Gemini API
2. **API Key Management** - Stores and manages the user's Gemini API key

## Features

### Direct API Mode
- **What it does**: When enabled, messages are sent directly to the Gemini API using your API key, bypassing the backend server
- **Default state**: Disabled (messages go through backend server first)
- **Benefits**: 
  - Faster response times (no backend processing delay)
  - Direct control over API usage
  - Works even when backend is unavailable
  - Uses official Google GenAI SDK for reliable communication
  - Proper streaming support with abort controller
- **Requirements**: Must have a valid Gemini API key configured

### API Key Management
- **Storage**: API keys are stored locally in the browser's localStorage
- **Security**: Keys are never sent to our servers
- **Validation**: The system checks for valid API keys when Direct API Mode is enabled

## How to Use

### Opening Settings
1. Click the settings button (gear icon) in the MenuBar
2. The Settings Modal will appear with current configuration

### Configuring Direct API Mode
1. Toggle the "Direct API Mode" switch to enable/disable
2. When enabled, you'll see a warning message
3. Make sure you have a valid API key configured

### Setting API Key
1. Enter your Gemini API key in the "Gemini API Key" field
2. The field is password-protected for security
3. API key is required when Direct API Mode is enabled
4. Click "Save" to store the configuration

### Saving Changes
- Click "Save" to apply and store your settings
- Click "Cancel" to discard changes and revert to previous settings
- Settings are automatically loaded when the modal opens

## Technical Details

### Storage
- Settings are stored in `localStorage`
- Keys used:
  - `frontendOnlyMode`: Boolean string ("true"/"false")
  - `geminiApiKey`: The user's Gemini API key

### API Integration
- When Direct API Mode is enabled and a Gemini provider is selected:
  - Messages are sent directly using the `@google/genai` SDK
  - Uses the user's API key for authentication
  - Supports streaming responses with proper error handling
  - Uses the same model (`gemini-2.0-flash-exp`) as the backend
- When Direct API Mode is disabled:
  - Messages are sent to the backend server as before
  - Backend handles all API communication

### Error Handling
- Validates API key presence when Direct API Mode is enabled
- Shows appropriate error messages for API failures
- Gracefully falls back to backend mode if direct API fails
- Proper abort controller support for cancelling requests
- Uses the official Google GenAI SDK for reliable API communication

## Security Considerations

- API keys are stored locally and never transmitted to our servers
- Keys are stored in password-protected input fields
- Direct API mode only works with Gemini providers
- All communication with Gemini API uses HTTPS

## Troubleshooting

### Direct API Mode Not Working
1. Ensure you have a valid Gemini API key
2. Check that the API key is properly saved
3. Verify you're using a Gemini provider
4. Check browser console for error messages

### API Key Issues
1. Verify the API key is correct and active
2. Check if the API key has proper permissions
3. Ensure the API key is for Gemini services

### Performance Issues
1. Direct API mode may be faster but uses your API quota
2. Backend mode may be slower but provides additional features
3. Consider switching modes based on your needs
