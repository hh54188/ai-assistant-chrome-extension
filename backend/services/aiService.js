import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: config.openai.apiKey
});

// Initialize Gemini client
const genAI = new GoogleGenAI({
    vertexai: false,
    apiKey: config.gemini.apiKey
});

class AIService {
    constructor() {
        this.openai = openai;
        this.genAI = genAI;
        this.chatSessions = new Map(); // Store chat sessions by conversation ID
        this.mcpClient = null;
        this.mcpTools = [];
        this.initializeMCPClient();
    }

    /**
     * Initialize MCP client connection
     */
    async initializeMCPClient() {
        try {
            // Create MCP client transport with the server command
            const transport = new StdioClientTransport({
                command: "node",
                args: [path.join(process.cwd(), "mcp-servers", "index.js")]
            });
            
            // Create MCP client
            this.mcpClient = new Client({
                name: "ai-service-client",
                version: "1.0.0"
            });

            // Connect to the MCP server
            await this.mcpClient.connect(transport);
            
            // Get available tools from the server
            await this.refreshMCPTools();
            
            console.log('MCP client connected successfully');
        } catch (error) {
            console.error('Failed to initialize MCP client:', error);
            this.mcpClient = null;
        }
    }

    /**
     * Refresh available MCP tools
     */
    async refreshMCPTools() {
        if (!this.mcpClient) return;
        
        try {
            // Get tools from the MCP server
            const tools = await this.mcpClient.listTools();
            this.mcpTools = tools.tools || [];
            console.log(`Loaded ${this.mcpTools.length} MCP tools`);
        } catch (error) {
            console.error('Failed to refresh MCP tools:', error);
        }
    }

    /**
     * Execute an MCP tool
     */
    async executeMCPTool(toolName, arguments_ = {}) {
        if (!this.mcpClient) {
            throw new Error('MCP client not initialized');
        }

        console.log(`Executing MCP tool ${toolName} with arguments:`, arguments_);
        try {
            const result = await this.mcpClient.callTool({
                name: toolName,
                arguments: arguments_
            });
            return result;
        } catch (error) {
            console.error(`Failed to execute MCP tool ${toolName}:`, error);
            throw error;
        }
    }

    /**
     * Get available MCP tools
     */
    getMCPTools() {
        return this.mcpTools;
    }

    /**
     * Process Gemini response and execute any tool calls
     */
    async processGeminiResponseWithTools(response, message) {
        if (!this.mcpClient || !response) return response;

        try {
            // Check if the response contains tool calls
            const candidates = response.response?.candidates?.[0];
            if (candidates?.content?.parts) {
                for (const part of candidates.content.parts) {
                    if (part.functionCall) {
                        // Execute the tool call
                        const toolName = part.functionCall.name;
                        const toolArgs = part.functionCall.args || {};
                        
                        console.log(`Executing tool: ${toolName} with args:`, toolArgs);
                        
                        try {
                            const toolResult = await this.executeMCPTool(toolName, toolArgs);
                            
                            // Return both the original response and tool result
                            return {
                                originalResponse: response,
                                toolResult: toolResult,
                                toolName: toolName,
                                toolArgs: toolArgs,
                                enhancedResponse: `Tool execution result for ${toolName}: ${JSON.stringify(toolResult, null, 2)}`
                            };
                        } catch (toolError) {
                            console.error(`Failed to execute tool ${toolName}:`, toolError);
                            return {
                                originalResponse: response,
                                toolError: toolError.message,
                                toolName: toolName
                            };
                        }
                    }
                }
            }
            
            // Fallback: check if the response text suggests using tools
            const responseText = candidates?.content?.parts?.[0]?.text || '';
            if (responseText.includes('check-creator') || responseText.includes('tool')) {
                // Execute the check-creator tool as an example
                const toolResult = await this.executeMCPTool('check-creator', {});
                
                return {
                    originalResponse: response,
                    toolResult: toolResult,
                    enhancedResponse: `${responseText}\n\nTool execution result: ${JSON.stringify(toolResult, null, 2)}`
                };
            }
            
            return response;
        } catch (error) {
            console.error('Error processing response with tools:', error);
            return response;
        }
    }

