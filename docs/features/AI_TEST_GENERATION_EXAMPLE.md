# AI Test Generation Example

## How the AI Test Generation Works

The Coverage Enforcer workflow uses AI to generate meaningful tests by analyzing uncovered code and creating comprehensive test cases. Here's how it works:

### 1. Coverage Analysis
The workflow first analyzes the coverage data to identify exactly which lines are uncovered:

```javascript
// Example: Store file with uncovered lines
// src/stores/exampleStore.js
export const useExampleStore = create((set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })), // Line 3 - COVERED
  decrement: () => set((state) => ({ count: state.count - 1 })), // Line 4 - UNCOVERED
  reset: () => set({ count: 0 }), // Line 5 - UNCOVERED
  double: () => set((state) => ({ count: state.count * 2 })), // Line 6 - UNCOVERED
}));
```

### 2. AI Prompt Generation
The workflow creates a detailed prompt for the AI that includes:

- **Store file path and uncovered line numbers**
- **Code context** around uncovered lines (5 lines before/after)
- **Full store code** for complete understanding
- **Specific requirements** for test generation
- **Existing test patterns** from the project

### 3. AI Test Generation
The AI receives this prompt and generates comprehensive tests:

```javascript
// Generated test file: src/tests/stores/exampleStore.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExampleStore } from '../../stores/exampleStore';

describe('ExampleStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('decrement function', () => {
    it('should decrease count by 1', () => {
      const { result } = renderHook(() => useExampleStore());
      
      act(() => {
        result.current.increment(); // Set count to 1
        result.current.decrement(); // This covers the uncovered line
      });
      
      expect(result.current.count).toBe(0);
    });

    it('should not go below 0 when decrementing from 0', () => {
      const { result } = renderHook(() => useExampleStore());
      
      act(() => {
        result.current.decrement(); // This covers the uncovered line
      });
      
      expect(result.current.count).toBe(-1);
    });
  });

  describe('reset function', () => {
    it('should reset count to 0', () => {
      const { result } = renderHook(() => useExampleStore());
      
      act(() => {
        result.current.increment();
        result.current.increment();
        result.current.reset(); // This covers the uncovered line
      });
      
      expect(result.current.count).toBe(0);
    });
  });

  describe('double function', () => {
    it('should double the current count', () => {
      const { result } = renderHook(() => useExampleStore());
      
      act(() => {
        result.current.increment();
        result.current.increment(); // count = 2
        result.current.double(); // This covers the uncovered line
      });
      
      expect(result.current.count).toBe(4);
    });

    it('should handle doubling from 0', () => {
      const { result } = renderHook(() => useExampleStore());
      
      act(() => {
        result.current.double(); // This covers the uncovered line
      });
      
      expect(result.current.count).toBe(0);
    });
  });
});
```

### 4. AI Prompt Structure

The AI receives a detailed prompt like this:

```
You are an expert JavaScript/React testing engineer. I need you to generate comprehensive unit tests for a Zustand store that has uncovered code paths.

STORE FILE: src/stores/exampleStore.js
UNCOVERED LINES: 4, 5, 6

CODE CONTEXT:
Line 4:
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })), // UNCOVERED
  reset: () => set({ count: 0 }), // UNCOVERED
  double: () => set((state) => ({ count: state.count * 2 })), // UNCOVERED
}));

FULL STORE CODE:
export const useExampleStore = create((set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  double: () => set((state) => ({ count: state.count * 2 })),
}));

REQUIREMENTS:
1. Generate complete, working unit tests using Vitest and @testing-library/react
2. Cover ALL the uncovered lines mentioned above
3. Use proper mocking for external dependencies
4. Test both happy path and edge cases
5. Ensure tests are realistic and meaningful
6. Use the existing test patterns from the project
7. Import statements should be correct relative to the test file location
8. Tests should be well-documented with descriptive names
```

### 5. AI Response Processing

The AI generates the test code, and the workflow:

