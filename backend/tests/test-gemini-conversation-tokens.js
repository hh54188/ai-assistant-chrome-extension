import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Gemini client
const genAI = new GoogleGenAI({
    vertexai: false,
    apiKey: process.env.GEMINI_API_KEY
});

async function testConversationTokenTracking() {
    console.log('🔄 Testing Gemini Conversation Token Tracking...\n');

    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY not found in environment variables');
        return;
    }

    try {
        // Create a chat session that will maintain conversation history
        const chat = genAI.chats.create({
            model: 'gemini-2.0-flash-lite'
        });

        const conversation = [
            "Hi! I'm learning about AI. Can you explain what machine learning is in simple terms?",
            "That's interesting! How does it differ from traditional programming?",
            "Can you give me a practical example of machine learning?"
        ];

        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        let totalTokens = 0;

        console.log('💬 Starting conversation...\n');

        for (let i = 0; i < conversation.length; i++) {
            const message = conversation[i];
            console.log(`📤 Message ${i + 1}: "${message}"`);

            // Send message and get streaming response
            const response = await chat.sendMessageStream({ 
                message: message
            });

            let responseText = '';
            let messageTokens = null;

            // Process the streaming response
            for await (const chunk of response) {
                if (chunk.text) {
                    responseText += chunk.text;
                }

                // Capture token usage for this message
                if (chunk.usageMetadata) {
                    messageTokens = chunk.usageMetadata;
                }
            }

            // Display response and token info
            console.log(`🤖 Response ${i + 1}: ${responseText.substring(0, 100)}...`);
            
            if (messageTokens) {
                const inputTokens = messageTokens.promptTokenCount || 0;
                const outputTokens = messageTokens.candidatesTokenCount || 0;
                const messageTotal = messageTokens.totalTokenCount || 0;

                totalInputTokens += inputTokens;
                totalOutputTokens += outputTokens;
                totalTokens += messageTotal;

                console.log(`📊 Message ${i + 1} tokens:`);
                console.log(`   Input: ${inputTokens}, Output: ${outputTokens}, Total: ${messageTotal}`);
            } else {
                console.log(`⚠️  No token data for message ${i + 1}`);
            }

            console.log(''); // Empty line for readability
        }

        // Summary
        console.log('📈 Conversation Token Summary:');
        console.log(`   Total Input Tokens: ${totalInputTokens}`);
        console.log(`   Total Output Tokens: ${totalOutputTokens}`);
        console.log(`   Total Tokens Used: ${totalTokens}`);
        console.log(`   Messages in Conversation: ${conversation.length}`);
        console.log(`   Average Tokens per Message: ${Math.round(totalTokens / conversation.length)}`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testConversationTokenTracking();
