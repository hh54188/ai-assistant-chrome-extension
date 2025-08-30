# Testing Guide

This directory contains comprehensive unit tests for the Chrome Extension frontend.

## Structure

```
tests/
├── setup.js                 # Global test setup and mocks
├── mocks/
│   └── storeMocks.js        # Store-specific mocks and utilities
├── stores/
│   ├── chatStore.test.js    # ChatStore unit tests
│   └── uiStore.test.js      # UIStore unit tests
├── utils/
│   └── testUtils.js         # Testing utilities and helpers
└── README.md                # This file
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Testing Philosophy

### Store Tests (70% of test coverage)
- **What we test**: Pure business logic, state mutations, data transformations
- **Why**: Most UI behavior is driven by store state changes
- **Examples**: Session management, message handling, loading states

### Component Tests (20% of test coverage)  
- **What we test**: Browser API interactions, UI library integration, DOM events
- **Why**: Store can't test browser-specific behavior
- **Examples**: Clipboard operations, file uploads, canvas operations

### Integration Tests (10% of test coverage)
- **What we test**: Store-component interactions, end-to-end workflows
- **Why**: Ensure components and stores work together correctly
- **Examples**: Session switching, file upload flow, error handling

## Test Patterns

### Store Testing Pattern
```javascript
describe('StoreName', () => {
  beforeEach(() => {
    // Reset store to initial state
    useStore.setState(initialState);
  });

  it('should update state correctly', () => {
    const { action } = useStore.getState();
    
    action(params);
    
    const state = useStore.getState();
    expect(state.property).toBe(expectedValue);
  });
});
```

### Component Testing Pattern
```javascript
describe('ComponentName', () => {
  it('should handle browser API interaction', () => {
    render(<Component />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockBrowserAPI).toHaveBeenCalledWith(expectedParams);
  });
});
```

## Mocking Strategy

### Global Mocks (setup.js)
- Chrome extension APIs
- Browser APIs (clipboard, getSelection)
- External libraries (html2canvas, dayjs)
- Console methods for cleaner output

### Test-Specific Mocks
- Network requests (fetch)
- File system operations
- Canvas operations
- AbortController instances

## Test Data Factories

Use the factory functions in `testUtils.js` to create consistent test data:

```javascript
import { factories } from '../utils/testUtils';

// Create mock session
const session = factories.session({ 
  label: 'Custom Label',
  provider: 'gpt-4' 
});

// Create mock message
const message = factories.message({
  message: { role: 'assistant', content: 'AI response' },
  status: 'done'
});
```

## Coverage Goals

- **Stores**: 95%+ coverage (critical business logic)
- **Components**: 80%+ coverage (focus on browser interactions)
- **Utils/Hooks**: 90%+ coverage (pure functions, easy to test)
- **Overall**: 85%+ coverage

## Best Practices

### DO
✅ Test behavior, not implementation details  
✅ Use descriptive test names that explain the scenario  
✅ Reset state between tests for isolation  
✅ Mock external dependencies consistently  
✅ Test edge cases and error conditions  
✅ Use factories for consistent test data  

### DON'T
❌ Test internal implementation details  
❌ Test third-party library behavior  
❌ Write tests that depend on other tests  
❌ Mock everything (test real interactions when possible)  
❌ Test the same logic in multiple places  
❌ Write tests that are harder to understand than the code  

## Debugging Tests

### Common Issues
1. **State not resetting**: Ensure `beforeEach` properly resets stores
2. **Async timing**: Use `waitFor` utilities for async operations
3. **Mock not working**: Check mock is applied before component render
4. **Console errors**: Check setup.js for proper error suppression

### Debug Commands
```bash
# Run specific test file
npm test chatStore.test.js

# Run tests matching pattern
npm test -- --grep "Session Management"

# Debug with console output
npm test -- --reporter=verbose

# Run single test
npm test -- --grep "should create new session"
```

## Writing New Tests

1. **Identify what to test**: Business logic (store) vs browser behavior (component)
2. **Choose the right level**: Unit test the specific functionality
3. **Use existing patterns**: Follow established test structure
4. **Add factories**: Create reusable test data if needed
5. **Test edge cases**: Empty states, error conditions, boundary values
6. **Update this README**: Document any new patterns or utilities

## Continuous Integration

Tests run automatically on:
- Pre-commit hooks
- Pull request validation  
- Main branch pushes
- Nightly builds with coverage reporting

Coverage reports are generated and stored in `coverage/` directory.
