import aiService from '../services/aiService.js';

async function testOpenAICostMCP() {
    console.log('Testing OpenAI Cost MCP Tool...\n');

    try {
        // Wait a bit for MCP client to initialize and server to start
        console.log('Waiting for MCP client to initialize and server to start...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check available MCP tools
        console.log('Available MCP tools:');
        const tools = aiService.getMCPTools();
        console.log(tools);

        // Test the OpenAI cost tool with monthly period (default)
        console.log('\nTesting OpenAI cost tool with monthly period (default)...');
        try {
            const result = await aiService.executeMCPTool('get-openai-costs', {});
            console.log('Monthly cost tool result:', result);
        } catch (error) {
            console.error('Monthly cost tool execution failed:', error.message);
        }

        return;

        // Test with explicit monthly period
        console.log('\nTesting OpenAI cost tool with explicit monthly period...');
        try {
            const result = await aiService.executeMCPTool('get-openai-costs', {
                period: 'month'
            });
            console.log('Explicit monthly cost result:', result);
        } catch (error) {
            console.error('Explicit monthly cost test failed:', error.message);
        }

        // Test with weekly period
        console.log('\nTesting OpenAI cost tool with weekly period...');
        try {
            const result = await aiService.executeMCPTool('get-openai-costs', {
                period: 'week'
            });
            console.log('Weekly cost result:', result);
        } catch (error) {
            console.error('Weekly cost test failed:', error.message);
        }

        // Test with yearly period
        console.log('\nTesting OpenAI cost tool with yearly period...');
        try {
            const result = await aiService.executeMCPTool('get-openai-costs', {
                period: 'year'
            });
            console.log('Yearly cost result:', result);
        } catch (error) {
            console.error('Yearly cost test failed:', error.message);
        }

        // Test with invalid period
        console.log('\nTesting OpenAI cost tool with invalid period...');
        try {
            const result = await aiService.executeMCPTool('get-openai-costs', {
                period: 'invalid-period'
            });
            console.log('Invalid period result:', result);
        } catch (error) {
            console.error('Invalid period test failed:', error.message);
        }

        // Test with extra parameters (should be ignored or cause error)
        console.log('\nTesting OpenAI cost tool with extra parameters...');
        try {
            const result = await aiService.executeMCPTool('get-openai-costs', {
                period: 'month',
                extraParam: 'should-be-ignored'
            });
            console.log('Extra parameters result:', result);
        } catch (error) {
            console.error('Extra parameters test failed:', error.message);
        }

        // Test with empty parameters object
        console.log('\nTesting OpenAI cost tool with empty parameters...');
        try {
            const result = await aiService.executeMCPTool('get-openai-costs', {});
            console.log('Empty parameters result:', result);
        } catch (error) {
            console.error('Empty parameters test failed:', error.message);
        }

        // Test with null parameters
        console.log('\nTesting OpenAI cost tool with null parameters...');
        try {
            const result = await aiService.executeMCPTool('get-openai-costs', null);
            console.log('Null parameters result:', result);
        } catch (error) {
            console.error('Null parameters test failed:', error.message);
        }

        // Test the tool through AI service with Gemini
        console.log('\nTesting OpenAI cost tool through Gemini AI service...');
        const message = "Can you get the OpenAI costs for this month?";
        
        try {
            const response = await aiService.streamGeminiWithTools(message, [], 'gemini-2.0-flash-lite');
            console.log('Gemini with OpenAI cost tool response:', response);
        } catch (error) {
            console.error('Gemini with OpenAI cost tool failed:', error.message);
        }

        // Test the tool through AI service with OpenAI
        console.log('\nTesting OpenAI cost tool through OpenAI AI service...');
        const openaiMessage = "What are the OpenAI costs for this week?";
        
        try {
            const response = await aiService.streamOpenAIWithTools(openaiMessage, [], 'gpt-4o-mini');
            console.log('OpenAI with OpenAI cost tool response:', response);
        } catch (error) {
            console.error('OpenAI with OpenAI cost tool failed:', error.message);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testOpenAICostMCP().catch(console.error);
