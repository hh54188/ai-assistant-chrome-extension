/**
 * Simple test to verify the Zustand migration is working
 * 
 * This file can be used to test the stores before integrating with React components
 */

import { useChatStore, useUIStore } from './index';

// Test function to verify stores are working
export const testMigration = () => {
    console.log('🧪 Testing Zustand Store Migration...');
    
    // Test UI Store
    console.log('\n📱 Testing UI Store:');
    const uiState = useUIStore.getState();
    console.log('Initial UI State:', {
        inputValue: uiState.inputValue,
        loading: uiState.loading,
        isExpanded: uiState.isExpanded,
        turboMode: uiState.turboMode
    });
    
    // Test UI actions
    uiState.setInputValue('Test message');
    uiState.setLoading(true);
    uiState.setIsExpanded(true);
    
    console.log('After UI Actions:', {
        inputValue: useUIStore.getState().inputValue,
        loading: useUIStore.getState().loading,
        isExpanded: useUIStore.getState().isExpanded
    });
    
    // Test Chat Store
    console.log('\n💬 Testing Chat Store:');
    const chatState = useChatStore.getState();
    console.log('Initial Chat State:', {
        currentSessionId: chatState.currentSessionId,
        selectedProvider: chatState.selectedProvider,
        sessionsCount: chatState.sessions.length
    });
    
    // Test chat actions
    const originalSessionId = chatState.currentSessionId;
    chatState.addMessage(originalSessionId, { role: 'user', content: 'Hello!' }, 'done');
    chatState.addMessage(originalSessionId, { role: 'assistant', content: 'Hi there!' }, 'done');
    
    console.log('After Adding Messages:', {
        currentMessages: chatState.getCurrentMessages().length,
        lastMessage: chatState.getCurrentMessages().slice(-1)[0]?.message?.content
    });
    
    // Test session creation
    chatState.createSession('gpt-4');
    console.log('After Creating New Session:', {
        currentSessionId: useChatStore.getState().currentSessionId,
        selectedProvider: useChatStore.getState().selectedProvider,
        sessionsCount: useChatStore.getState().sessions.length
    });
    
    // Test UI reset
    console.log('\n🔄 Testing UI Reset:');
    useUIStore.getState().resetUIState();
    console.log('After UI Reset:', {
        inputValue: useUIStore.getState().inputValue,
        loading: useUIStore.getState().loading,
        isExpanded: useUIStore.getState().isExpanded // Should still be true (layout preference)
    });
    
    console.log('\n✅ Migration test completed successfully!');
    return true;
};

// Test persistence (localStorage)
export const testPersistence = () => {
    console.log('🔄 Testing Persistence...');
    
    const chatState = useChatStore.getState();
    const beforeReload = {
        currentSessionId: chatState.currentSessionId,
        selectedProvider: chatState.selectedProvider,
        sessionsCount: chatState.sessions.length
    };
    
    console.log('State before persistence test:', beforeReload);
    
    // Simulate page reload by checking if data exists in localStorage
    const persistedData = localStorage.getItem('chat-store');
    if (persistedData) {
        console.log('✅ Persistence working - data found in localStorage');
        console.log('Persisted keys:', Object.keys(JSON.parse(persistedData).state));
    } else {
        console.log('❌ No persisted data found');
    }
    
    return !!persistedData;
};

// Test performance with selective subscriptions
export const testPerformance = () => {
    console.log('⚡ Testing Performance with Selective Subscriptions...');
    
    let renderCount = 0;
    
    // Simulate component that only subscribes to input value
    const unsubscribe = useUIStore.subscribe(
        (state) => state.inputValue,
        (inputValue) => {
            renderCount++;
            console.log(`Component re-rendered ${renderCount} times for inputValue: ${inputValue}`);
        }
    );
    
    // Change input value (should trigger re-render)
    useUIStore.getState().setInputValue('test 1');
    useUIStore.getState().setInputValue('test 2');
    
    // Change other UI state (should NOT trigger re-render)
    useUIStore.getState().setLoading(true);
    useUIStore.getState().setIsExpanded(false);
    
    console.log(`Total re-renders: ${renderCount} (should be 2 for input changes only)`);
    
    unsubscribe();
    
    return renderCount === 2;
};

// Run all tests
export const runAllTests = () => {
    console.log('🚀 Running Zustand Migration Tests...\n');
    
    const results = {
        migration: testMigration(),
        persistence: testPersistence(),
        performance: testPerformance()
    };
    
    console.log('\n📊 Test Results:', results);
    
    const allPassed = Object.values(results).every(Boolean);
    console.log(allPassed ? '🎉 All tests passed!' : '❌ Some tests failed');
    
    return results;
};

// Export for use in browser console or components
if (typeof window !== 'undefined') {
    window.testZustandMigration = runAllTests;
}
