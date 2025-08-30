# AI Copilot Chrome Extension

A Chrome extension that provides an AI copilot sidebar for web browsing.

## Features

- AI-powered chat interface
- Keyboard shortcut (Ctrl+Shift+A or Cmd+Shift+A) to toggle sidebar
- Click extension icon to toggle sidebar
- Seamless integration with any webpage

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Building the Extension

```bash
npm run build:extension
```

This will:
1. Build the React application
2. Copy necessary extension files to the `dist` folder
3. Create the final extension package

### Development Mode

```bash
npm run dev
```

## Testing the Extension

### Loading the Extension in Chrome

1. **Build the extension** (if not already built):
   ```bash
   npm run build:extension
   ```

2. **Open Chrome** and navigate to `chrome://extensions/`

3. **Enable Developer Mode** by toggling the switch in the top-right corner

4. **Click "Load unpacked"** and select the `dist` folder from your project

5. **The extension should now appear** in your extensions list

### Using the Extension

1. **Click the extension icon** in the Chrome toolbar to toggle the sidebar
2. **Use keyboard shortcut** Ctrl+Shift+A (Windows/Linux) or Cmd+Shift+A (Mac) to toggle the sidebar
3. **The sidebar will appear** on the right side of any webpage

### Reloading the Extension

When you make changes to the code:

1. **Rebuild the extension**:
   ```bash
   npm run build:extension
   ```

2. **Go to `chrome://extensions/`**

3. **Click the refresh icon** on your extension card

4. **Refresh any open web pages** where you want to test the changes

### Troubleshooting

- **Extension not loading**: Make sure all files are in the `dist` folder and the manifest.json is valid
- **Sidebar not appearing**: Check the browser console for any JavaScript errors
- **Build errors**: Ensure all dependencies are installed with `npm install`

## File Structure

```
chrome-extension/
├── src/
│   ├── App.jsx              # Main app entry point
│   ├── CopilotDemo.jsx      # Demo component
│   ├── CopilotSidebar.jsx   # Main sidebar component
│   ├── sidebar.jsx          # Sidebar entry point
│   └── ...
├── public/
│   ├── manifest.json        # Extension manifest
│   ├── background.js        # Background service worker
│   ├── content.js           # Content script
│   ├── sidebar.html         # Sidebar HTML
│   └── icons/               # Extension icons
├── dist/                    # Built extension (generated)
└── ...
```

## Icons

Replace the placeholder icon files in `public/` with actual PNG icons:
- `icon16.png` (16x16)
- `icon48.png` (48x48)  
- `icon128.png` (128x128)
