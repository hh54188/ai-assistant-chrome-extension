import aiService from '../services/aiService.js';

async function testChatSessionReuse() {
    console.log('Testing chat session reuse...\n');

    const sessionId = 'test-session-1';
    const model = 'gemini-2.0-flash-lite';

    try {
        // First message - should create a new chat session
        console.log('1. Sending first message...');
        const response1 = await aiService.streamGemini(
            'Hello! My name is Alice.', 
            [], 
            model, 
            sessionId
        );
        
        let firstResponse = '';
        for await (const chunk of response1) {
            firstResponse += chunk.text || '';
        }
        console.log('Response:', firstResponse);
        console.log('Chat session created and stored.\n');

        // Second message - should reuse the existing chat session
        console.log('2. Sending second message...');
        const response2 = await aiService.streamGemini(
            'What is my name?', 
            [], // Note: we don't need to pass history anymore!
            model, 
            sessionId
        );
        
        let secondResponse = '';
        for await (const chunk of response2) {
            secondResponse += chunk.text || '';
        }
        console.log('Response:', secondResponse);
        console.log('Chat session reused successfully!\n');

        // Check conversation history
        console.log('3. Getting conversation history...');
        const history = aiService.getConversationHistory(sessionId);
        console.log('History length:', history.length);
        console.log('History:', JSON.stringify(history, null, 2));

        // Clear the conversation
        console.log('\n4. Clearing conversation...');
        aiService.clearConversation(sessionId);
        console.log('Conversation cleared.');

        // Verify it's cleared
        const clearedHistory = aiService.getConversationHistory(sessionId);
        console.log('History after clearing:', clearedHistory.length);

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testChatSessionReuse(); 