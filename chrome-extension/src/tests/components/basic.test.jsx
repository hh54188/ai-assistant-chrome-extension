import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithMocks } from '../utils/componentTestUtils.jsx';
import CopilotSidebar from '../../CopilotSidebar.jsx';

// Mock the stores module at the top level
vi.mock('../../stores', () => {
  const mockUIStore = {
    clearInput: vi.fn(),
    loading: false,
    setLoading: vi.fn(),
    referenceModalVisible: false,
    setReferenceModalVisible: vi.fn(),
    modelSelectionModalVisible: false,
    setModelSelectionModalVisible: vi.fn(),
    settingsModalVisible: false,
    setSettingsModalVisible: vi.fn(),
    forceConfigModalVisible: false,
    setForceConfigModalVisible: vi.fn(),
    currentSelection: null,
    setCurrentSelection: vi.fn(),
    selectedModels: [],
    addSelectedModel: vi.fn(),
    removeSelectedModel: vi.fn(),
    clearSelectedModels: vi.fn(),
    isExpanded: false,
    setIsExpanded: vi.fn(),
    turboMode: false,
    setTurboMode: vi.fn(),
    setIsScreenshotMode: vi.fn(),
    setScreenshotData: vi.fn(),
    clearScreenshotData: vi.fn(),
    resetUIState: vi.fn()
  };

  const mockChatStore = {
    currentSessionId: 'test-session-1',
    selectedProvider: 'gemini-2.5-flash',
    setCurrentSession: vi.fn(),
    createSession: vi.fn(),
    deleteSession: vi.fn(),
    updateSessionLabel: vi.fn(),
    addMessage: vi.fn(),
    updateLastMessage: vi.fn(),
    appendToLastMessage: vi.fn(),
    updateLastMessageStatus: vi.fn(),
    setSessionLoading: vi.fn(),
    getSessionLoading: vi.fn(() => false),
    getSessionFiles: vi.fn(() => []),
    clearSessionFiles: vi.fn(),
    setSessionAbortController: vi.fn(),
    getSessionAbortController: vi.fn(() => null),
    getCurrentSession: vi.fn(() => ({
      id: 'test-session-1',
      label: 'Test session',
      provider: 'gemini-2.5-flash',
      messages: [],
      loading: false,
      files: []
    })),
    getCurrentMessages: vi.fn(() => []),
    getSessionList: vi.fn(() => [{
      key: 'test-session-1',
      label: 'Test session',
      provider: 'gemini-2.5-flash',
      messages: [],
      loading: false,
      files: []
    }])
  };

  return {
    useUIStore: () => mockUIStore,
    useChatStore: () => mockChatStore,
    // Expose mocks for testing
    __mockUIStore: mockUIStore,
    __mockChatStore: mockChatStore
  };
});

// Mock chatService to simulate streaming responses
vi.mock('../../services/chatService', () => ({
  default: {
    streamChat: vi.fn(),
    chat: vi.fn(),
    getModels: vi.fn(),
    testConnections: vi.fn(),
    healthCheck: vi.fn()
  },
}));

// Mock all components to avoid complex dependencies
vi.mock('../../components/ChatHeader', () => ({
  default: ({ selectedProvider, handleNewSession }) => (
    <div data-testid="chat-header">
      <span data-testid="provider-display">Provider: {selectedProvider}</span>
      <button data-testid="new-session" onClick={handleNewSession}>New</button>
    </div>
  )
}));

