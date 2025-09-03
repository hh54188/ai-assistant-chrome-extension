# Chat Session Management

This implementation provides efficient chat session management for Gemini conversations by reusing chat sessions instead of creating new ones for each message.

## Key Features

- **Chat Session Reuse**: Chat sessions are created once and reused for the entire conversation
- **Automatic History Management**: The Gemini SDK automatically maintains conversation history
- **Multiple Conversations**: Support for multiple concurrent conversations using session IDs
- **Memory Efficient**: No need to manually pass conversation history for each request

## How It Works

### Before (Inefficient)
```javascript
// Every message required creating a new chat session
const chat1 = genAI.chats.create({ model: 'gemini-2.0-flash', history: conversationHistory });
const response1 = await chat1.sendMessageStream({ message: 'Hello' });

const chat2 = genAI.chats.create({ model: 'gemini-2.0-flash', history: updatedHistory });
const response2 = await chat2.sendMessageStream({ message: 'How are you?' });
```

### After (Efficient)
```javascript
// Chat session is created once and reused
const response1 = await aiService.streamGemini('Hello', [], 'gemini-2.0-flash', 'session-1');
const response2 = await aiService.streamGemini('How are you?', [], 'gemini-2.0-flash', 'session-1');
```

## API Usage

### Streaming Chat
```javascript
POST /api/chat/stream
{
  "message": "Hello!",
  "model": "gemini-2.0-flash-lite",
  "conversationHistory": [], // Optional - only needed for initial setup
  "sessionId": "user-123" // Optional - defaults to 'default'
}
```

### Clear Conversation
```javascript
DELETE /api/chat/conversation/:sessionId
```

### Get Conversation History
```javascript
GET /api/chat/conversation/:sessionId/history
```

## Frontend Integration

### Example Usage
```javascript
// Initialize conversation
const sessionId = `user-${userId}-${Date.now()}`;

// Send first message
const response1 = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello!',
    model: 'gemini-2.0-flash-lite',
    sessionId: sessionId
  })
});

// Send follow-up message (no need to pass history)
const response2 = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What did I just say?',
    model: 'gemini-2.0-flash-lite',
    sessionId: sessionId // Same session ID
  })
});

// Clear conversation when done
await fetch(`/api/chat/conversation/${sessionId}`, {
  method: 'DELETE'
});
```

## Benefits

1. **Performance**: No need to recreate chat sessions for each message
2. **Memory Efficiency**: Reduced memory usage by reusing sessions
3. **Simplified Code**: No need to manually manage conversation history
4. **Better Context**: Gemini maintains full conversation context automatically
5. **Scalability**: Support for multiple concurrent conversations

## Testing

Run the test file to verify the implementation:

```bash
node test-chat-sessions.js
```

## Notes

- Chat sessions are stored in memory and will be lost if the server restarts
- For production, consider implementing persistent storage for conversation history
- The `conversationHistory` parameter is only needed for initial setup or when you want to override the current history
- Each session ID maintains its own separate chat session 