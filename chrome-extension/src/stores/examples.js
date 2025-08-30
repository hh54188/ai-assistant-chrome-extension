/**
 * Usage Examples for Zustand Stores
 * 
 * These examples demonstrate how to migrate from React useState to Zustand stores
 * and show common usage patterns for the UI and Chat stores.
 */

import { useUIStore, useChatStore } from './index';

// ==================== Example 1: Basic Store Usage ====================

export const ExampleComponent = () => {
    // UI Store - for temporary state
    const {
        inputValue,
        setInputValue,
        loading,
        setLoading,
        isExpanded,
        toggleExpanded
    } = useUIStore();

    // Chat Store - for persistent state
    const {
        sessions,
        currentSessionId,
        createSession,
        getCurrentMessages,
        addMessage
    } = useChatStore();

    const handleSubmit = () => {
        if (!inputValue.trim()) return;

        // Add user message to current session
        addMessage(currentSessionId, { role: 'user', content: inputValue });
        
        // Clear input and set loading
        setInputValue('');
        setLoading(true);
        
        // Simulate AI response...
    };

    return (
        <div>
            <input 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
            />
            <button onClick={handleSubmit} disabled={loading || !inputValue.trim()}>
                {loading ? 'Sending...' : 'Send'}
            </button>
        </div>
    );
};

// ==================== Example 2: Selective Subscriptions for Performance ====================

export const OptimizedComponent = () => {
    // Only subscribe to specific state slices to prevent unnecessary re-renders
    const inputValue = useUIStore(state => state.inputValue);
    const loading = useUIStore(state => state.loading);
    const currentMessages = useChatStore(state => state.getCurrentMessages());
    const sessionCount = useChatStore(state => state.getTotalSessions());

    // This component will only re-render when these specific values change
    return (
        <div>
            <p>Sessions: {sessionCount}</p>
            <p>Messages: {currentMessages.length}</p>
            <p>Input: {inputValue}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
        </div>
    );
};

// ==================== Example 3: Session Management Pattern ====================

export const SessionManager = () => {
    const { sessions, currentSessionId, setCurrentSession, createSession } = useChatStore();
    const { resetUIState } = useUIStore();

    const handleSessionSwitch = (sessionId) => {
        // Reset UI state when switching sessions
        resetUIState();
        
        // Switch to new session
        setCurrentSession(sessionId);
    };

    const handleNewSession = () => {
        // Reset UI state
        resetUIState();
        
        // Create new session
        createSession();
    };

    return (
        <div>
            <button onClick={handleNewSession}>New Session</button>
            <ul>
                {sessions.map(session => (
                    <li 
                        key={session.id}
                        onClick={() => handleSessionSwitch(session.id)}
                        style={{ 
                            fontWeight: session.id === currentSessionId ? 'bold' : 'normal',
                            cursor: 'pointer' 
                        }}
                    >
                        {session.label} ({session.messages.length} messages)
                    </li>
                ))}
            </ul>
        </div>
    );
};

// ==================== Example 4: Message Streaming Pattern ====================

export const MessageStreamer = () => {
    const { currentSessionId, addMessage, appendToLastMessage, updateLastMessageStatus } = useChatStore();
    const { setLoading } = useUIStore();

    const simulateStreamingResponse = async (userMessage) => {
        // Add user message
        addMessage(currentSessionId, { role: 'user', content: userMessage });
        
        // Add empty assistant message
        addMessage(currentSessionId, { role: 'assistant', content: '' }, 'loading');
        
        setLoading(true);

        // Simulate streaming chunks
        const chunks = ['Hello', ' there!', ' How', ' can', ' I', ' help', ' you', ' today?'];
        
        for (const chunk of chunks) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
            appendToLastMessage(currentSessionId, chunk);
        }

        // Mark as complete
        updateLastMessageStatus(currentSessionId, 'done');
        setLoading(false);
    };

    return (
        <button onClick={() => simulateStreamingResponse('Hello!')}>
            Simulate Streaming Response
        </button>
    );
};

// ==================== Example 5: File Management Pattern ====================

export const FileManager = () => {
    const { currentSessionId, setSessionFiles, getSessionFiles } = useChatStore();
    const { setCurrentSessionFiles, currentSessionFiles } = useUIStore();

    const handleFileUpload = (files) => {
        // Update both stores
        setSessionFiles(currentSessionId, files);
        setCurrentSessionFiles(files);
    };

    const currentFiles = getSessionFiles(currentSessionId);

    return (
        <div>
            <input 
                type="file" 
                multiple 
                onChange={(e) => handleFileUpload(Array.from(e.target.files))}
            />
            <p>Files in session: {currentFiles.length}</p>
            <p>Files in UI: {currentSessionFiles.length}</p>
        </div>
    );
};

// ==================== Example 6: Migration from useState Pattern ====================

// BEFORE: Using React useState
const OldComponent = () => {
    // const [inputValue, setInputValue] = useState('');
    // const [loading, setLoading] = useState(false);
    // const [sessions, setSessions] = useState([]);
    // const [currentSession, setCurrentSession] = useState(null);

    // // Complex state management with useEffect, props drilling, etc.
};

// AFTER: Using Zustand stores
const NewComponent = () => {
    // UI state - temporary, resets on session change
    const { inputValue, setInputValue, loading, setLoading } = useUIStore();
    
    // Persistent state - survives browser refresh
    const { sessions, currentSessionId, setCurrentSession } = useChatStore();

    // Much cleaner, no props drilling, automatic persistence
};

// ==================== Example 7: Custom Hooks Pattern ====================

// Create custom hooks for common operations
export const useCurrentSession = () => {
    return useChatStore(state => state.getCurrentSession());
};

export const useSessionActions = () => {
    const createSession = useChatStore(state => state.createSession);
    const deleteSession = useChatStore(state => state.deleteSession);
    const setCurrentSession = useChatStore(state => state.setCurrentSession);
    const resetUIState = useUIStore(state => state.resetUIState);

    const switchSession = (sessionId) => {
        resetUIState();
        setCurrentSession(sessionId);
    };

    const newSession = (provider) => {
        resetUIState();
        createSession(provider);
    };

    return {
        createSession: newSession,
        deleteSession,
        switchSession
    };
};

// Usage of custom hooks
export const ComponentWithCustomHooks = () => {
    const currentSession = useCurrentSession();
    const { switchSession, newSession } = useSessionActions();

    return (
        <div>
            <h3>Current: {currentSession?.label}</h3>
            <button onClick={() => newSession('gpt-4')}>New GPT-4 Session</button>
        </div>
    );
};