    /**
     * Get Gemini response with MCP tools integration
     */
    async *streamGeminiWithTools(message, conversationHistory = [], model = config.gemini.model, sessionId = 'default', files = []) {
        try {
            // First get the streaming response
            const stream = await this.streamGemini(message, conversationHistory, model, sessionId, files, true);

            let fullResponse = '';
            let functionCalls = [];

            // Process the streaming response chunks to collect function calls and text
            for await (const chunk of stream) {
                // Handle text chunks
                if (chunk.text) {
                    yield chunk;
                    fullResponse += chunk.text;
                }
                
                // Handle function call chunks
                if (chunk.functionCalls && chunk.functionCalls.length > 0) {
                    functionCalls.push(...chunk.functionCalls);
                }
            }

            // If we have function calls, execute them and stream the rephrased response
            if (functionCalls.length > 0) {
                const results = [];
                
                for (const functionCall of functionCalls) {
                    try {
                        console.log(`Executing function: ${functionCall.name} with args:`, functionCall.args);
                        const result = await this.executeMCPTool(functionCall.name, functionCall.args || {});
                        results.push({
                            functionName: functionCall.name,
                            args: functionCall.args,
                            result: result
                        });
                    } catch (error) {
                        console.error(`Failed to execute function ${functionCall.name}:`, error);
                        results.push({
                            functionName: functionCall.name,
                            args: functionCall.args,
                            error: error.message
                        });
                    }
                }
                
                // Send the function execution results back to Gemini for rephrasing
                const resultsMessage = `I have executed the following functions and here are the results:\n\n${results.map(r => 
                    r.error ? 
                        `❌ ${r.functionName}: ${r.error}` : 
                        `✅ ${r.functionName}: ${JSON.stringify(r.result, null, 2)}`
                ).join('\n')}\n\nPlease rephrase these results and answer the user's question in a user-friendly way. Hide the tool execution details from the user.`;
                
                try {
                    // Get Gemini's rephrased response and stream it
                    const rephrasedStream = await this.streamGemini(resultsMessage, [], model, sessionId, [], false);
                    
                    for await (const chunk of rephrasedStream) {
                        if (chunk.text) {
                            yield chunk;
                        }
                    }
                } catch (rephrasingError) {
                    console.error('Error getting rephrased response from Gemini:', rephrasingError);
                    // Fallback to original enhanced response if rephrasing fails
                    const fallbackText = `\n\nFunction execution results:\n${results.map(r => 
                        r.error ? 
                            `❌ ${r.functionName}: ${r.error}` : 
                            `✅ ${r.functionName}: ${JSON.stringify(r.result, null, 2)}`
                    ).join('\n')}`;
                    
                    yield { text: fallbackText };
                }
            }        
        } catch (error) {
            console.error('Error getting Gemini response with tools:', error);
            throw error;
        }
    }

    /**
     * Stream response from OpenAI
     */
    async streamOpenAI(message, conversationHistory = [], model = config.openai.model) {
        try {
            const messages = [
                {
                    role: 'system',
                    content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.'
                },
                ...conversationHistory,
                { role: 'user', content: message }
            ];

            const stream = await this.openai.chat.completions.create({
                model: model,
                messages,
                max_tokens: config.openai.maxTokens,
                temperature: config.openai.temperature,
                stream: true,
            }, { responseType: "stream" });

            return stream;
        } catch (error) {
            console.error('OpenAI streaming error:', error);
            throw error;
        }
    }

    /**
     * Stream response from Gemini with chat session reuse, optional file support, and MCP tools
     */
    async streamGemini(message, conversationHistory = [], model = config.gemini.model, sessionId = 'default', files = [], useMCPTools = true) {
        try {
            let chat = this.chatSessions.get(sessionId);

            // If no existing chat session or conversation history has changed, create a new one
            if (!chat || conversationHistory.length === 0) {
                // Convert conversation history to Gemini's Content format
                const history = conversationHistory.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                }));

