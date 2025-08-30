import aiService from '../services/aiService.js';
import fs from 'fs';

async function testFileAttachments() {
    console.log('Testing file attachment functionality with enhanced AI service...\n');

    const sessionId = 'file-test-session';
    const model = 'gemini-2.0-flash-lite';

    try {
        // // Test 1: Inline image attachment using cat.jpg
        // console.log('1. Testing inline image attachment with cat.jpg...');
        // await testInlineImage(sessionId, model);

        // Test 2: File upload and reference using cat.jpg
        console.log('\n2. Testing file upload and reference with cat.jpg...');
        await testFileUpload(sessionId, model);

        // // Test 3: Multiple files in one message
        // console.log('\n3. Testing multiple files in one message...');
        // await testMultipleFiles(sessionId, model);

        // // Clean up
        // console.log('\n4. Cleaning up...');
        // aiService.clearConversation(sessionId);
        // console.log('Test completed successfully!');

    } catch (error) {
        console.error('Test failed:', error);
    }
}

async function testInlineImage(sessionId, model) {
    try {
        // Read the cat.jpg file and convert to base64
        console.log('Reading cat.jpg file...');
        const imageBuffer = fs.readFileSync('./cat.jpg');
        const imageBase64 = imageBuffer.toString('base64');
        
        console.log('Sending message with cat image...');
        const response = await aiService.streamGemini(
            "What do you see in this image? Please describe the cat in detail.",
            [],
            model,
            sessionId,
            [{
                type: 'inline',
                data: imageBase64,
                mimeType: 'image/jpeg'
            }]
        );

        let responseText = '';
        for await (const chunk of response) {
            responseText += chunk.text || '';
        }
        
        console.log('Response:', responseText);
        
    } catch (error) {
        console.error('Inline image test failed:', error.message);
    }
}

async function testFileUpload(sessionId, model) {
    try {
        // Upload the cat.jpg file using the AI service
        console.log('Uploading cat.jpg file...');
        const uploadedFile = await aiService.uploadFile(
            './cat.jpg',
            'image/jpeg',
            'Cat Image'
        );
        
        console.log('File uploaded:', uploadedFile);
        
        // Send message with file reference
        const response = await aiService.streamGemini(
            "Analyze this uploaded cat image and tell me what you see. Describe the cat's appearance, pose, and any other details you notice.",
            [],
            model,
            sessionId,
            [{
                type: 'file',
                fileUri: uploadedFile.uri,
                mimeType: 'image/jpeg'
            }]
        );

        let responseText = '';
        for await (const chunk of response) {
            responseText += chunk.text || '';
        }
        
        console.log('================ response ==================');
        console.log('Response:', responseText);
        
        // Clean up uploaded file
        await aiService.deleteFile(uploadedFile.name);
        console.log('File cleaned up');

        const files = await aiService.listFiles();
        console.log('================ files ==================');
        console.log(files);
        
    } catch (error) {
        console.error('File upload test failed:', error.message);
    }
}

async function testMultipleFiles(sessionId, model) {
    try {
        // Read the cat.jpg file twice to simulate multiple images
        console.log('Reading cat.jpg file for multiple images test...');
        const imageBuffer = fs.readFileSync('./cat.jpg');
        const imageBase64 = imageBuffer.toString('base64');
        
        const response = await aiService.streamGemini(
            "I'm showing you the same cat image twice. Compare these two images and tell me if they are identical.",
            [],
            model,
            sessionId,
            [
                {
                    type: 'inline',
                    data: imageBase64,
                    mimeType: 'image/jpeg'
                },
                {
                    type: 'inline',
                    data: imageBase64,
                    mimeType: 'image/jpeg'
                }
            ]
        );

        let responseText = '';
        for await (const chunk of response) {
            responseText += chunk.text || '';
        }
        
        console.log('Response:', responseText);
        
    } catch (error) {
        console.error('Multiple files test failed:', error.message);
    }
}

