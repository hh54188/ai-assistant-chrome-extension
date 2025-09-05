# ForceConfigModal Component

## Overview

The `ForceConfigModal` is a beautiful modal dialog that appears when users first install the Chrome extension and haven't configured their setup yet. It forces users to choose between two configuration options when the backend server is not available.

## Features

- **Automatic Detection**: Shows automatically when backend is offline and no Gemini API key is configured
- **Two Configuration Options**:
  1. **Direct API Mode**: Use Gemini API key directly (frontend-only)
  2. **Backend Setup**: Instructions to run the backend server
- **Retry Functionality**: Test backend connection with a retry button
- **Beautiful UI**: Matches the design of SettingsModal with modern styling
- **Non-dismissible**: Users must configure one option to proceed

## Usage

The modal is automatically managed by the `CopilotSidebar` component and will show when:
- Backend connection is not available (`connectionStatus === false`)
- No Gemini API key is configured
- Connection status is not loading

## Props

```jsx
<ForceConfigModal
    visible={boolean}                    // Whether modal is visible
    connectionStatus={boolean}           // Backend connection status
    onRetryConnection={function}         // Function to retry backend connection
    onConfigured={function}             // Called when configuration is complete
/>
```

## Configuration Logic

1. **Check Connection**: On app start, check if backend is available
2. **Check API Key**: Verify if Gemini API key is stored locally
3. **Show Modal**: If neither is available, force configuration
4. **Auto-hide**: Modal disappears once either option is configured

## User Experience

### Option 1: Direct API Mode
- User enters their Gemini API key
- Key is validated and stored locally
- Frontend-only mode is enabled
- Modal closes and app becomes usable

### Option 2: Backend Setup
- User clicks "View Setup Guide" to open documentation
- User can test connection with "Test Connection" button
- Once backend is detected, modal closes automatically

## Styling

The modal uses a beautiful design with:
- Backdrop blur effect
- Modern card design with rounded corners
- Option cards with numbered steps
- Color-coded success/warning messages
- Responsive design for different screen sizes

## Integration

The modal is integrated into the main app flow through:
- `useConnectionStatus` hook for backend detection
- `useChromeStorage` hook for API key management
- Zustand store for modal state management
- Automatic show/hide logic in `useEffect`

## Security

- API keys are stored locally in Chrome storage
- Keys are never sent to external servers
- Secure handling of sensitive configuration data
