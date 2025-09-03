# MCP Integration with AI Service

This document explains how to use the Model Context Protocol (MCP) integration with your AI service.

## Overview

The MCP integration allows your Gemini AI client to access and use tools defined in an MCP server. This enables the AI to perform actions beyond just generating text responses.

## Components

### 1. MCP Server (`mcp-servers/index.js`)

The MCP server provides tools that can be used by AI clients:

- **check-creator**: Returns the project creator information
- **get-project-info**: Returns comprehensive project information

### 2. AI Service Integration (`services/aiService.js`)

The AI service has been enhanced with:

- **Automatic MCP server startup**: The client automatically starts the MCP server process
- **Native tool binding**: Tools are properly bound to Gemini using the `tools` parameter
- **Tool execution**: Automatic execution of tool calls from Gemini responses
- **Tool discovery**: Automatic discovery of available tools from the MCP server

## Setup and Usage

### Automatic MCP Server Management

The MCP server is now **automatically started** by the AI service when needed. You don't need to manually start it in a separate terminal.

### Using MCP Tools in Your Application

#### Basic Tool Execution

```javascript
import aiService from './services/aiService.js';

// Execute a tool directly
const result = await aiService.executeMCPTool('check-creator', {});
console.log(result);

// Get available tools
const tools = aiService.getMCPTools();
console.log(tools);
```

#### Gemini with MCP Tools

```javascript
// Stream response with MCP tools enabled (tools are automatically bound)
const stream = await aiService.streamGemini(
    "Who created this project?", 
    [], 
    'gemini-2.0-flash-lite', 
    'session-1', 
    [], 
    true  // Enable MCP tools
);

// Get complete response with tool execution
const response = await aiService.getGeminiResponseWithTools(
    "Who created this project?",
    [],
    'gemini-2.0-flash-lite'
);
```

## How It Works

1. **Automatic Initialization**: When the AI service starts, it automatically starts the MCP server process
2. **Tool Discovery**: The service discovers available tools from the MCP server
3. **Native Tool Binding**: Tools are properly bound to Gemini using the `tools` parameter instead of prompt injection
4. **Tool Execution**: Gemini can make tool calls, which are automatically executed by the service
5. **Response Enhancement**: Tool results are integrated into the response

## Testing

Run the test script to verify the integration:

```bash
cd backend
npm run test-mcp
```

## Adding New Tools

To add new tools to the MCP server:

1. **Register the tool** in `mcp-servers/index.js`:
   ```javascript
   server.registerTool("tool-name",
       {
           description: "Tool description",
           inputSchema: {
               type: "object",
               properties: {},
               required: []
           }
       },
       async (args) => ({
           content: [{ type: "text", text: "Tool result" }]
       })
   );
   ```

2. **The AI service will automatically discover and use the new tool**

## Troubleshooting

### Common Issues

1. **MCP Server Startup Failed**: Check that the `mcp-servers/index.js` file exists and is valid
2. **Tools Not Available**: Verify the MCP server has registered tools and the client has connected
3. **Tool Execution Failed**: Check the console for tool execution errors

### Debug Mode

Enable debug logging by checking the console output for:
- MCP client connection status
- Tool discovery results
- Tool execution attempts
- Tool call detection in Gemini responses

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your App      │    ┌   AI Service    │    ┌   MCP Server    │
│                 │    │                 │    │                 │
│ - Chat UI       │───▶│ - Gemini Client │───▶│ - Tool Registry │
│ - API Calls     │    │ - MCP Client    │    │ - Tool Logic    │
│                 │    │ - Auto Startup  │    │ - Auto Process  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Key Improvements

- **No Manual Server Management**: MCP server starts automatically
- **Native Tool Integration**: Uses Gemini's built-in tool binding instead of prompt injection
- **Automatic Tool Execution**: Detects and executes tool calls from Gemini responses
- **Better Error Handling**: Graceful fallback if tools are unavailable

The AI service now acts as a complete bridge between your application and both the Gemini API and MCP tools, with automatic server management and native tool integration.
