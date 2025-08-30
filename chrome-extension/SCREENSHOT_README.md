# Screenshot Capture Feature

This Chrome extension includes a powerful screenshot capture feature that allows users to select and capture specific areas of web pages.

## Features

- **Area Selection**: Users can drag to select any rectangular area on the page
- **Scroll Support**: Captures content even when scrolled, maintaining proper positioning
- **Chrome Extension Compatible**: Works seamlessly within Chrome extension context
- **Keyboard Shortcuts**: ESC key to cancel screenshot mode
- **Visual Feedback**: Clear visual indicators during selection process
- **Base64 Output**: Captured images are converted to base64 format for easy attachment

## Components

### 1. ScreenCapture.jsx
The main screenshot capture component that provides the overlay and selection functionality.

**Props:**
- `isActive`: Boolean to control when screenshot mode is active
- `onCapture`: Callback function when screenshot is completed
- `onCancel`: Callback function when screenshot is cancelled
- `children`: The content to be captured

### 2. ScreenCapture.css
Styles for the screenshot overlay, selection rectangle, and instructions.

### 3. MenuBar.jsx
Updated to include a screenshot button (camera icon) that triggers screenshot mode.

### 4. ChatSender.jsx
Updated to handle screenshot data and integrate with the existing attachment system.

## Usage

### Basic Implementation

```jsx
import ScreenCapture from './components/ScreenCapture';

const MyComponent = () => {
    const [isScreenshotMode, setIsScreenshotMode] = useState(false);
    
    const handleScreenshotCapture = (capturedData) => {
        // capturedData contains:
        // {
        //   type: 'inline',
        //   data: 'data:image/png;base64,...',
        //   mimeType: 'image/png',
        //   name: 'screenshot-1234567890.png'
        // }
        console.log('Screenshot captured:', capturedData);
        setIsScreenshotMode(false);
    };
    
    return (
        <ScreenCapture
            isActive={isScreenshotMode}
            onCapture={handleScreenshotCapture}
            onCancel={() => setIsScreenshotMode(false)}
        >
            {/* Your page content */}
        </ScreenCapture>
    );
};
```

### Integration with MenuBar

The MenuBar component now includes a screenshot button:

```jsx
<MenuBar
    // ... other props
    onScreenshotCapture={() => setIsScreenshotMode(true)}
/>
```

### Integration with ChatSender

The ChatSender component can receive screenshot data:

```jsx
<ChatSender
    // ... other props
    screenshotData={screenshotData}
    onFilesChange={(files) => {
        // Handle both file uploads and screenshots
        console.log('Files:', files);
    }}
/>
```

## Technical Details

### Dependencies
- `html2canvas`: For capturing the entire page content
- `react`: For component management
- `antd`: For UI components (Button, message, etc.)

### How It Works

1. **Activation**: User clicks screenshot button, setting `isActive` to true
2. **Overlay**: A full-screen overlay appears with crosshair cursor
3. **Selection**: User drags to create a selection rectangle
4. **Capture**: On mouse release, html2canvas captures the entire page
5. **Cropping**: Canvas API crops the captured image to the selected area
6. **Output**: Base64 data is returned via the `onCapture` callback

### Scroll Handling

The component automatically handles scroll position:
- Captures the full page including scrolled content
- Calculates correct coordinates considering scroll position
- Maintains proper positioning in the final cropped image

### Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

## Testing

### Test Component
Use `ScreenCaptureTest.jsx` to test the screenshot functionality independently:

```jsx
import ScreenCaptureTest from './components/ScreenCaptureTest';

// In your app
<ScreenCaptureTest />
```

### Test Page
Use `screenshot-test.html` to test the functionality on a simple HTML page.

## Chrome Extension Considerations

### Permissions
Ensure your `manifest.json` includes necessary permissions:

```json
{
  "permissions": [
    "activeTab",
    "scripting"
  ]
}
```

### Content Scripts
The screenshot functionality works in content scripts and can capture the current page.

### Security
- Only captures the current tab content
- No access to other tabs or system
- Respects user privacy and security settings

## Troubleshooting

### Common Issues

1. **Screenshot not working**: Check if html2canvas is properly installed
2. **Blurry images**: Ensure proper DPI scaling in Chrome
3. **Large file sizes**: Consider image compression for base64 output
4. **Performance issues**: Limit screenshot size for very large selections

### Debug Mode
Enable console logging to debug issues:

```jsx
const handleScreenshotCapture = (capturedData) => {
    console.log('Screenshot data:', capturedData);
    // ... rest of your code
};
```

## Future Enhancements

- **Multiple formats**: Support for JPEG, WebP
- **Quality settings**: Configurable image quality
- **Annotation tools**: Add text, arrows, shapes
- **Batch capture**: Capture multiple areas
- **Auto-save**: Save screenshots automatically
- **Cloud storage**: Upload to cloud services

## Contributing

When contributing to the screenshot functionality:

1. Test on multiple browsers
2. Ensure Chrome extension compatibility
3. Maintain performance for large pages
4. Follow existing code style
5. Add appropriate error handling
6. Update documentation