                // Create a new chat session with history
                chat = this.genAI.chats.create({
                    model: model,
                    history: history
                });

                // Store the chat session for reuse
                this.chatSessions.set(sessionId, chat);
            }

            // Prepare message parts
            const messageParts = [{ text: message }];

            // Add file attachments if provided
            if (files && files.length > 0) {
                for (const file of files) {
                    if (file.type === 'inline') {
                        // Upload the base64 file first
                        try {
                            const savedFilePath = await this.saveBase64AsFile(file.data, './temp');
                            const uploadedFile = await this.uploadFile(savedFilePath, file.mimeType);

                            messageParts.push({
                                fileData: {
                                    fileUri: uploadedFile.uri,
                                    mimeType: file.mimeType
                                }
                            });
                        } catch (uploadError) {
                            console.error('Failed to upload file:', uploadError);
                            throw uploadError;
                        }
                    } else if (file.type === 'file') {
                        messageParts.push({
                            fileData: {
                                fileUri: file.fileUri,
                                mimeType: file.mimeType
                            }
                        });
                    }
                }
            }

            // Convert MCP tools to Gemini tool format if enabled
            let tools = undefined;
            if (useMCPTools && this.mcpTools.length > 0) {
                tools = this.mcpTools.map(tool => ({
                    functionDeclarations: [{
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.inputSchema || {
                            type: "object",
                            properties: {},
                            required: []
                        }
                    }]
                }));
            }

            console.log("========== tools ==========")
            console.log(tools);

            // Send the current message and get streaming response
            const response = await chat.sendMessageStream({ 
                message: messageParts,
                config: {
                    tools: tools
                }
            });
            return response;
        } catch (error) {
            console.error('Gemini streaming error:', error);
            // Remove the chat session if there's an error
            this.chatSessions.delete(sessionId);
            throw error;
        }
    }

    /**
     * Stream response from Gemini without chat session reuse
     */
    async streamGeminiWithoutSession(message, conversationHistory = [], model = config.gemini.model, useMCPTools = true) {
        try {
            // Convert conversation history to Gemini's Content format
            const history = conversationHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            // Create a new chat session with history
            const chat = this.genAI.chats.create({
                model: model,
                history,
            });

            // Convert MCP tools to Gemini tool format if enabled
            let tools = undefined;
            if (useMCPTools && this.mcpTools.length > 0) {
                tools = this.mcpTools.map(tool => ({
                    functionDeclarations: [{
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.inputSchema || {
                            type: "object",
                            properties: {},
                            required: []
                        }
                    }]
                }));
            }

            // Send the current message and get streaming response
            const response = await chat.sendMessageStream({ 
                message: message, 
                history: history,
                tools: tools
            });
            return response;
        } catch (error) {
            console.error('Gemini streaming error:', error);
            throw error;
        }
    }

    /**
     * Clear a specific conversation
     */
    clearConversation(sessionId = 'default') {
        this.chatSessions.delete(sessionId);
    }

    /**
     * Get current history for a conversation
     */
    getConversationHistory(sessionId = 'default') {
        const chat = this.chatSessions.get(sessionId);
        return chat ? chat.getHistory() : [];
    }

    /**
     * Get available models
     */
    getAvailableModels() {
        return {
            'gpt-4.1-nano': {
                name: 'GPT-4.1 Nano',
                provider: 'openai',
                model: 'gpt-4.1-nano'
            },
            'gpt-4o-mini': {
                name: 'GPT-4o Mini',
                provider: 'openai',
                model: 'gpt-4o-mini'
            },
            'gpt-4.1-mini': {
                name: 'GPT-4.1 Mini',
                provider: 'openai',
                model: 'gpt-4.1-mini'
            },
            'o4-mini': {
                name: 'O4 Mini',
                provider: 'openai',
                model: 'o4-mini'
            },
            'gemini-2.5-flash': {
                name: 'Gemini 2.5 Flash',
                provider: 'gemini',
                model: 'gemini-2.5-flash'
            },
            'gemini-2.5-pro': {
                name: 'Gemini 2.5 Pro',
                provider: 'gemini',
                model: 'gemini-2.5-pro'
            },
            'gemini-2.0-flash-lite': {
                name: 'Gemini 2.0 Flash Lite',
                provider: 'gemini',
                model: 'gemini-2.0-flash-lite'
            }
        };
    }

    /**
     * Test connection to AI providers
     */
    async testConnections() {
        const results = {
            openai: false,
            gemini: false
        };

        try {
            // Test OpenAI
            const openaiTest = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 5
            });
            results.openai = true;
        } catch (error) {
            console.error('OpenAI connection test failed:', error.message);
        }

        try {
            // Test Gemini
            const chat = this.genAI.chats.create({ model: 'gemini-1.5-pro' });
            const result = await chat.sendMessage({ message: 'Hello' });
            results.gemini = true;
        } catch (error) {
            console.error('Gemini connection test failed:', error.message);
        }

        return results;
    }

    /**
     * Upload a file to Gemini API
     * @param {string} filePath - File path
     * @param {string} mimeType - MIME type of the file
     * @returns {Promise<Object>} Uploaded file object
     */
    async uploadFile(filePath, mimeType) {
        try {
            const uploadedFile = await this.genAI.files.upload({
                file: filePath,
                config: {
                    mimeType: mimeType,
                    displayName: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
                }
            });
            return uploadedFile;
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }

    // Function to save base64 data as a file
    async saveBase64AsFile(base64Data, outputDir = './temp') {
        try {
            // Create output directory if it doesn't exist
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Handle data URL format
            let actualBase64Data = base64Data;
            let extFromBase64 = '';
            if (base64Data.startsWith('data:')) {
                // Example: data:image/png;base64,xxxx
                const match = base64Data.match(/^data:(.+?);base64,/);
                if (match) {
                    const mimeType = match[1];
                    // Map mime type to extension
                    const mimeToExt = {
                        'image/jpeg': '.jpg',
                        'image/png': '.png',
                        'image/gif': '.gif',
                        'image/webp': '.webp',
                        'image/bmp': '.bmp',
                        'image/svg+xml': '.svg',
                        'image/tiff': '.tiff',
                        'image/x-icon': '.ico',
                        'application/pdf': '.pdf',
                        'text/plain': '.txt',
                        'application/json': '.json'
                    };
                    extFromBase64 = mimeToExt[mimeType] || '';
                }
            }
            if (base64Data.startsWith('data:')) {
                actualBase64Data = base64Data.split(',')[1];
            }

            const fileBuffer = Buffer.from(actualBase64Data, 'base64');

            const randomStr = Math.random().toString(36).substring(2, 10);
            const timestamp = Date.now();
            const randomFilename = `${timestamp}_${randomStr}${extFromBase64}`;
            const filePath = path.join(outputDir, randomFilename);

            fs.writeFileSync(filePath, fileBuffer);
            console.log(`File saved successfully: ${filePath}`);
            return filePath;
        } catch (error) {
            console.error('Error saving base64 as file:', error);
            throw error;
        }
    }
    /**
     * Delete a file from Gemini API
     * @param {string} fileName - Name of the file to delete
     * @returns {Promise<Object>} Delete response
     */
    async deleteFile(fileName) {
        try {
            const response = await this.genAI.files.delete({ name: fileName });
            return response;
        } catch (error) {
            console.error('File deletion error:', error);
            throw error;
        }
    }

    /**
     * List files from Gemini API
     * @returns {Promise<Array>} List of files
     */
    async listFiles() {
        try {
            const files = await this.genAI.files.list();
            return files;
        } catch (error) {
            console.error('File listing error:', error);
            throw error;
        }
    }
}

export default new AIService(); 