vi.mock('../../components/MenuBar', () => ({
  default: ({ 
    sessionList = [], 
    curSession, 
    handleSessionChange, 
    handleImportSelection,
    isExpanded,
    onToggleExpand,
    onScreenshotCapture,
    connectionStatus = false
  }) => (
    <div data-testid="menu-bar">
      <div data-testid="menu-bar-top">
        <div data-testid="session-conversations">
          {sessionList.map((session) => (
            <div
              key={session.key}
              data-testid={`session-${session.key}`}
              onClick={() => handleSessionChange?.(session.key)}
              style={{ fontWeight: session.key === curSession ? 'bold' : 'normal' }}
            >
              {session.label}
            </div>
          ))}
        </div>
        <button
          data-testid="reference-button"
          onClick={handleImportSelection}
        >
          Reference
        </button>
        <button
          data-testid="screenshot-button"
          onClick={onScreenshotCapture}
          disabled={!connectionStatus}
        >
          Screenshot
        </button>
      </div>
      <div data-testid="menu-bar-bottom">
        <button
          data-testid="expand-button"
          onClick={onToggleExpand}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
        <button
          data-testid="settings-button"
        >
          Settings
        </button>
      </div>
    </div>
  )
}));

vi.mock('../../components/ChatList', () => ({
  default: ({ messages = [] }) => (
    <div data-testid="chat-list">
      {messages.length === 0 ? (
        <div data-testid="welcome-message">Welcome! Start a conversation.</div>
      ) : (
        messages.map((msg, index) => (
          <div 
            key={index} 
            data-testid={`message-${index}`}
            data-role={msg.message.role}
            data-status={msg.status}
          >
            <strong>{msg.message.role}:</strong> {msg.message.content}
            {msg.status === 'loading' && <span data-testid={`loading-${index}`}> (loading...)</span>}
          </div>
        ))
      )}
    </div>
  )
}));

vi.mock('../../components/ChatSender', () => ({
  default: ({ 
    styles, 
    handleUserSubmit, 
    allowAttachments = false, 
    disabled = false 
  }) => (
    <div className={styles?.chatSend} data-testid="chat-sender">
      <input
        data-testid="message-input"
        placeholder={disabled ? "Select a model to continue..." : "Ask or input / use skills"}
        onChange={(e) => {
          e.target.testValue = e.target.value;
        }}
        disabled={disabled}
      />
      <button
        data-testid="send-button"
        onClick={(e) => {
          const input = e.target.parentElement.querySelector('[data-testid="message-input"]');
          const value = input.testValue || input.value;
          if (value && value.trim() && !disabled) {
            handleUserSubmit(value);
            input.value = '';
            input.testValue = '';
          }
        }}
        disabled={disabled}
      >
        Send
      </button>
      {allowAttachments && (
        <div data-testid="attachments-available">
          <button data-testid="attachment-button">📎</button>
          <div data-testid="attachments-enabled">Attachments enabled</div>
        </div>
      )}
    </div>
  )
}));

// Mock other components as simple divs
vi.mock('../../components/ReferenceModal', () => ({
  default: ({ visible }) => visible ? <div data-testid="reference-modal">Reference Modal</div> : null
}));

vi.mock('../../components/ModelSelectionModal', () => ({
  default: ({ visible }) => visible ? <div data-testid="model-selection-modal">Model Selection</div> : null
}));

vi.mock('../../components/SettingsModal', () => ({
  default: ({ visible }) => visible ? <div data-testid="settings-modal">Settings Modal</div> : null
}));

vi.mock('../../components/ForceConfigModal', () => ({
  default: ({ visible }) => visible ? <div data-testid="force-config-modal">Force Config Modal</div> : null
}));

// Mock hooks
vi.mock('../../hooks/useConnectionStatus', () => ({
  default: () => ({
    connectionStatus: true,
    isLoading: false,
    retryConnection: vi.fn()
  })
}));

vi.mock('../../hooks/usePageSelection', () => ({
  default: () => ({
    getCurrentSelection: vi.fn(() => Promise.resolve({ text: 'Selected text' }))
  })
}));

// Mock styles
vi.mock('../../CopilotSidebar.styles', () => ({
  useCopilotStyle: () => ({
    styles: {
      copilotChat: 'copilotChat',
      sidebarLayout: 'sidebarLayout',
      mainContent: 'mainContent'
    }
  })
}));

// Mock antd message
vi.mock('antd', () => ({
  message: {
    useMessage: () => [
      {
        open: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        success: vi.fn()
      },
      <div data-testid="message-context" key="context" />
    ]
  }
}));

