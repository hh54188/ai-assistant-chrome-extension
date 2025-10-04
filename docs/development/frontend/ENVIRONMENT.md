# Environment Configuration

This document explains how environment variables work in this Chrome extension project.

## 🌍 Environment Detection

The project automatically detects the environment based on how it's running:

### **Development Mode**
- **Triggered by**: `npm run dev`
- **Environment**: `import.meta.env.MODE = "development"`
- **Storage**: Uses `localStorage` with prefixed keys
- **Demo**: Shows Storage Demo component

### **Production Mode**
- **Triggered by**: `npm run build` or `npm run build:extension`
- **Environment**: `import.meta.env.MODE = "production"`
- **Storage**: Uses `chrome.storage` API
- **Demo**: Shows Copilot Demo component

### **Chrome Extension Mode**
- **Triggered by**: Running as loaded Chrome extension
- **Detection**: `chrome.runtime.id` exists
- **Storage**: Uses `chrome.storage` API

## 🔧 Environment Variables

### **Available Variables**

Create a `.env` file in the project root with these variables:

```bash
# App Configuration
VITE_APP_NAME=Him
VITE_APP_VERSION=1.0.0

# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_DEFAULT_MODEL=gemini-2.5-flash

# Development Settings
VITE_ENABLE_STORAGE_DEMO=true
VITE_DEBUG_MODE=true
```

### **How to Use**

1. **Copy the example file**:
   ```bash
   cp env.example .env
   ```

2. **Modify the values** as needed

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

## 📁 File Structure

```
chrome-extension/
├── .env                    # Environment variables (create this)
├── env.example            # Example environment file
├── src/
│   ├── utils/
│   │   └── environment.js  # Environment detection utility
│   ├── hooks/
│   │   └── useChromeStorage.js  # Storage hook
│   └── App.jsx            # Main app component
└── vite.config.js         # Vite configuration
```

## 🚀 Usage Examples

### **In Components**
```javascript
import { getConfig, isDevelopment, isChromeExtension } from '../utils/environment';

const MyComponent = () => {
  const config = getConfig();
  
  if (config.isDev) {
    console.log('Running in development mode');
  }
  
  if (config.isExtension) {
    console.log('Running as Chrome extension');
  }
};
```

### **In Storage Hook**
```javascript
import useChromeStorage from '../hooks/useChromeStorage';

const MyComponent = () => {
  // Automatically uses localStorage in dev, chrome.storage in extension
  const [apiKey, setApiKey] = useChromeStorage('apiKey', '', STORAGE_TYPES.SYNC);
};
```

## 🔍 Debugging

### **Check Environment**
Open browser console and look for:
```
🌍 Environment Configuration: {
  mode: "development",
  isDevelopment: true,
  isProduction: false,
  isChromeExtension: false,
  appName: "Him",
  apiBaseUrl: "http://localhost:3001",
  storagePrefix: "dev_"
}
```

### **Check Storage Keys**
In development mode, localStorage keys will be prefixed:
- `dev_local_apiKey`
- `dev_sync_theme`
- `dev_session_tempData`

## ⚙️ Configuration Options

### **VITE_ENABLE_STORAGE_DEMO**
- `true`: Shows storage demo in development
- `false`: Shows copilot demo in development

### **VITE_DEBUG_MODE**
- `true`: Enables additional logging
- `false`: Reduces console output

### **VITE_API_BASE_URL**
- Development: `http://localhost:3001`
- Production: Your actual API endpoint

## 🔄 Environment Switching

### **Development → Extension**
1. Run `npm run build:extension`
2. Load extension in Chrome
3. Storage automatically switches to `chrome.storage`

### **Extension → Development**
1. Run `npm run dev`
2. Open dev server URL
3. Storage automatically switches to `localStorage`

No code changes needed - the environment detection handles everything automatically! 