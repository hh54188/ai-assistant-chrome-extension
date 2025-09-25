#!/usr/bin/env node

/**
 * Example usage of the fake stream method
 * This shows different ways to use the fake streaming for debugging
 */

import aiService from './services/aiService.js';

async function example1_BasicUsage() {
    console.log('📝 Example 1: Basic Fake Stream Usage\n');
    
    const stream = await aiService.streamGeminiFake(
        "What is the capital of France?",
        [],
        "gemini-1.5-flash",
        "example-session-1"
    );

    console.log('Streaming response:');
    for await (const chunk of stream) {
        process.stdout.write(chunk.text);
    }
    console.log('\n');
}

async function example2_WithConversationHistory() {
    console.log('📝 Example 2: With Conversation History\n');
    
    const conversationHistory = [
        { role: 'user', content: 'Hello, I need help with JavaScript.' },
        { role: 'assistant', content: 'I\'d be happy to help you with JavaScript! What specific topic would you like to know about?' }
    ];

    const stream = await aiService.streamGeminiFake(
        "Can you explain closures?",
        conversationHistory,
        "gemini-1.5-flash",
        "example-session-2"
    );

    console.log('Streaming response with context:');
    for await (const chunk of stream) {
        process.stdout.write(chunk.text);
    }
    console.log('\n');
}

async function example3_WithMCPTools() {
    console.log('📝 Example 3: With MCP Tools Enabled\n');
    
    const stream = await aiService.streamGeminiFake(
        "Can you help me with a task?",
        [],
        "gemini-1.5-flash",
        "example-session-3",
        [],
        true // Enable MCP tools simulation
    );

    console.log('Streaming response with potential tool calls:');
    for await (const chunk of stream) {
        if (chunk.toolCall) {
            console.log(`\n🔧 Tool Call: ${chunk.toolCall.name}`);
            console.log(`   Parameters:`, chunk.toolCall.parameters);
        } else {
            process.stdout.write(chunk.text);
        }
    }
    console.log('\n');
}

async function example4_ErrorHandling() {
    console.log('📝 Example 4: Error Handling\n');
    
    try {
        const stream = await aiService.streamGeminiFake(
            "This is a test message",
            [],
            "gemini-1.5-flash",
            "example-session-4"
        );

        console.log('Streaming response:');
        for await (const chunk of stream) {
            process.stdout.write(chunk.text);
        }
        console.log('\n');
    } catch (error) {
        console.error('Error occurred:', error.message);
    }
}

async function example5_ChunkAnalysis() {
    console.log('📝 Example 5: Detailed Chunk Analysis\n');
    
    const stream = await aiService.streamGeminiFake(
        "Analyze this streaming response in detail.",
        [],
        "gemini-1.5-flash",
        "example-session-5"
    );

    let chunkCount = 0;
    let totalLength = 0;
    const chunks = [];

    console.log('Detailed chunk analysis:');
    console.log('─'.repeat(60));
    
    for await (const chunk of stream) {
        chunkCount++;
        totalLength += chunk.text.length;
        chunks.push({
            index: chunk.chunkIndex,
            text: chunk.text.trim(),
            length: chunk.text.length,
            timestamp: chunk.timestamp
        });
        
        console.log(`Chunk ${chunkCount}: "${chunk.text.trim()}" (${chunk.text.length} chars)`);
    }

    console.log('─'.repeat(60));
    console.log(`Total chunks: ${chunkCount}`);
    console.log(`Total length: ${totalLength} characters`);
    console.log(`Average chunk size: ${Math.round(totalLength / chunkCount)} characters`);
    console.log(`First chunk: "${chunks[0]?.text}"`);
    console.log(`Last chunk: "${chunks[chunks.length - 1]?.text}"`);
    console.log();
}

async function runAllExamples() {
    console.log('🚀 Running Fake Stream Examples\n');
    console.log('='.repeat(60));
    
    await example1_BasicUsage();
    console.log('='.repeat(60));
    
    await example2_WithConversationHistory();
    console.log('='.repeat(60));
    
    await example3_WithMCPTools();
    console.log('='.repeat(60));
    
    await example4_ErrorHandling();
    console.log('='.repeat(60));
    
    await example5_ChunkAnalysis();
    console.log('='.repeat(60));
    
    console.log('✅ All examples completed!');
}

// Run all examples
runAllExamples().catch(error => {
    console.error('💥 Examples failed:', error);
    process.exit(1);
});
