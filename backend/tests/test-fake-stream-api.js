#!/usr/bin/env node

/**
 * Test script for the fake Gemini streaming API endpoint
 * This tests the full HTTP streaming flow with fake data
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001';

async function testFakeStreamAPI() {
    console.log('🧪 Testing Fake Gemini Stream API...\n');

    const testData = {
        message: "Hello, can you help me debug streaming issues?",
        model: "gemini-1.5-flash",
        conversationHistory: [],
        sessionId: "test-session-123",
        files: [],
        useFakeStream: true  // This enables the fake streaming
    };

    try {
        console.log('📝 Test Parameters:');
        console.log(`   Message: "${testData.message}"`);
        console.log(`   Model: ${testData.model}`);
        console.log(`   Session ID: ${testData.sessionId}`);
        console.log(`   Use Fake Stream: ${testData.useFakeStream}\n`);

        console.log('📡 Making request to /api/chat/stream...\n');

        const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('✅ Response received, processing stream...\n');

        let totalContent = '';
        let chunkCount = 0;
        let isDone = false;

        // Process the Server-Sent Events stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (!isDone) {
            const { done, value } = await reader.read();
            
            if (done) {
                console.log('\n📡 Stream ended');
                break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        
                        if (data.done) {
                            console.log('\n✅ Stream completed!');
                            console.log(`📊 Provider: ${data.provider}`);
                            console.log(`🤖 Model: ${data.model}`);
                            isDone = true;
                            break;
                        }
                        
                        if (data.error) {
                            console.error('❌ Stream error:', data.error);
                            isDone = true;
                            break;
                        }
                        
                        if (data.content) {
                            chunkCount++;
                            totalContent += data.content;
                            console.log(`📦 Chunk ${chunkCount}: "${data.content}"`);
                        }
                    } catch (parseError) {
                        console.warn('⚠️  Failed to parse chunk:', line);
                    }
                }
            }
        }

        console.log(`\n📊 Total chunks received: ${chunkCount}`);
        console.log(`📝 Total content length: ${totalContent.length} characters`);
        console.log('\n📄 Complete response:');
        console.log('─'.repeat(50));
        console.log(totalContent);
        console.log('─'.repeat(50));

    } catch (error) {
        console.error('❌ Error during API test:', error);
    }
}

// Check if server is running
async function checkServer() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/test`);
        if (response.ok) {
            console.log('✅ Server is running');
            return true;
        }
    } catch (error) {
        console.log('❌ Server is not running. Please start the server first:');
        console.log('   cd backend && npm start');
        return false;
    }
}

// Run the test
async function main() {
    console.log('🔍 Checking if server is running...');
    const serverRunning = await checkServer();
    
    if (serverRunning) {
        await testFakeStreamAPI();
    }
    
    console.log('\n🏁 Test completed');
    process.exit(0);
}

main().catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
});
