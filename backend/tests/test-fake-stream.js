#!/usr/bin/env node

/**
 * Test script for the fake Gemini streaming method
 * This helps debug streaming response issues without making real API calls
 */

import aiService from './services/aiService.js';

async function testFakeStream() {
    console.log('🧪 Testing Fake Gemini Stream...\n');

    const testMessage = "Hello, can you help me debug streaming issues?";
    const testModel = "gemini-1.5-flash";
    const testSessionId = "test-session-123";
    const testFiles = [];
    const useMCPTools = false;

    try {
        console.log('📝 Test Parameters:');
        console.log(`   Message: "${testMessage}"`);
        console.log(`   Model: ${testModel}`);
        console.log(`   Session ID: ${testSessionId}`);
        console.log(`   Files: ${testFiles.length}`);
        console.log(`   MCP Tools: ${useMCPTools}\n`);

        // Get the fake stream
        const stream = await aiService.streamGeminiFake(
            testMessage,
            [],
            testModel,
            testSessionId,
            testFiles,
            useMCPTools
        );

        console.log('📡 Starting to process stream chunks...\n');

        let totalContent = '';
        let chunkCount = 0;

        // Process the stream chunk by chunk (same as the real implementation)
        for await (const chunk of stream) {
            chunkCount++;
            const content = chunk.text || '';
            
            if (content) {
                totalContent += content;
                console.log(`📦 Chunk ${chunkCount}: "${content.trim()}"`);
                
                // Simulate the same delay as in real streaming
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            // Check for tool calls
            if (chunk.toolCall) {
                console.log(`🔧 Tool Call: ${chunk.toolCall.name}`);
                console.log(`   Parameters:`, chunk.toolCall.parameters);
            }
        }

        console.log('\n✅ Stream completed successfully!');
        console.log(`📊 Total chunks processed: ${chunkCount}`);
        console.log(`📝 Total content length: ${totalContent.length} characters`);
        console.log('\n📄 Complete response:');
        console.log('─'.repeat(50));
        console.log(totalContent);
        console.log('─'.repeat(50));

    } catch (error) {
        console.error('❌ Error during fake stream test:', error);
    }
}

// Run the test
testFakeStream().then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
});
