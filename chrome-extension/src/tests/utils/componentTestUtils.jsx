import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { createMockStore, createMockSession } from '../mocks/storeMocks';

/**
 * Enhanced render function that provides store mocking
 */
export const renderWithMocks = (component, options = {}) => {
  const {
    uiStoreState = {},
    chatStoreState = {},
    ...renderOptions
  } = options;

  // Create mock stores with default states
  const mockUIStore = createMockStore({
    // Default UI Store state
    inputValue: '',
    loading: false,
    referenceModalVisible: false,
    modelSelectionModalVisible: false,
    currentSelection: null,
    selectedModels: [],
    isExpanded: false,
    turboMode: false,
    isScreenshotMode: false,
    screenshotData: null,
    currentSessionFiles: [],
    ...uiStoreState,
    
    // Default actions
    setInputValue: vi.fn((value) => mockUIStore.setState({ inputValue: value })),
    clearInput: vi.fn(() => mockUIStore.setState({ inputValue: '' })),
    setLoading: vi.fn((loading) => mockUIStore.setState({ loading })),
    setReferenceModalVisible: vi.fn((visible) => mockUIStore.setState({ referenceModalVisible: visible })),
    setModelSelectionModalVisible: vi.fn((visible) => mockUIStore.setState({ modelSelectionModalVisible: visible })),
    setCurrentSelection: vi.fn((selection) => mockUIStore.setState({ currentSelection: selection })),
    setSelectedModels: vi.fn((models) => mockUIStore.setState({ selectedModels: models })),
    addSelectedModel: vi.fn((model) => {
      const state = mockUIStore.getState();
      if (!state.selectedModels.includes(model)) {
        mockUIStore.setState({ selectedModels: [...state.selectedModels, model] });
      }
    }),
    removeSelectedModel: vi.fn((model) => {
      const state = mockUIStore.getState();
      mockUIStore.setState({ selectedModels: state.selectedModels.filter(m => m !== model) });
    }),
    clearSelectedModels: vi.fn(() => mockUIStore.setState({ selectedModels: [] })),
    setIsExpanded: vi.fn((expanded) => mockUIStore.setState({ isExpanded: expanded })),
    toggleExpanded: vi.fn(() => {
      const state = mockUIStore.getState();
      mockUIStore.setState({ isExpanded: !state.isExpanded });
    }),
    setTurboMode: vi.fn((enabled) => mockUIStore.setState({ turboMode: enabled })),
    setIsScreenshotMode: vi.fn((active) => mockUIStore.setState({ isScreenshotMode: active })),
    setScreenshotData: vi.fn((data) => mockUIStore.setState({ screenshotData: data })),
    clearScreenshotData: vi.fn(() => mockUIStore.setState({ screenshotData: null })),
    setCurrentSessionFiles: vi.fn((files) => mockUIStore.setState({ currentSessionFiles: files })),
    clearCurrentSessionFiles: vi.fn(() => mockUIStore.setState({ currentSessionFiles: [] })),
    resetUIState: vi.fn(() => {
      mockUIStore.setState({
        inputValue: '',
        loading: false,
        referenceModalVisible: false,
        modelSelectionModalVisible: false,
        currentSelection: null,
        selectedModels: [],
        isScreenshotMode: false,
        screenshotData: null,
        currentSessionFiles: []
      });
    }),
    getUIState: vi.fn(() => {
      const state = mockUIStore.getState();
      return {
        inputValue: state.inputValue,
        loading: state.loading,
        isExpanded: state.isExpanded,
        turboMode: state.turboMode,
        hasScreenshot: !!state.screenshotData,
        hasFiles: state.currentSessionFiles.length > 0,
        hasSelection: !!state.currentSelection,
        isAnyModalOpen: state.referenceModalVisible || state.modelSelectionModalVisible,
      };
    })
  });

  const defaultSession = createMockSession();
  const mockChatStore = createMockStore({
    // Default Chat Store state
    currentSessionId: defaultSession.id,
    selectedProvider: 'gemini-2.5-flash',
    sessions: [defaultSession],
    ...chatStoreState,
    
    // Default actions
    setCurrentSession: vi.fn((sessionId) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        mockChatStore.setState({
          currentSessionId: sessionId,
          selectedProvider: session.provider
        });
      }
    }),
    setSelectedProvider: vi.fn((provider) => {
      const state = mockChatStore.getState();
      mockChatStore.setState({ selectedProvider: provider });
      const currentSession = state.sessions.find(s => s.id === state.currentSessionId);
      if (currentSession) {
        currentSession.provider = provider;
      }
    }),
    createSession: vi.fn((provider = 'gemini-2.5-flash') => {
      const state = mockChatStore.getState();
      const newSession = createMockSession({
        id: Date.now().toString(),
        provider
      });
      mockChatStore.setState({
        sessions: [newSession, ...state.sessions],
        currentSessionId: newSession.id,
        selectedProvider: provider
      });
    }),
    deleteSession: vi.fn((sessionId) => {
      const state = mockChatStore.getState();
      const filteredSessions = state.sessions.filter(s => s.id !== sessionId);
      const updates = { sessions: filteredSessions };
      
      if (state.currentSessionId === sessionId && filteredSessions.length > 0) {
        updates.currentSessionId = filteredSessions[0].id;
        updates.selectedProvider = filteredSessions[0].provider;
      }
      
      mockChatStore.setState(updates);
    }),
    updateSessionLabel: vi.fn((sessionId, label) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.label = label;
        mockChatStore.setState({ sessions: [...state.sessions] });
      }
    }),
    addMessage: vi.fn((sessionId, message, status = 'done') => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.messages.push({ message, status });
        if (session.label === 'New session' && message.role === 'user') {
          session.label = message.content.slice(0, 20);
        }
        mockChatStore.setState({ sessions: [...state.sessions] });
      }
    }),
    updateLastMessage: vi.fn((sessionId, content) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      if (session && session.messages.length > 0) {
        const lastMessage = session.messages[session.messages.length - 1];
        if (lastMessage.message.role === 'assistant') {
          lastMessage.message.content = content;
          mockChatStore.setState({ sessions: [...state.sessions] });
        }
      }
    }),
    appendToLastMessage: vi.fn((sessionId, content) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      if (session && session.messages.length > 0) {
        const lastMessage = session.messages[session.messages.length - 1];
        if (lastMessage.message.role === 'assistant') {
          lastMessage.message.content += content;
          mockChatStore.setState({ sessions: [...state.sessions] });
        }
      }
    }),
    updateMessageStatus: vi.fn((sessionId, messageIndex, status) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      if (session && session.messages[messageIndex]) {
        session.messages[messageIndex].status = status;
        mockChatStore.setState({ sessions: [...state.sessions] });
      }
    }),
    updateLastMessageStatus: vi.fn((sessionId, status) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      if (session && session.messages.length > 0) {
        session.messages[session.messages.length - 1].status = status;
        mockChatStore.setState({ sessions: [...state.sessions] });
      }
    }),
    setSessionLoading: vi.fn((sessionId, loading) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.loading = loading;
        mockChatStore.setState({ sessions: [...state.sessions] });
      }
    }),
    getSessionLoading: vi.fn((sessionId) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      return session ? session.loading : false;
    }),
    setSessionFiles: vi.fn((sessionId, files) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.files = files;
        mockChatStore.setState({ sessions: [...state.sessions] });
      }
    }),
    getSessionFiles: vi.fn((sessionId) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      return session ? session.files : [];
    }),
    clearSessionFiles: vi.fn((sessionId) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.files = [];
        mockChatStore.setState({ sessions: [...state.sessions] });
      }
    }),
    setSessionAbortController: vi.fn((sessionId, controller) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.abortController = controller;
        mockChatStore.setState({ sessions: [...state.sessions] });
      }
    }),
    getSessionAbortController: vi.fn((sessionId) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      return session ? session.abortController : null;
    }),
    abortSessionRequest: vi.fn((sessionId) => {
      const state = mockChatStore.getState();
      const session = state.sessions.find(s => s.id === sessionId);
      if (session && session.abortController) {
        session.abortController.abort();
        session.abortController = null;
        session.loading = false;
        mockChatStore.setState({ sessions: [...state.sessions] });
      }
    }),
    clearAllSessions: vi.fn(() => {
      const newSession = createMockSession({
        id: Date.now().toString()
      });
      mockChatStore.setState({
        sessions: [newSession],
        currentSessionId: newSession.id,
        selectedProvider: 'gemini-2.5-flash'
      });
    }),
    getCurrentSession: vi.fn(() => {
      const state = mockChatStore.getState();
      return state.sessions.find(s => s.id === state.currentSessionId);
    }),
    getCurrentMessages: vi.fn(() => {
      const state = mockChatStore.getState();
      const currentSession = state.sessions.find(s => s.id === state.currentSessionId);
      return currentSession ? currentSession.messages : [];
    }),
    getSessionById: vi.fn((sessionId) => {
      const state = mockChatStore.getState();
      return state.sessions.find(s => s.id === sessionId);
    }),
    getSessionList: vi.fn(() => {
      const state = mockChatStore.getState();
      return state.sessions.map(session => ({
        key: session.id,
        label: session.label,
        provider: session.provider,
        group: session.group,
        messages: session.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        loading: session.loading,
        files: session.files
      }));
    }),
    getTotalSessions: vi.fn(() => {
      const state = mockChatStore.getState();
      return state.sessions.length;
    }),
    getTotalMessages: vi.fn(() => {
      const state = mockChatStore.getState();
      return state.sessions.reduce((total, session) => total + session.messages.length, 0);
    })
  });

  // Store mocking is now handled at the test file level with vi.mock

  const result = render(component, renderOptions);

  return {
    ...result,
    mockUIStore,
    mockChatStore,
    // Helper to get current store states
    getUIState: () => mockUIStore.getState(),
    getChatState: () => mockChatStore.getState()
  };
};

