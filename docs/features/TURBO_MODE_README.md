# Turbo Mode Feature

## Overview
Turbo Mode is a powerful feature that allows users to send messages to multiple AI models simultaneously, enabling comparison of responses from different AI providers before choosing which one to continue the conversation with.

## How It Works

### 1. Activation
- Click the thunderbolt icon (⚡) in the header to open the Model Selection Modal
- Select 2 or more AI models from the available options
- Turbo mode automatically activates when multiple models are selected
- The header shows a "🚀 Turbo Mode" badge when active

### 2. Usage
- When turbo mode is active, type your message and send it
- The application automatically expands to show multiple chat lists side by side
- Each chat list represents a different AI model
- All models generate responses simultaneously
- A progress indicator shows the generation status

### 3. Model Selection
- After all models have responded, you can review each response
- Click "Continue with this model" on any response to:
  - Save the current turbo conversation as a session
  - Create a new session with the selected model
  - Exit turbo mode and continue with the chosen AI model

## Technical Implementation

### Components
- **TurboChatList**: Main component that displays multiple chat lists in a row
- **ChatHeader**: Shows turbo mode status and controls
- **ModelSelectionModal**: Handles model selection for turbo mode

### State Management
- **uiStore**: Manages turbo mode state and expansion
- **chatStore**: Handles session creation and message storage
- **turboModeExpanded**: Separate state to avoid conflicts with user expansion

### Key Features
- **Responsive Layout**: Automatically expands to 1200px width when in turbo mode
- **Loading States**: Shows individual loading indicators for each model
- **Session Management**: Automatically saves turbo conversations as sessions
- **UI Disabling**: Prevents new messages while in turbo mode expanded state

## User Experience

### Visual Design
- Clean card-based layout for each AI model
- Consistent spacing and typography
- Loading animations and progress indicators
- Responsive design that works in Chrome extension context

### Accessibility
- Clear instructions and status messages
- Visual feedback for all interactions
- Keyboard navigation support
- Screen reader friendly labels

## Future Enhancements

### Planned Features
- Real-time streaming from multiple AI providers
- Response comparison tools
- Model performance metrics
- Custom model configurations

### Technical Improvements
- WebSocket connections for real-time updates
- Response caching and optimization
- Better error handling for failed requests
- Performance monitoring and analytics

## Browser Compatibility

### Chrome Extension
- Fully compatible with Chrome extension manifest v3
- Responsive design for various sidebar sizes
- Optimized for iframe rendering

### Web Application
- Responsive design for desktop and mobile
- Progressive Web App (PWA) support
- Cross-browser compatibility

## Usage Examples

### Basic Workflow
1. Open Model Selection Modal
2. Select "gemini-2.5-flash" and "gemini-2.5-pro"
3. Send message: "Explain quantum computing"
4. Review responses from both models
5. Click "Continue with this model" on preferred response

### Advanced Usage
- Combine different AI providers for diverse perspectives
- Use for content comparison and validation
- Leverage for creative brainstorming with multiple AI personalities

## Troubleshooting

### Common Issues
- **Turbo mode not activating**: Ensure at least 2 models are selected
- **Responses not loading**: Check connection status and try refreshing
- **UI not expanding**: Verify turbo mode is properly enabled

### Performance Notes
- Turbo mode may use more resources due to multiple AI requests
- Consider network bandwidth when using multiple models
- Large responses may affect rendering performance

## Contributing

### Development
- Follow existing code patterns and conventions
- Add tests for new turbo mode functionality
- Update documentation for any changes
- Ensure Chrome extension compatibility

### Testing
- Test with different model combinations
- Verify responsive behavior on various screen sizes
- Check Chrome extension integration
- Validate session management functionality
