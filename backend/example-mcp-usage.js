import aiService from './services/aiService.js';

async function demonstrateMCPUsage() {
    console.log('=== MCP Integration Demo ===\n');

    try {
        // Wait for MCP client to initialize
        console.log('Initializing MCP client...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Show available tools
        console.log('Available MCP tools:');
        const tools = aiService.getMCPTools();
        tools.forEach(tool => {
            console.log(`- ${tool.name}: ${tool.description}`);
        });

        console.log('\n=== Testing Tool Execution ===');
        
        // Test direct tool execution
        const creatorResult = await aiService.executeMCPTool('check-creator', {});
        console.log('Creator tool result:', creatorResult);

        const projectInfo = await aiService.executeMCPTool('get-project-info', {});
        console.log('Project info tool result:', projectInfo);

        console.log('\n=== Testing Gemini with Tools ===');
        
        // Test Gemini with tools enabled
        const message = "Who created this project and what technologies does it use?";
        
        console.log('User message:', message);
        console.log('Gemini response with tools:');
        
        const stream = await aiService.streamGemini(
            message, 
            [], 
            'gemini-2.0-flash-lite', 
            'demo-session', 
            [], 
            true  // Enable MCP tools
        );
        
        // Collect the streaming response
        let fullResponse = '';
        for await (const chunk of stream) {
            if (chunk.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
                const text = chunk.response.candidates[0].content.parts[0].text;
                process.stdout.write(text);
                fullResponse += text;
            }
        }
        
        console.log('\n\n=== Response Analysis ===');
        console.log('Full response length:', fullResponse.length);
        
        // Check if the response contains tool calls
        if (fullResponse.includes('functionCall') || fullResponse.includes('tool')) {
            console.log('✅ Gemini successfully used the available tools!');
        } else {
            console.log('ℹ️  Gemini provided a response without tool calls');
        }

    } catch (error) {
        console.error('Demo failed:', error);
    }
}

// Run the demo
demonstrateMCPUsage().catch(console.error);