/**
 * Mock Ant Design components that might cause issues in tests
 */
export const mockAntdComponents = () => {
  // Mock Popover to avoid portal issues
  vi.doMock('antd', async () => {
    const actual = await vi.importActual('antd');
    return {
      ...actual,
      Popover: ({ children, content, ...props }) => (
        <div data-testid="popover" {...props}>
          {children}
          {content && <div data-testid="popover-content">{content}</div>}
        </div>
      ),
      Tooltip: ({ children, title, ...props }) => (
        <div data-testid="tooltip" title={title} {...props}>
          {children}
        </div>
      )
    };
  });
};

/**
 * Mock Chrome Extension APIs
 */
export const mockChromeAPIs = () => {
  globalThis.chrome = {
    storage: {
      local: {
        get: vi.fn(() => Promise.resolve({})),
        set: vi.fn(() => Promise.resolve()),
        remove: vi.fn(() => Promise.resolve()),
        clear: vi.fn(() => Promise.resolve())
      },
      sync: {
        get: vi.fn(() => Promise.resolve({})),
        set: vi.fn(() => Promise.resolve()),
        remove: vi.fn(() => Promise.resolve()),
        clear: vi.fn(() => Promise.resolve())
      }
    },
    runtime: {
      sendMessage: vi.fn(() => Promise.resolve()),
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn()
      }
    },
    tabs: {
      query: vi.fn(() => Promise.resolve([])),
      sendMessage: vi.fn(() => Promise.resolve())
    }
  };
};

/**
 * Create event helpers for testing
 */
export const createEventHelpers = () => ({
  click: (element) => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  },
  input: (element, value) => {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  },
  keydown: (element, key) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  },
  submit: (form) => {
    form.dispatchEvent(new Event('submit', { bubbles: true }));
  }
});

/**
 * Wait for async operations to complete
 */
export const waitForAsync = (ms = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Helper to create mock screenshot data
 */
export const createMockScreenshotData = (overrides = {}) => ({
  type: 'inline',
  data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  mimeType: 'image/png',
  name: 'screenshot.png',
  ...overrides
});

/**
 * Helper to create mock file upload data
 */
export const createMockUploadFile = (overrides = {}) => ({
  uid: `file-${Date.now()}`,
  name: 'test-file.png',
  status: 'done',
  type: 'image/png',
  size: 1024,
  ...overrides
});

/**
 * Helper to simulate file drop events
 */
export const simulateFileDrop = (element, files) => {
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));
  
  const dropEvent = new DragEvent('drop', {
    bubbles: true,
    dataTransfer
  });
  
  element.dispatchEvent(dropEvent);
};
