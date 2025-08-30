import { vi } from 'vitest';

/**
 * Create a fresh store instance for testing
 * This helper ensures each test gets a clean store state
 */
export const createMockStore = (initialState = {}) => {
  const state = { ...initialState };
  const listeners = new Set();
  
  const setState = vi.fn((updater) => {
    if (typeof updater === 'function') {
      const newState = updater(state);
      Object.assign(state, newState);
    } else {
      Object.assign(state, updater);
    }
    
    // Notify listeners
    listeners.forEach(listener => listener(state));
  });
  
  const getState = vi.fn(() => state);
  
  const subscribe = vi.fn((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  });
  
  return {
    setState,
    getState,
    subscribe,
    // Expose internal state for testing
    _state: state,
    _listeners: listeners
  };
};

/**
 * Mock for localStorage persistence
 */
export const createMockStorage = () => {
  const storage = new Map();
  
  return {
    getItem: vi.fn((key) => storage.get(key) || null),
    setItem: vi.fn((key, value) => storage.set(key, value)),
    removeItem: vi.fn((key) => storage.delete(key)),
    clear: vi.fn(() => storage.clear()),
    // Expose storage for inspection
    _storage: storage
  };
};

/**
 * Reset all Zustand stores to initial state
 * Call this in beforeEach to ensure test isolation
 */
export const resetStores = () => {
  // This will be implemented when we have the actual stores imported
  // For now, it's a placeholder
};

/**
 * Mock session data for testing
 */
export const createMockSession = (overrides = {}) => ({
  id: '1640995200000',
  label: 'Test session',
  provider: 'gemini-2.5-flash',
  group: 'Today',
  messages: [],
  createdAt: 1640995200000,
  updatedAt: 1640995200000,
  loading: false,
  files: [],
  abortController: null,
  ...overrides
});

/**
 * Mock message data for testing
 */
export const createMockMessage = (overrides = {}) => ({
  message: {
    role: 'user',
    content: 'Test message',
    ...overrides.message
  },
  status: 'done',
  ...overrides
});

/**
 * Mock file data for testing
 */
export const createMockFile = (overrides = {}) => ({
  type: 'inline',
  data: 'data:image/png;base64,test-data',
  mimeType: 'image/png',
  name: 'test-image.png',
  ...overrides
});
