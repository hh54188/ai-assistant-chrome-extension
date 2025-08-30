import aiService from '../services/aiService.js';

async function testWebPageSummaryForFirecrawlMCP() {
    console.log('Testing Web Page Summary for Firecrawl MCP Tool...\n');

    try {
        // Wait a bit for MCP client to initialize and server to start
        console.log('Waiting for MCP client to initialize and server to start...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check available MCP tools
        console.log('Available MCP tools:');
        const tools = aiService.getMCPTools();
        console.log(tools);

        // Test the web page summary tool with basic parameters
        console.log('\nTesting web page summary tool with basic parameters...');
        try {
            const result = await aiService.executeMCPTool('summarize-web-page', {
                url: "https://example.com"
            });
            console.log('Basic summary tool result:', result);
        } catch (error) {
            console.error('Basic summary tool execution failed:', error.message);
        }

        return;

        // Test with a real URL (if API keys are available)
        console.log('\nTesting web page summary tool with real URL...');
        try {
            const result = await aiService.executeMCPTool('summarize-web-page', {
                url: "https://www.example.com"
            });
            console.log('Real URL summary result:', result);
        } catch (error) {
            console.error('Real URL summary test failed:', error.message);
        }

        // Test with missing parameters
        console.log('\nTesting web page summary tool with missing URL...');
        try {
            const result = await aiService.executeMCPTool('summarize-web-page', {});
            console.log('Missing URL result:', result);
        } catch (error) {
            console.error('Missing URL test failed:', error.message);
        }

        // Test with invalid URL format
        console.log('\nTesting web page summary tool with invalid URL...');
        try {
            const result = await aiService.executeMCPTool('summarize-web-page', {
                url: "not-a-valid-url"
            });
            console.log('Invalid URL result:', result);
        } catch (error) {
            console.error('Invalid URL test failed:', error.message);
        }

        // Test with extra parameters (should be ignored or cause error)
        console.log('\nTesting web page summary tool with extra parameters...');
        try {
            const result = await aiService.executeMCPTool('summarize-web-page', {
                url: "https://example.com",
                extraParam: "should-be-ignored"
            });
            console.log('Extra parameters result:', result);
        } catch (error) {
            console.error('Extra parameters test failed:', error.message);
        }

        // Test with empty parameters object
        console.log('\nTesting web page summary tool with empty parameters...');
        try {
            const result = await aiService.executeMCPTool('summarize-web-page', {});
            console.log('Empty parameters result:', result);
        } catch (error) {
            console.error('Empty parameters test failed:', error.message);
        }

        // Test with null parameters
        console.log('\nTesting web page summary tool with null parameters...');
        try {
            const result = await aiService.executeMCPTool('summarize-web-page', null);
            console.log('Null parameters result:', result);
        } catch (error) {
            console.error('Null parameters test failed:', error.message);
        }

        // Test the tool through AI service with Gemini
        console.log('\nTesting web page summary tool through Gemini AI service...');
        const message = "Can you summarize the web page at https://example.com?";
        
        try {
            const response = await aiService.streamGeminiWithTools(message, [], 'gemini-2.0-flash-lite');
            console.log('Gemini with web page summary tool response:', response);
        } catch (error) {
            console.error('Gemini with web page summary tool failed:', error.message);
        }

        // Test the tool through AI service with OpenAI
        console.log('\nTesting web page summary tool through OpenAI AI service...');
        const openaiMessage = "Please summarize the content at https://example.com";
        
        try {
            const response = await aiService.streamOpenAIWithTools(openaiMessage, [], 'gpt-4o-mini');
            console.log('OpenAI with web page summary tool response:', response);
        } catch (error) {
            console.error('OpenAI with web page summary tool failed:', error.message);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testWebPageSummaryForFirecrawlMCP().catch(console.error);