1. **Cleans up the response** (removes markdown formatting)
2. **Validates the code structure**
3. **Writes the test file** to the correct location
4. **Runs the tests** to verify they work
5. **Checks coverage improvement**

### 6. Quality Assurance

The generated tests are:
- ✅ **Comprehensive**: Cover all uncovered lines
- ✅ **Realistic**: Test actual functionality, not just syntax
- ✅ **Well-structured**: Follow project patterns and best practices
- ✅ **Edge-case aware**: Test both happy path and error conditions
- ✅ **Properly mocked**: Handle external dependencies correctly

### 7. Example Workflow Run

```
🔍 Analyzing coverage data...
📊 Found 3 uncovered lines in src/stores/exampleStore.js
🤖 Calling Cursor API for src/stores/exampleStore.js...
✅ Generated tests for src/stores/exampleStore.js -> src/tests/stores/exampleStore.test.js
🧪 Running tests to verify coverage improvement...
✅ Tests pass! Coverage improved from 25% to 100%
📝 Creating pull request with test improvements...
```

## Key Benefits

1. **Intelligent Analysis**: AI understands the code context and generates meaningful tests
2. **Comprehensive Coverage**: Tests cover all uncovered lines with realistic scenarios
3. **Quality Assurance**: Generated tests follow best practices and project patterns
4. **Automatic Verification**: Tests are run to ensure they actually work
5. **No Manual Work**: Completely automated process from analysis to PR creation

## API Integration

The workflow uses the Cursor API with:
- **Model**: GPT-4 for high-quality test generation
- **Temperature**: 0.1 for consistent, focused output
- **Max Tokens**: 4000 for comprehensive test files
- **System Prompt**: Expert testing engineer persona
- **User Prompt**: Detailed code context and requirements

### How the AI Integration Works

1. **Coverage Analysis**: The workflow parses `lcov.info` to find exact uncovered lines
2. **Code Context Extraction**: For each uncovered line, it extracts 5 lines before and after for context
3. **AI Prompt Generation**: Creates a detailed prompt with:
   - Store file path and uncovered line numbers
   - Code context around uncovered lines
   - Full store code for complete understanding
   - Specific testing requirements
   - Project-specific test patterns

4. **API Call**: Sends the prompt to Cursor API with proper authentication
5. **Response Processing**: Cleans up the AI response and writes test files
6. **Verification**: Runs tests to ensure they work and improve coverage

### Example AI Prompt

```
You are an expert JavaScript/React testing engineer. I need you to generate comprehensive unit tests for a Zustand store that has uncovered code paths.

STORE FILE: src/stores/exampleStore.js
UNCOVERED LINES: 4, 5, 6

CODE CONTEXT:
Line 4:
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })), // UNCOVERED
  reset: () => set({ count: 0 }), // UNCOVERED
  double: () => set((state) => ({ count: state.count * 2 })), // UNCOVERED
}));

FULL STORE CODE:
export const useExampleStore = create((set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  double: () => set((state) => ({ count: state.count * 2 })),
}));

REQUIREMENTS:
1. Generate complete, working unit tests using Vitest and @testing-library/react
2. Cover ALL the uncovered lines mentioned above
3. Use proper mocking for external dependencies
4. Test both happy path and edge cases
5. Ensure tests are realistic and meaningful
6. Use the existing test patterns from the project
7. Import statements should be correct relative to the test file location
8. Tests should be well-documented with descriptive names

EXISTING TEST PATTERNS IN PROJECT:
- Use describe blocks for grouping related tests
- Use it or test for individual test cases
- Use beforeEach for setup
- Use vi.fn() for mocking functions
- Use renderHook from @testing-library/react for testing hooks
- Use act for state updates
- Use expect for assertions

Please generate a complete test file that covers all uncovered lines. The test file should be production-ready and follow best practices.
```

This ensures the AI generates production-ready tests that actually improve coverage and follow the project's testing standards.