describe('CopilotSidebar Integration Tests - Core Functionality', () => {
  let mockChatService;
  let mockProps;
  let mockUIStore;
  let mockChatStore;

  beforeEach(async () => {
    mockProps = {
      isOpen: true,
      onClose: vi.fn()
    };

    // Get the mocked chat service
    const chatServiceModule = await import('../../services/chatService.js');
    mockChatService = chatServiceModule.default;

    // Get the mocked stores
    const storesModule = await import('../../stores/index.js');
    mockUIStore = storesModule.__mockUIStore;
    mockChatStore = storesModule.__mockChatStore;

    // Reset all mocks
    vi.clearAllMocks();
    mockChatService.streamChat.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Component Integration', () => {
    it('should render all main components when sidebar is open', () => {
      renderWithMocks(<CopilotSidebar {...mockProps} />);

      expect(screen.getByTestId('chat-header')).toBeInTheDocument();
      expect(screen.getByTestId('menu-bar')).toBeInTheDocument();
      expect(screen.getByTestId('chat-list')).toBeInTheDocument();
      expect(screen.getByTestId('chat-sender')).toBeInTheDocument();
      // message-context removed - now using custom notification system
    });

    it('should show welcome message when no messages exist', () => {
      renderWithMocks(<CopilotSidebar {...mockProps} />);
      expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
    });

    it('should hide content when sidebar is closed', () => {
      const { container } = renderWithMocks(<CopilotSidebar {...mockProps} isOpen={false} />);
      const sidebar = container.querySelector('[style*="width: 0"]');
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('User Input Flow - Core User Journey', () => {
    it('should handle the complete user message submission and streaming response flow', async () => {
      // Mock streaming response
      mockChatService.streamChat.mockImplementation(async (message, provider, history, sessionId, callbacks) => {
        const { onChunk, onComplete, onLoadingChange } = callbacks;
        
        // Simulate streaming chunks
        setTimeout(() => onChunk?.('Hello! '), 10);
        setTimeout(() => onChunk?.('How can I help you?'), 20);
        setTimeout(() => {
          onComplete?.();
          onLoadingChange?.(false);
        }, 30);
        
        return Promise.resolve();
      });

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Step 1: User types a message
      const messageInput = screen.getByTestId('message-input');
      fireEvent.change(messageInput, { target: { value: 'Hello, how are you?' } });

      // Step 2: User submits the message
      const sendButton = screen.getByTestId('send-button');
      fireEvent.click(sendButton);

      // Step 3: Verify chat service was called with correct parameters
      expect(mockChatService.streamChat).toHaveBeenCalledWith(
        'Hello, how are you?',
        'gemini-2.5-flash', // default provider
        [], // empty history for new session
        expect.any(String), // sessionId
        expect.objectContaining({
          onChunk: expect.any(Function),
          onComplete: expect.any(Function),
          onError: expect.any(Function),
          onLoadingChange: expect.any(Function),
          abortController: expect.any(Object),
          files: []
        })
      );

      // Step 4: Verify user message was added to store
      expect(mockChatStore.addMessage).toHaveBeenCalledWith(
        expect.any(String),
        { content: 'Hello, how are you?', role: 'user' },
        'done'
      );

      // Step 5: Verify assistant message placeholder was added
      expect(mockChatStore.addMessage).toHaveBeenCalledWith(
        expect.any(String),
        { content: '', role: 'assistant' },
        'loading'
      );

      // Step 6: Verify loading states were set
      expect(mockUIStore.setLoading).toHaveBeenCalledWith(true);

      // Step 7: Wait for streaming to complete and verify chunks were appended
      await waitFor(() => {
        expect(mockChatStore.appendToLastMessage).toHaveBeenCalledWith(
          expect.any(String),
          'Hello! '
        );
      }, { timeout: 100 });

      expect(mockChatStore.appendToLastMessage).toHaveBeenCalledWith(
        expect.any(String),
        'How can I help you?'
      );

      // Step 8: Verify completion was handled
      await waitFor(() => {
        expect(mockChatStore.updateLastMessageStatus).toHaveBeenCalledWith(
          expect.any(String),
          'done'
        );
      }, { timeout: 100 });
    });

    it('should display conversation messages correctly', () => {
      const messages = [
        {
          message: { role: 'user', content: 'Hello!' },
          status: 'done'
        },
        {
          message: { role: 'assistant', content: 'Hi there! How can I help?' },
          status: 'done'
        }
      ];

      // Update the mock to return messages
      mockChatStore.getCurrentMessages.mockReturnValue(messages);

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Verify messages are displayed
      expect(screen.getByTestId('message-0')).toHaveTextContent('user: Hello!');
      expect(screen.getByTestId('message-1')).toHaveTextContent('assistant: Hi there! How can I help?');
    });

    it('should show loading state during streaming', () => {
      const messages = [
        {
          message: { role: 'user', content: 'Tell me a story' },
          status: 'done'
        },
        {
          message: { role: 'assistant', content: 'Once upon a time...' },
          status: 'loading'
        }
      ];

      // Update the mock to return loading messages
      mockChatStore.getCurrentMessages.mockReturnValue(messages);

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Verify loading indicator is shown
      expect(screen.getByTestId('loading-1')).toBeInTheDocument();
    });
  });

  describe('Provider Integration', () => {
    it('should display current provider in header', () => {
      renderWithMocks(<CopilotSidebar {...mockProps} />);

      expect(screen.getByTestId('provider-display')).toHaveTextContent('Provider: gemini-2.5-flash');
    });

    it('should enable attachments when not in frontend-only mode and connected', () => {
      // The default mock setup has isFrontendOnlyMode returning false and useConnectionStatus returning true
      // So attachments should be enabled by default
      renderWithMocks(<CopilotSidebar {...mockProps} />);

      expect(screen.getByTestId('attachments-available')).toBeInTheDocument();
    });

  });

  describe('Error Handling', () => {
    it('should handle chat service errors gracefully', async () => {
      const errorMessage = 'Failed to connect to AI service';

      mockChatService.streamChat.mockImplementation(async (message, provider, history, sessionId, callbacks) => {
        const { onError, onLoadingChange } = callbacks;
        setTimeout(() => {
          onError?.(errorMessage);
          onLoadingChange?.(false);
        }, 10);
      });

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Submit a message
      const messageInput = screen.getByTestId('message-input');
      fireEvent.change(messageInput, { target: { value: 'Hello' } });
      fireEvent.click(screen.getByTestId('send-button'));

      // Wait for error handling
      await waitFor(() => {
        expect(mockChatStore.updateLastMessage).toHaveBeenCalledWith(
          expect.any(String),
          errorMessage
        );
      }, { timeout: 100 });

      expect(mockChatStore.updateLastMessageStatus).toHaveBeenCalledWith(
        expect.any(String),
        'done'
      );
      expect(mockUIStore.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('Session Management', () => {
    it('should create new session when button is clicked', () => {
      renderWithMocks(<CopilotSidebar {...mockProps} />);

      const newSessionButton = screen.getByTestId('new-session');
      fireEvent.click(newSessionButton);

      expect(mockChatStore.createSession).toHaveBeenCalled();
      expect(mockUIStore.resetUIState).toHaveBeenCalled();
    });

    it('should update session title for new sessions', async () => {
      mockChatService.streamChat.mockResolvedValue();

      // Update the mock to return a session with "New session" label
      mockChatStore.getCurrentSession.mockReturnValue({
        id: 'test-session-1',
        label: 'New session', // This should trigger title update
        provider: 'gemini-2.5-flash',
        messages: [],
        loading: false,
        files: []
      });

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      const messageInput = screen.getByTestId('message-input');
      fireEvent.change(messageInput, { target: { value: 'This is a long message that should be truncated' } });

      const sendButton = screen.getByTestId('send-button');
      fireEvent.click(sendButton);

      expect(mockChatStore.updateSessionLabel).toHaveBeenCalledWith(
        'test-session-1',
        'This is a long messa' // First 20 characters
      );
    });
  });
});
