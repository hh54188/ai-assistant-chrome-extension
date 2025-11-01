import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Gemini client
const genAI = new GoogleGenAI({
    vertexai: false,
    apiKey: process.env.GEMINI_API_KEY
});

console.log("Gemini API Key value: ", process.env.GEMINI_API_KEY);

async function testGeminiTokenCounting() {
    console.log('🧮 Testing Gemini Token Counting...\n');

    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY not found in environment variables');
        console.log('Please add GEMINI_API_KEY to your .env file');
        return;
    }

    try {
        // Create a simple chat
        const chat = genAI.chats.create({
            model: 'gemini-2.0-flash-lite'
        });

        const message = "Hello! Please tell me a short joke about programming.";
        console.log(`📤 Sending message: "${message}"`);

        // Send message and get streaming response
        const response = await chat.sendMessageStream({ 
            message: message
        });

        let responseText = '';
        let tokenInfo = null;

        // Process the streaming response
        for await (const chunk of response) {
            // Collect the response text
            if (chunk.text) {
                responseText += chunk.text;
            }

            // Check for token usage metadata
            if (chunk.usageMetadata) {
                tokenInfo = chunk.usageMetadata;
                console.log('\n📊 Token Usage Found!');
                console.log('   Input tokens:', tokenInfo.promptTokenCount);
                console.log('   Output tokens:', tokenInfo.candidatesTokenCount);
                console.log('   Total tokens:', tokenInfo.totalTokenCount);
            }
        }

        console.log('\n🤖 AI Response:');
        console.log(responseText);

        if (tokenInfo) {
            console.log('\n✅ Token counting successful!');
            console.log(`   Total conversation tokens: ${tokenInfo.totalTokenCount}`);
        } else {
            console.log('\n⚠️  No token metadata found in response');
            console.log('   This might happen with some Gemini models or configurations');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.message.includes('API_KEY')) {
            console.log('   Please check your GEMINI_API_KEY in .env file');
        }
    }
}

// Run the test
testGeminiTokenCounting();
