import { vi, beforeEach, afterAll } from 'vitest';

/**
 * Test utilities for store testing
 */

/**
 * Wait for next tick in event loop
 * Useful for waiting for async state updates
 */
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Wait for a condition to be true
 * @param {Function} condition - Function that returns boolean
 * @param {number} timeout - Max wait time in ms
 * @param {number} interval - Check interval in ms
 */
export const waitFor = async (condition, timeout = 1000, interval = 10) => {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
};

/**
 * Create a mock AbortController for testing
 */
export const createMockAbortController = () => ({
  abort: vi.fn(),
  signal: {
    aborted: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
});

/**
 * Create mock fetch response
 * @param {*} data - Response data
 * @param {boolean} ok - Whether response is successful
 * @param {number} status - HTTP status code
 */
export const createMockFetchResponse = (data, ok = true, status = 200) => ({
  ok,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(typeof data === 'string' ? data : JSON.stringify(data)),
  blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
  headers: new Map()
});

/**
 * Create mock streaming response for testing chat streaming
 * @param {Array<string>} chunks - Array of text chunks to stream
 */
export const createMockStreamResponse = (chunks) => {
  let chunkIndex = 0;
  
  const mockReader = {
    read: vi.fn(() => {
      if (chunkIndex >= chunks.length) {
        return Promise.resolve({ done: true, value: undefined });
      }
      
      const chunk = chunks[chunkIndex++];
      const encoder = new TextEncoder();
      return Promise.resolve({
        done: false,
        value: encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
      });
    })
  };
  
  return {
    ok: true,
    status: 200,
    body: {
      getReader: () => mockReader
    }
  };
};

/**
 * Mock console methods to suppress output during tests
 */
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
    console.info = vi.fn();
  });
  
  afterAll(() => {
    Object.assign(console, originalConsole);
  });
};

/**
 * Create mock file for testing file uploads
 * @param {string} name - File name
 * @param {string} type - MIME type
 * @param {string} content - File content
 */
export const createMockFile = (name = 'test.png', type = 'image/png', content = 'mock-content') => {
  const file = new File([content], name, { type });
  
  // Add properties that might be added by upload components
  Object.defineProperty(file, 'uid', {
    value: `mock-${Date.now()}`,
    writable: true
  });
  
  return file;
};

/**
 * Create mock image data for testing screenshots
 */
export const createMockImageData = (width = 100, height = 100) => ({
  type: 'inline',
  data: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
  mimeType: 'image/png',
  name: `screenshot-${Date.now()}.png`,
  width,
  height
});

/**
 * Mock localStorage for testing persistence
 */
export const mockLocalStorage = () => {
  const storage = new Map();
  
  return {
    getItem: vi.fn((key) => storage.get(key) || null),
    setItem: vi.fn((key, value) => storage.set(key, value)),
    removeItem: vi.fn((key) => storage.delete(key)),
    clear: vi.fn(() => storage.clear()),
    key: vi.fn((index) => Array.from(storage.keys())[index] || null),
    get length() {
      return storage.size;
    },
    _storage: storage // For inspection in tests
  };
};

/**
 * Mock window.getSelection for testing text selection
 */
export const mockWindowSelection = (text = '', html = '') => {
  const mockRange = {
    commonAncestorContainer: {
      nodeType: 1, // Node.ELEMENT_NODE
      outerHTML: html,
      parentElement: {
        outerHTML: html
      }
    }
  };
  
  return {
    toString: vi.fn(() => text),
    rangeCount: text ? 1 : 0,
    getRangeAt: vi.fn(() => mockRange)
  };
};

/**
 * Test data factories
 */
export const factories = {
  session: (overrides = {}) => ({
    id: `session-${Date.now()}`,
    label: 'Test Session',
    provider: 'gemini-2.5-flash',
    group: 'Today',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    loading: false,
    files: [],
    abortController: null,
    ...overrides
  }),
  
  message: (overrides = {}) => ({
    message: {
      role: 'user',
      content: 'Test message',
      ...overrides.message
    },
    status: 'done',
    ...overrides
  }),
  
  file: (overrides = {}) => ({
    type: 'inline',
    data: 'data:image/png;base64,test-data',
    mimeType: 'image/png',
    name: 'test-image.png',
    ...overrides
  }),
  
  uiState: (overrides = {}) => ({
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
    ...overrides
  })
};

/**
 * Assertion helpers
 */
export const assertions = {
  /**
   * Assert that a store state matches expected shape
   */
  toMatchStoreState: (received, expected) => {
    const pass = Object.keys(expected).every(key => {
      if (typeof expected[key] === 'object' && expected[key] !== null) {
        return JSON.stringify(received[key]) === JSON.stringify(expected[key]);
      }
      return received[key] === expected[key];
    });
    
    return {
      pass,
      message: () => pass 
        ? `Expected store state not to match ${JSON.stringify(expected)}`
        : `Expected store state to match ${JSON.stringify(expected)}, but received ${JSON.stringify(received)}`
    };
  }
};

export default {
  waitForNextTick,
  waitFor,
  createMockAbortController,
  createMockFetchResponse,
  createMockStreamResponse,
  mockConsole,
  createMockFile,
  createMockImageData,
  mockLocalStorage,
  mockWindowSelection,
  factories,
  assertions
};
