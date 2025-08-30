# Zustand State Management Architecture

## Overview

This project uses **Zustand** with **Immer** for state management, following industry best practices for scalable and maintainable React applications. The state is organized into two separate stores based on data lifecycle and usage patterns.

## Architecture Decision: Two-Store Pattern

### Why Two Stores?

We've implemented a **two-store architecture** separating UI state from persistent state:

1. **`uiStore.js`** - Temporary UI state
2. **`chatStore.js`** - Persistent chat data

### Industry Best Practices Followed

#### 1. **Separation of Concerns (SoC)**
- **UI State**: Temporary, session-specific, frequently changing
- **Persistent State**: Long-lived, cross-session, business logic

#### 2. **Performance Optimization**
- UI state changes don't trigger re-renders for persistent data components
- Persistent data changes don't affect UI-only components
- Selective subscriptions reduce unnecessary renders

#### 3. **Data Lifecycle Management**
- UI state resets when switching sessions
- Persistent state survives browser refreshes and session switches
- Clear boundaries between temporary and permanent data

#### 4. **Testability & Maintainability**
- Each store can be tested independently
- Clear, focused responsibilities
- Easier to mock specific store behaviors

#### 5. **Scalability**
- Easy to add new features without affecting unrelated state
- Clear patterns for future developers to follow
- Modular architecture supports team development

## Store Structure

### UI Store (`uiStore.js`)

**Purpose**: Manages temporary UI state that resets when switching sessions.

**Contains**:
- User input state (`inputValue`)
- Loading states (`loading`)
- Modal visibility (`referenceModalVisible`, `modelSelectionModalVisible`)
- UI layout preferences (`isExpanded`, `turboMode`)
- Screenshot and file upload state
- Current session's temporary data

**Key Features**:
- Immer integration for immutable updates
- Reset functionality for session switching
- Computed selectors for derived state
- Optimized for frequent updates

### Chat Store (`chatStore.js`)

**Purpose**: Manages persistent chat data across sessions and browser refreshes.

**Contains**:
- All chat sessions with co-located per-session state
- Current session tracking
- AI provider settings
- Session metadata (creation time, labels, etc.)

**Session Structure**:
```javascript
{
  id: 'session-id',
  label: 'Session Name',
  provider: 'gemini-2.5-flash',
  messages: [...],
  // Co-located per-session state
  loading: false,
  files: [],
  abortController: null
}
```

**Key Features**:
- Zustand persist middleware for localStorage
- Immer integration for complex nested updates
- Session CRUD operations
- Message streaming support
- AbortController management (runtime only)

## Usage Patterns

### Basic Store Usage

```javascript
import { useUIStore } from './stores';
import { useChatStore } from './stores';

// In components
const Component = () => {
    // UI state
    const { inputValue, setInputValue, loading } = useUIStore();
    
    // Chat state
    const { sessions, currentSessionId, createSession } = useChatStore();
    
    // Selective subscriptions for performance
    const isExpanded = useUIStore(state => state.isExpanded);
    const currentMessages = useChatStore(state => state.getCurrentMessages());
};
```

### Session Management Pattern

```javascript
// Switching sessions
const handleSessionChange = (sessionId) => {
    // Reset UI state for new session
    useUIStore.getState().resetUIState();
    
    // Switch to new session
    useChatStore.getState().setCurrentSession(sessionId);
};
```

### Message Streaming Pattern

```javascript
// Streaming updates
const streamMessage = (sessionId, content) => {
    // Update persistent store
    useChatStore.getState().appendToLastMessage(sessionId, content);
    
    // UI loading handled separately
    useUIStore.getState().setLoading(false);
};
```

## Design Principles

### 1. **Single Responsibility**
Each store has one clear purpose and doesn't mix concerns.

### 2. **Immutability**
Using Immer ensures all state updates are immutable, preventing bugs and enabling time-travel debugging.

### 3. **Selective Subscriptions**
Components can subscribe to specific parts of state, optimizing performance.

### 4. **Persistence Strategy**
Only business-critical data is persisted, not temporary UI state.

### 5. **Type Safety** (Future Enhancement)
Structure supports easy TypeScript integration for better developer experience.

## Performance Considerations

### Store Splitting Benefits
- **Reduced Re-renders**: UI changes don't affect chat data consumers
- **Memory Efficiency**: UI state can be garbage collected on session switch
- **Network Efficiency**: Only persistent data is stored/synced

### Optimization Techniques
- **Immer**: Efficient immutable updates
- **Selective Subscriptions**: `const value = useStore(state => state.specificValue)`
- **Computed Selectors**: Pre-calculated derived values
- **Persistence Partitioning**: Only necessary data is persisted

## Migration Strategy

When refactoring existing components:

1. **Identify State Type**: UI-temporary vs. Business-persistent
2. **Replace useState**: Use appropriate store hooks
3. **Update Dependencies**: Import from store instead of props
4. **Test Thoroughly**: Ensure state changes work correctly
5. **Performance Check**: Verify no unnecessary re-renders

## Future Enhancements

### Potential Improvements
- **TypeScript Integration**: Add type definitions
- **Middleware Extensions**: Add logging, analytics
- **State Persistence**: Consider server-side sync
- **Testing Utilities**: Custom test helpers
- **DevTools Integration**: Enhanced debugging experience

## Best Practices Summary

1. ✅ **Use Two Stores**: Separate UI from persistent state
2. ✅ **Immer Integration**: For complex nested updates
3. ✅ **Selective Subscriptions**: Optimize performance
4. ✅ **Clear Naming**: Actions and state names are descriptive
5. ✅ **Reset Patterns**: UI state resets appropriately
6. ✅ **Persistence Strategy**: Only persist necessary data
7. ✅ **Error Boundaries**: Handle store errors gracefully
8. ✅ **Testing Strategy**: Test stores independently

This architecture provides a solid foundation for scalable React applications while following modern state management best practices.