// Test conversation history with files
async function testConversationWithFiles() {
    console.log('\n=== Testing Conversation History with Files ===\n');
    
    const sessionId = 'conversation-file-test';
    const model = 'gemini-2.0-flash-lite';

    try {
        // First message with cat image
        console.log('1. Sending first message with cat image...');
        const imageBuffer = fs.readFileSync('./cat.jpg');
        const imageBase64 = imageBuffer.toString('base64');
        
        const response1 = await aiService.streamGemini(
            "This is a photo of a cat. What do you see?",
            [],
            model,
            sessionId,
            [{
                type: 'inline',
                data: imageBase64,
                mimeType: 'image/jpeg'
            }]
        );

        let firstResponse = '';
        for await (const chunk of response1) {
            firstResponse += chunk.text || '';
        }
        console.log('First response:', firstResponse);

        // Second message (text only) - should reference the previous cat image
        console.log('\n2. Sending follow-up text message...');
        const response2 = await aiService.streamGemini(
            "Can you describe the cat I just showed you in more detail? What color is it, what pose is it in, and what's the setting?",
            [],
            model,
            sessionId,
            [] // No new files
        );

        let secondResponse = '';
        for await (const chunk of response2) {
            secondResponse += chunk.text || '';
        }
        console.log('Second response:', secondResponse);

        // Third message asking about the cat's behavior
        console.log('\n3. Sending third message about cat behavior...');
        const response3 = await aiService.streamGemini(
            "Based on the cat's appearance and pose in the image, what do you think this cat might be like? Is it friendly, playful, or something else?",
            [],
            model,
            sessionId,
            [] // No new files
        );

        let thirdResponse = '';
        for await (const chunk of response3) {
            thirdResponse += chunk.text || '';
        }
        console.log('Third response:', thirdResponse);

        // Check conversation history
        console.log('\n4. Getting conversation history...');
        const history = aiService.getConversationHistory(sessionId);
        console.log('History length:', history.length);
        console.log('History:', JSON.stringify(history, null, 2));

        // Clean up
        aiService.clearConversation(sessionId);
        console.log('\nConversation cleared.');

    } catch (error) {
        console.error('Conversation test failed:', error.message);
    }
}

// Test image analysis with specific questions
async function testImageAnalysis() {
    console.log('\n=== Testing Detailed Image Analysis ===\n');
    
    const sessionId = 'analysis-test';
    const model = 'gemini-2.0-flash-lite';

    try {
        // Read the cat image
        console.log('Reading cat.jpg for detailed analysis...');
        const imageBuffer = fs.readFileSync('./cat.jpg');
        const imageBase64 = imageBuffer.toString('base64');
        
        // Ask specific questions about the cat
        const questions = [
            "What breed of cat is this?",
            "What color is the cat's fur?",
            "What is the cat doing in this image?",
            "What's the background or setting of this photo?",
            "Does the cat look healthy and well-cared for?"
        ];

        for (let i = 0; i < questions.length; i++) {
            console.log(`\n${i + 1}. ${questions[i]}`);
            
            const response = await aiService.streamGemini(
                questions[i],
                [],
                model,
                sessionId,
                [{
                    type: 'inline',
                    data: imageBase64,
                    mimeType: 'image/jpeg'
                }]
            );

            let responseText = '';
            for await (const chunk of response) {
                responseText += chunk.text || '';
            }
            
            console.log('Answer:', responseText);
        }

        // Clean up
        aiService.clearConversation(sessionId);
        console.log('\nAnalysis test completed.');

    } catch (error) {
        console.error('Image analysis test failed:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('Starting file attachment tests with cat.jpg...\n');
    
    // Test basic file attachment functionality
    await testFileAttachments();
    
    // Test conversation history with files
    // await testConversationWithFiles();
    
    // Test detailed image analysis
    // await testImageAnalysis();
    
    console.log('\nAll tests completed!');
}

// Run the tests
runAllTests();