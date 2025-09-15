import { beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Chrome extension APIs
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
      remove: vi.fn()
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
      remove: vi.fn()
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    }
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    },
    id: 'test-extension-id'
  }
};

// Mock window.getSelection for usePageSelection tests
global.getSelection = vi.fn(() => ({
  toString: vi.fn(() => ''),
  rangeCount: 0,
  getRangeAt: vi.fn()
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve(''))
  }
});

// Mock fetch for network requests
global.fetch = vi.fn();

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({
    toDataURL: vi.fn(() => 'data:image/png;base64,mocked-image-data')
  }))
}));

// Mock dayjs - return predictable timestamps for testing
vi.mock('dayjs', () => {
  const mockDayjs = vi.fn(() => ({
    valueOf: vi.fn(() => 1640995200000), // Fixed timestamp: 2022-01-01 00:00:00 UTC
    format: vi.fn(() => '2022-01-01')
  }));
  
  mockDayjs.valueOf = vi.fn(() => 1640995200000);
  return { default: mockDayjs };
});

// Console suppression for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  
  // Clear any existing timeouts/intervals
  vi.clearAllTimers();
  
  // Reset chrome storage mocks
  global.chrome.storage.local.get.mockResolvedValue({});
  global.chrome.storage.local.set.mockResolvedValue();
  global.chrome.storage.local.clear.mockResolvedValue();
  
  // Reset fetch mock
  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  });
  
  // Clear global mock stores to prevent cross-test contamination
  globalThis.mockUIStore = null;
  globalThis.mockChatStore = null;
  
  // Suppress console warnings/errors during tests unless explicitly testing them
  console.error = vi.fn();
  console.warn = vi.fn();
});

// Restore console after all tests
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
