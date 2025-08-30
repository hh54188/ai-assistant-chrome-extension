import aiService from '../services/aiService.js';

async function testMCPIntegration() {
    console.log('Testing MCP Integration with AI Service...\n');

    try {
        // Wait a bit for MCP client to initialize and server to start
        console.log('Waiting for MCP client to initialize and server to start...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check available MCP tools
        console.log('Available MCP tools:');
        const tools = aiService.getMCPTools();
        console.log(tools);

        return;

        // Test executing a tool directly
        console.log('\nTesting direct tool execution...');
        try {
            const result = await aiService.executeMCPTool('check-creator', {});
            console.log('Tool result:', result);
        } catch (error) {
            console.error('Tool execution failed:', error.message);
        }


        // Test Gemini with MCP tools
        console.log('\nTesting Gemini with MCP tools...');
        const message = "Who created this project? Can you check using the available tools?";
        
        try {
            const response = await aiService.streamGeminiWithTools(message, [], 'gemini-2.0-flash-lite');
            console.log('Response with tools:', response);
        } catch (error) {
            console.error('Gemini with tools failed:', error.message);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testMCPIntegration().catch(console.error);
