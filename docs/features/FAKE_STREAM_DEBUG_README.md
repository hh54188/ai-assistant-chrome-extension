# Fake Stream Debug Tool

This document explains how to use the fake streaming method to debug streaming response issues without making actual API calls to Gemini.

## Overview

The fake streaming method (`streamGeminiFake`) simulates the behavior of the real Gemini streaming API, allowing you to:

- Debug streaming response handling without API costs
- Test different streaming scenarios
- Simulate network delays and chunk timing
- Test error conditions and edge cases
- Verify the frontend streaming implementation

## Usage

### 1. Direct Method Call

```javascript
import aiService from './services/aiService.js';

// Use the fake streaming method directly
const stream = await aiService.streamGeminiFake(
    "Your test message",
    [], // conversation history
    "gemini-1.5-flash", // model
    "test-session", // session ID
    [], // files
    false // use MCP tools
);

// Process the stream
for await (const chunk of stream) {
    console.log('Chunk:', chunk.text);
}
```

### 2. API Endpoint with Fake Stream

Send a POST request to `/api/chat/stream` with `useFakeStream: true`:

```javascript
const response = await fetch('http://localhost:3001/api/chat/stream', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        message: "Test message",
        model: "gemini-1.5-flash",
        useFakeStream: true
    })
});
```

### 3. Running Test Scripts

#### Test Direct Method
```bash
cd backend
node test-fake-stream.js
```

#### Test API Endpoint
```bash
cd backend
node test-fake-stream-api.js
```

## Features

### Realistic Streaming Simulation
- Splits response into 2-4 word chunks
- Adds random delays (50-150ms) between chunks
- Maintains the same data structure as real Gemini responses

### Debug Information
- Logs each chunk as it's processed
- Shows chunk index and total count
- Displays timing information
- Includes the original message in the response

### Tool Call Simulation
- Randomly simulates tool calls (30% chance when MCP tools enabled)
- Includes realistic tool call structure
- Helps test tool call handling in the frontend

### Error Simulation
- Can be extended to simulate various error conditions
- Network timeouts
- Malformed responses
- Rate limiting

## Configuration

The fake stream method accepts the same parameters as the real `streamGemini` method:

- `message`: The user's message
- `conversationHistory`: Previous conversation context
- `model`: AI model name (for logging purposes)
- `sessionId`: Session identifier
- `files`: File attachments (simulated)
- `useMCPTools`: Whether to simulate tool calls

## Response Format

Each chunk follows the same format as real Gemini responses:

```javascript
{
    text: "chunk content",
    chunkIndex: 0,
    totalChunks: 15,
    timestamp: "2024-01-15T10:30:00.000Z"
}
```

Tool call chunks include additional properties:

```javascript
{
    text: "",
    toolCall: {
        name: "fake_tool",
        parameters: { message: "This is a simulated tool call" }
    },
    timestamp: "2024-01-15T10:30:00.000Z"
}
```

## Debugging Common Issues

### 1. Chunk Processing
- Check if chunks are being received in the correct order
- Verify chunk content is being concatenated properly
- Look for missing or duplicate chunks

### 2. Timing Issues
- Test with different delay configurations
- Verify the frontend handles variable chunk timing
- Check for race conditions in chunk processing

### 3. Error Handling
- Test how the frontend handles malformed chunks
- Verify error recovery mechanisms
- Check timeout handling

### 4. Tool Calls
- Test tool call detection and processing
- Verify tool call parameters are handled correctly
- Check tool call timing in the stream

## Customization

You can modify the fake stream behavior by editing the `streamGeminiFake` method:

### Change Chunk Size
```javascript
// Create chunks of 1-2 words each (smaller chunks)
for (let i = 0; i < words.length; i += 2) {
    const chunkWords = words.slice(i, i + 2);
    chunks.push(chunkWords.join(' ') + ' ');
}
```

### Adjust Delays
```javascript
// Faster streaming (10-50ms delays)
const delay = Math.random() * 40 + 10;

// Slower streaming (200-500ms delays)
const delay = Math.random() * 300 + 200;
```

### Add Error Simulation
```javascript
// Simulate random errors
if (Math.random() < 0.1) { // 10% chance of error
    throw new Error('Simulated network error');
}
```

## Integration with Frontend

The fake stream works seamlessly with the existing frontend code. No changes are needed to the Chrome extension or React components - they will process the fake stream exactly like a real Gemini stream.

## Best Practices

1. **Use for Development**: Always use fake streams during development to avoid API costs
2. **Test Edge Cases**: Use fake streams to test error conditions and edge cases
3. **Performance Testing**: Adjust delays to test frontend performance with different streaming speeds
4. **Debug Logging**: Enable detailed logging to understand streaming behavior
5. **Clean Up**: Remove or disable fake stream calls before production deployment

## Troubleshooting

### Server Not Running
```
❌ Server is not running. Please start the server first:
   cd backend && npm start
```

### Module Import Issues
Make sure you're running the test scripts from the backend directory:
```bash
cd backend
node test-fake-stream.js
```

### Port Conflicts
If the default port (3001) is in use, update the `API_BASE_URL` in the test scripts.

## Related Files

- `backend/services/aiService.js` - Main fake stream implementation
- `backend/routes/chat.js` - API endpoint integration
- `backend/test-fake-stream.js` - Direct method test
- `backend/test-fake-stream-api.js` - API endpoint test
