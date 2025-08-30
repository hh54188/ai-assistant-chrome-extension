import aiService from '../services/aiService.js';

async function testNewArticleCorrectionMCP() {
    console.log('Testing New Article Correction MCP Tool...\n');

    try {
        // Wait a bit for MCP client to initialize and server to start
        console.log('Waiting for MCP client to initialize and server to start...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check available MCP tools
        console.log('Available MCP tools:');
        const tools = aiService.getMCPTools();
        console.log(tools);

        // Test the new article correction tool directly
        console.log('\nTesting article correction tool execution...');
        try {
            const result = await aiService.executeMCPTool('review-notion-article', {
                aiProvider: 'gemini',
                notionArticleId: '2270cda410a68005b731fec98ea8500a'
            });
            console.log('Article correction tool result:', result);
        } catch (error) {
            console.error('Article correction tool execution failed:', error.message);
        }

        return;

        // Test with OpenAI provider
        console.log('\nTesting article correction with OpenAI...');
        try {
            const result = await aiService.executeMCPTool('review-notion-article', {
                aiProvider: 'openai',
                notionArticleId: '2270cda410a680b4874cced337e00703'
            });
            console.log('OpenAI article correction result:', result);
        } catch (error) {
            console.error('OpenAI article correction failed:', error.message);
        }

        // Test with invalid parameters
        console.log('\nTesting article correction with invalid parameters...');
        try {
            const result = await aiService.executeMCPTool('review-notion-article', {
                aiProvider: 'invalid-provider',
                notionArticleId: '2270cda410a680b4874cced337e00703'
            });
            console.log('Invalid provider result:', result);
        } catch (error) {
            console.error('Invalid provider test failed:', error.message);
        }

        // Test with missing parameters
        console.log('\nTesting article correction with missing parameters...');
        try {
            const result = await aiService.executeMCPTool('review-notion-article', {
                aiProvider: 'gemini'
                // Missing notionArticleId
            });
            console.log('Missing parameter result:', result);
        } catch (error) {
            console.error('Missing parameter test failed:', error.message);
        }

        // Test Gemini with the new MCP tool
        console.log('\nTesting Gemini with article correction tool...');
        const message = "Can you review and correct the Notion article with ID '2270cda410a680b4874cced337e00703' using Gemini?";
        
        try {
            const response = await aiService.streamGeminiWithTools(message, [], 'gemini-2.0-flash-lite');
            console.log('Gemini with article correction tool response:', response);
        } catch (error) {
            console.error('Gemini with article correction tool failed:', error.message);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testNewArticleCorrectionMCP().catch(console.error);
