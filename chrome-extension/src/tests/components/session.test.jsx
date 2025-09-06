import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
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

// Mock chatService
vi.mock('../../services/chatService', () => ({
  default: {
    streamChat: vi.fn(),
    chat: vi.fn(),
    getModels: vi.fn(),
    testConnections: vi.fn(),
    healthCheck: vi.fn()
  },
  isFrontendOnlyMode: vi.fn(() => false),
  getGeminiApiKey: vi.fn(() => ''),
  hasValidApiKey: vi.fn(() => false)
}));

// Mock all components to avoid complex dependencies
vi.mock('../../components/ChatHeader', () => ({
  default: ({ selectedProvider, handleNewSession, setSelectedProvider }) => (
    <div data-testid="chat-header">
      <span data-testid="provider-display">Provider: {selectedProvider}</span>
      <button data-testid="new-session" onClick={handleNewSession}>New</button>
      <select 
        data-testid="provider-select" 
        value={selectedProvider}
        onChange={(e) => setSelectedProvider?.(e.target.value)}
      >
        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
        <option value="gpt-4o-mini">GPT-4o Mini</option>
        <option value="claude-3-sonnet">Claude 3 Sonnet</option>
      </select>
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
    isDirectApiMode = false,
    connectionStatus = false
  }) => (
    <div data-testid="menu-bar">
      <div data-testid="menu-bar-top">
        <div data-testid="session-conversations">
          {sessionList.map((session) => (
            <div
              key={session.key}
              data-testid={`session-item-${session.key}`}
              onClick={() => handleSessionChange?.(session.key)}
              style={{ 
                fontWeight: session.key === curSession ? 'bold' : 'normal',
                cursor: 'pointer',
                padding: '8px',
                backgroundColor: session.key === curSession ? '#f0f0f0' : 'transparent'
              }}
            >
              {session.label} ({session.provider})
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
          disabled={isDirectApiMode || !connectionStatus}
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
          data-direct-api-mode={isDirectApiMode}
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

describe('CopilotSidebar Integration Tests - Session Management', () => {
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

  describe('New Session Creation', () => {
    it('should create a new session when new session button is clicked', () => {
      renderWithMocks(<CopilotSidebar {...mockProps} />);

      const newSessionButton = screen.getByTestId('new-session');
      fireEvent.click(newSessionButton);

      expect(mockChatStore.createSession).toHaveBeenCalledWith(undefined);
      expect(mockUIStore.resetUIState).toHaveBeenCalled();
    });

    it('should delete empty session before creating new one', () => {
      // Mock current session with no messages
      mockChatStore.getCurrentMessages.mockReturnValue([]);

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      const newSessionButton = screen.getByTestId('new-session');
      fireEvent.click(newSessionButton);

      expect(mockChatStore.deleteSession).toHaveBeenCalledWith('test-session-1');
      expect(mockChatStore.createSession).toHaveBeenCalledWith(undefined);
      expect(mockUIStore.resetUIState).toHaveBeenCalled();
    });

    it('should not delete session with existing messages when creating new session', () => {
      // Mock current session with messages
      mockChatStore.getCurrentMessages.mockReturnValue([
        { message: { role: 'user', content: 'Hello' }, status: 'done' }
      ]);

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      const newSessionButton = screen.getByTestId('new-session');
      fireEvent.click(newSessionButton);

      expect(mockChatStore.deleteSession).not.toHaveBeenCalled();
      expect(mockChatStore.createSession).toHaveBeenCalledWith(undefined);
      expect(mockUIStore.resetUIState).toHaveBeenCalled();
    });
  });

  describe('Provider Change Creates New Session', () => {
    it('should create a new session when provider is changed', () => {
      renderWithMocks(<CopilotSidebar {...mockProps} />);

      const providerSelect = screen.getByTestId('provider-select');
      fireEvent.change(providerSelect, { target: { value: 'gpt-4o-mini' } });

      expect(mockChatStore.createSession).toHaveBeenCalledWith('gpt-4o-mini');
      expect(mockUIStore.resetUIState).toHaveBeenCalled();
    });

    it('should delete empty session before creating new one with different provider', () => {
      // Mock current session with no messages
      mockChatStore.getCurrentMessages.mockReturnValue([]);

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      const providerSelect = screen.getByTestId('provider-select');
      fireEvent.change(providerSelect, { target: { value: 'claude-3-sonnet' } });

      expect(mockChatStore.deleteSession).toHaveBeenCalledWith('test-session-1');
      expect(mockChatStore.createSession).toHaveBeenCalledWith('claude-3-sonnet');
      expect(mockUIStore.resetUIState).toHaveBeenCalled();
    });

    it('should preserve existing session with messages when changing provider', () => {
      // Mock current session with messages
      mockChatStore.getCurrentMessages.mockReturnValue([
        { message: { role: 'user', content: 'Hello' }, status: 'done' }
      ]);

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      const providerSelect = screen.getByTestId('provider-select');
      fireEvent.change(providerSelect, { target: { value: 'gpt-4o-mini' } });

      expect(mockChatStore.deleteSession).not.toHaveBeenCalled();
      expect(mockChatStore.createSession).toHaveBeenCalledWith('gpt-4o-mini');
      expect(mockUIStore.resetUIState).toHaveBeenCalled();
    });
  });

  describe('Session Independence', () => {
    it('should not impact existing session providers when creating new session', () => {
      const sessionList = [
        {
          key: 'existing-session-1',
          label: 'Existing Gemini Session',
          provider: 'gemini-2.5-flash',
          messages: [{ message: { role: 'user', content: 'Hello from Gemini' }, status: 'done' }],
          loading: false,
          files: []
        },
        {
          key: 'existing-session-2',
          label: 'Existing GPT Session',
          provider: 'gpt-4o-mini',
          messages: [{ message: { role: 'user', content: 'Hello from GPT' }, status: 'done' }],
          loading: false,
          files: []
        },
        {
          key: 'existing-session-3',
          label: 'Existing Claude Session',
          provider: 'claude-3-sonnet',
          messages: [{ message: { role: 'user', content: 'Hello from Claude' }, status: 'done' }],
          loading: false,
          files: []
        }
      ];

      mockChatStore.getSessionList.mockReturnValue(sessionList);
      mockChatStore.currentSessionId = 'existing-session-1';
      
      // Mock that current session has messages (so it won't be deleted)
      mockChatStore.getCurrentMessages.mockReturnValue([
        { message: { role: 'user', content: 'Hello from Gemini' }, status: 'done' }
      ]);

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Verify all existing sessions are displayed with their original providers
      expect(screen.getByTestId('session-item-existing-session-1')).toHaveTextContent('Existing Gemini Session (gemini-2.5-flash)');
      expect(screen.getByTestId('session-item-existing-session-2')).toHaveTextContent('Existing GPT Session (gpt-4o-mini)');
      expect(screen.getByTestId('session-item-existing-session-3')).toHaveTextContent('Existing Claude Session (claude-3-sonnet)');

      // Create a new session (this should not affect existing sessions)
      const newSessionButton = screen.getByTestId('new-session');
      fireEvent.click(newSessionButton);

      // Verify that createSession was called (new session created)
      expect(mockChatStore.createSession).toHaveBeenCalledWith(undefined);
      
      // Verify that existing sessions were not deleted or modified
      expect(mockChatStore.deleteSession).not.toHaveBeenCalledWith('existing-session-1');
      expect(mockChatStore.deleteSession).not.toHaveBeenCalledWith('existing-session-2');
      expect(mockChatStore.deleteSession).not.toHaveBeenCalledWith('existing-session-3');
      
      // Verify that no session labels were updated (providers unchanged)
      expect(mockChatStore.updateSessionLabel).not.toHaveBeenCalled();
      
      // Verify UI state was reset for the new session only
      expect(mockUIStore.resetUIState).toHaveBeenCalled();
    });

    it('should maintain independent sessions without affecting each other', () => {
      const sessionList = [
        {
          key: 'session-1',
          label: 'Session 1',
          provider: 'gemini-2.5-flash',
          messages: [{ message: { role: 'user', content: 'Hello 1' }, status: 'done' }],
          loading: false,
          files: []
        },
        {
          key: 'session-2', 
          label: 'Session 2',
          provider: 'gpt-4o-mini',
          messages: [{ message: { role: 'user', content: 'Hello 2' }, status: 'done' }],
          loading: false,
          files: []
        },
        {
          key: 'session-3',
          label: 'Session 3', 
          provider: 'claude-3-sonnet',
          messages: [{ message: { role: 'user', content: 'Hello 3' }, status: 'done' }],
          loading: false,
          files: []
        }
      ];

      mockChatStore.getSessionList.mockReturnValue(sessionList);
      mockChatStore.currentSessionId = 'session-1';

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Verify all sessions are displayed
      expect(screen.getByTestId('session-item-session-1')).toBeInTheDocument();
      expect(screen.getByTestId('session-item-session-2')).toBeInTheDocument();
      expect(screen.getByTestId('session-item-session-3')).toBeInTheDocument();

      // Switch to session-2
      fireEvent.click(screen.getByTestId('session-item-session-2'));

      expect(mockChatStore.setCurrentSession).toHaveBeenCalledWith('session-2');
      expect(mockUIStore.resetUIState).toHaveBeenCalled();

      // Verify session switching doesn't affect other sessions
      expect(mockChatStore.deleteSession).not.toHaveBeenCalled();
      expect(mockChatStore.updateSessionLabel).not.toHaveBeenCalled();
    });

    it('should handle multiple sessions with different providers independently', () => {
      const sessionList = [
        {
          key: 'gemini-session',
          label: 'Gemini Chat',
          provider: 'gemini-2.5-flash',
          messages: [],
          loading: false,
          files: []
        },
        {
          key: 'gpt-session',
          label: 'GPT Chat',
          provider: 'gpt-4o-mini', 
          messages: [],
          loading: false,
          files: []
        }
      ];

      mockChatStore.getSessionList.mockReturnValue(sessionList);

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Verify both sessions are shown with their respective providers
      expect(screen.getByTestId('session-item-gemini-session')).toHaveTextContent('Gemini Chat (gemini-2.5-flash)');
      expect(screen.getByTestId('session-item-gpt-session')).toHaveTextContent('GPT Chat (gpt-4o-mini)');
    });
  });

  describe('Empty Session Cleanup', () => {
    it('should delete empty sessions when creating new session', () => {
      // Mock empty session
      mockChatStore.getCurrentMessages.mockReturnValue([]);
      mockChatStore.currentSessionId = 'empty-session-1';

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      const newSessionButton = screen.getByTestId('new-session');
      fireEvent.click(newSessionButton);

      expect(mockChatStore.deleteSession).toHaveBeenCalledWith('empty-session-1');
      expect(mockChatStore.createSession).toHaveBeenCalled();
    });

    it('should not delete sessions with messages', () => {
      // Mock session with messages
      mockChatStore.getCurrentMessages.mockReturnValue([
        { message: { role: 'user', content: 'Test message' }, status: 'done' }
      ]);

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      const newSessionButton = screen.getByTestId('new-session');
      fireEvent.click(newSessionButton);

      expect(mockChatStore.deleteSession).not.toHaveBeenCalled();
      expect(mockChatStore.createSession).toHaveBeenCalled();
    });
  });

  describe('Session Switching via MenuBar', () => {
    it('should switch sessions when clicking on session in MenuBar', () => {
      const sessionList = [
        {
          key: 'session-1',
          label: 'First Session',
          provider: 'gemini-2.5-flash',
          messages: [],
          loading: false,
          files: []
        },
        {
          key: 'session-2',
          label: 'Second Session',
          provider: 'gpt-4o-mini',
          messages: [],
          loading: false,
          files: []
        }
      ];

      mockChatStore.getSessionList.mockReturnValue(sessionList);
      mockChatStore.currentSessionId = 'session-1';

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Click on session-2
      fireEvent.click(screen.getByTestId('session-item-session-2'));

      expect(mockChatStore.setCurrentSession).toHaveBeenCalledWith('session-2');
      expect(mockUIStore.resetUIState).toHaveBeenCalled();
    });

    it('should update UI state when switching sessions', () => {
      const sessionList = [
        {
          key: 'session-1',
          label: 'Session 1',
          provider: 'gemini-2.5-flash',
          messages: [{ message: { role: 'user', content: 'Message 1' }, status: 'done' }],
          loading: false,
          files: []
        },
        {
          key: 'session-2',
          label: 'Session 2',
          provider: 'gpt-4o-mini',
          messages: [{ message: { role: 'user', content: 'Message 2' }, status: 'done' }],
          loading: false,
          files: []
        }
      ];

      mockChatStore.getSessionList.mockReturnValue(sessionList);
      mockChatStore.currentSessionId = 'session-1';

      // Mock different messages for different sessions
      mockChatStore.getCurrentMessages
        .mockReturnValueOnce([{ message: { role: 'user', content: 'Message 1' }, status: 'done' }])
        .mockReturnValueOnce([{ message: { role: 'user', content: 'Message 2' }, status: 'done' }]);

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Switch to session-2
      fireEvent.click(screen.getByTestId('session-item-session-2'));

      // Verify UI state is reset
      expect(mockUIStore.resetUIState).toHaveBeenCalled();
      expect(mockChatStore.setCurrentSession).toHaveBeenCalledWith('session-2');
    });

    it('should highlight active session in MenuBar', () => {
      const sessionList = [
        {
          key: 'session-1',
          label: 'Active Session',
          provider: 'gemini-2.5-flash',
          messages: [],
          loading: false,
          files: []
        },
        {
          key: 'session-2',
          label: 'Inactive Session',
          provider: 'gpt-4o-mini',
          messages: [],
          loading: false,
          files: []
        }
      ];

      mockChatStore.getSessionList.mockReturnValue(sessionList);
      mockChatStore.currentSessionId = 'session-1';

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Check that active session has bold styling
      const activeSession = screen.getByTestId('session-item-session-1');
      const inactiveSession = screen.getByTestId('session-item-session-2');

      expect(activeSession).toHaveStyle('font-weight: bold');
      expect(inactiveSession).toHaveStyle('font-weight: normal');
    });
  });

  describe('Session State Persistence', () => {
    it('should maintain session-specific loading states', () => {
      const sessionList = [
        {
          key: 'session-1',
          label: 'Session 1',
          provider: 'gemini-2.5-flash',
          messages: [],
          loading: true, // This session is loading
          files: []
        },
        {
          key: 'session-2',
          label: 'Session 2',
          provider: 'gpt-4o-mini',
          messages: [],
          loading: false, // This session is not loading
          files: []
        }
      ];

      mockChatStore.getSessionList.mockReturnValue(sessionList);
      mockChatStore.currentSessionId = 'session-1';
      mockChatStore.getSessionLoading.mockImplementation((sessionId) => {
        return sessionId === 'session-1';
      });

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Verify loading state is set correctly for current session
      expect(mockUIStore.setLoading).toHaveBeenCalledWith(true);

      // Switch to non-loading session
      fireEvent.click(screen.getByTestId('session-item-session-2'));

      // Verify session switching was called
      expect(mockChatStore.setCurrentSession).toHaveBeenCalledWith('session-2');
    });

    it('should handle session-specific file attachments', () => {
      mockChatStore.getSessionFiles.mockReturnValue(['file1.txt', 'file2.png']);

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Submit a message to trigger file handling
      const messageInput = screen.getByTestId('message-input');
      fireEvent.change(messageInput, { target: { value: 'Test with files' } });
      fireEvent.click(screen.getByTestId('send-button'));

      // Verify files are passed to chat service
      expect(mockChatService.streamChat).toHaveBeenCalledWith(
        'Test with files',
        'gemini-2.5-flash',
        [],
        expect.any(String),
        expect.objectContaining({
          files: ['file1.txt', 'file2.png']
        })
      );
    });
  });

  describe('Session Label Updates', () => {
    it('should update session label for new sessions after first message', async () => {
      // Mock a new session
      mockChatStore.getCurrentSession.mockReturnValue({
        id: 'new-session-1',
        label: 'New session', // This indicates a new session
        provider: 'gemini-2.5-flash',
        messages: [],
        loading: false,
        files: []
      });

      // Update the currentSessionId to match what the component will use
      mockChatStore.currentSessionId = 'session-1';

      mockChatService.streamChat.mockResolvedValue();

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Send first message
      const messageInput = screen.getByTestId('message-input');
      fireEvent.change(messageInput, { target: { value: 'This is my first message in the new session' } });
      fireEvent.click(screen.getByTestId('send-button'));

      // Verify session label is updated with first 20 characters
      expect(mockChatStore.updateSessionLabel).toHaveBeenCalledWith(
        'session-1', // currentSessionId from mock
        'This is my first mes' // First 20 characters
      );
    });

    it('should not update session label for existing sessions', async () => {
      // Mock an existing session with custom label
      mockChatStore.getCurrentSession.mockReturnValue({
        id: 'existing-session-1',
        label: 'Custom Session Name', // Not "New session"
        provider: 'gemini-2.5-flash',
        messages: [{ message: { role: 'user', content: 'Previous message' }, status: 'done' }],
        loading: false,
        files: []
      });

      mockChatService.streamChat.mockResolvedValue();

      renderWithMocks(<CopilotSidebar {...mockProps} />);

      // Send message
      const messageInput = screen.getByTestId('message-input');
      fireEvent.change(messageInput, { target: { value: 'Another message' } });
      fireEvent.click(screen.getByTestId('send-button'));

      // Verify session label is NOT updated
      expect(mockChatStore.updateSessionLabel).not.toHaveBeenCalled();
    });
  });
});
