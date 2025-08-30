const BACKEND_URL = 'http://localhost:3001';

// Dynamically import the Google GenAI SDK
const { GoogleGenAI } = await import('@google/genai');

// Utility functions to check settings
export const isFrontendOnlyMode = () => {
    return localStorage.getItem('frontendOnlyMode') === 'true';
};

export const getGeminiApiKey = () => {
    return localStorage.getItem('geminiApiKey') || '';
};

export const hasValidApiKey = () => {
    const apiKey = getGeminiApiKey();
    return apiKey && apiKey.trim().length > 0;
};

class ChatService {
    constructor() {
        this.baseUrl = BACKEND_URL;
    }

    /**
     * Stream chat response from backend with full error handling and abort support
     */
    async streamChat(message, model = 'gpt-4.1-nano', conversationHistory = [], sessionId = 'default', callbacks = {}) {
        const {
            onChunk,
            onComplete,
            onError,
            onLoadingChange,
            abortController,
            files = []
        } = callbacks;

        try {
            const response = await fetch(`${this.baseUrl}/api/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({
                    message,
                    model,
                    conversationHistory,
                    sessionId,
                    files
                }),
                signal: abortController?.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const stream = response.body;
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            let buffer = '';

            const readChunk = () => {
                reader.read()
                    .then(({ value, done }) => {
                        if (done) {
                            console.log('Stream finished');
                            if (onComplete) onComplete();
                            if (onLoadingChange) onLoadingChange(false);
                            return;
                        }

                        const chunkString = decoder.decode(value);
                        buffer += chunkString;

                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        lines.forEach(line => {
                            if (line.startsWith('data: ')) {
                                try {
                                    const jsonData = JSON.parse(line.slice(6));

                                    if (jsonData.error) {
                                        console.error('Stream error:', jsonData.error);
                                        if (onError) onError(`Error: ${jsonData.error}`);
                                        if (onLoadingChange) onLoadingChange(false);
                                        return;
                                    }

                                    if (jsonData.done) {
                                        console.log('Stream completed');
                                        if (onComplete) onComplete();
                                        if (onLoadingChange) onLoadingChange(false);
                                        return;
                                    }

                                    if (jsonData.content && onChunk) {
                                        onChunk(jsonData.content);
                                    }
                                } catch (parseError) {
                                    console.error('Error parsing JSON:', parseError, 'Line:', line);
                                }
                            }
                        });

                        readChunk();
                    })
                    .catch(error => {
                        if (error.name === 'AbortError') {
                            console.log('Request was aborted');
                            if (onError) onError('Request was cancelled');
                        } else {
                            console.error('Error reading stream:', error);
                            if (onError) onError(`Error: ${error.message}`);
                        }
                        if (onLoadingChange) onLoadingChange(false);
                    });
            };

            readChunk();
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request was aborted');
                if (onError) onError('Request was cancelled');
            } else {
                console.error('Fetch error:', error);
                if (onError) onError(`Failed to connect to backend: ${error.message}`);
            }
            if (onLoadingChange) onLoadingChange(false);
        }
    }

    /**
     * Non-streaming chat response (fallback)
     */
    async chat(message, model = 'gpt-4.1-nano', conversationHistory = [], files = []) {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat/non-stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    model,
                    conversationHistory,
                    files
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Chat error:', error);
            throw error;
        }
    }

    /**
     * Get available AI models
     */
    async getModels() {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat/models`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.models;
        } catch (error) {
            console.error('Error getting models:', error);
            throw error;
        }
    }

    /**
     * Test connections to AI providers
     */
    async testConnections() {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat/test`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Error testing connections:', error);
            throw error;
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Health check error:', error);
            throw error;
        }
    }

    /**
     * Direct Gemini API call when in frontend-only mode using @google/genai SDK
     */
    async streamChatDirectGemini(message, conversationHistory = [], callbacks = {}) {
        const {
            onChunk,
            onComplete,
            onError,
            onLoadingChange,
            abortController
        } = callbacks;

        if (!isFrontendOnlyMode() || !hasValidApiKey()) {
            throw new Error('Direct API mode not enabled or invalid API key');
        }

        try {
            
            // Initialize Gemini client with user's API key
            const apiKey = getGeminiApiKey();
            const genAI = new GoogleGenAI({
                vertexai: false,
                apiKey: apiKey
            });

            // Convert conversation history to Gemini's Content format
            const history = conversationHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            // Create a new chat session with history
            const chat = genAI.chats.create({
                model: 'gemini-2.0-flash',
                history: history
            });

            // Send the current message and get streaming response
            const response = await chat.sendMessageStream({ 
                message: message,
            });

            // Process the streaming response
            for await (const chunk of response) {
                // Check if the request was aborted
                if (abortController?.signal?.aborted) {
                    console.log('Gemini request was aborted');
                    if (onError) onError('Request was cancelled');
                    if (onLoadingChange) onLoadingChange(false);
                    return;
                }

                // Handle text chunks
                if (chunk.text) {
                    if (onChunk) onChunk(chunk.text);
                }
            }

            // Stream completed successfully
            console.log('Gemini stream finished');
            if (onComplete) onComplete();
            if (onLoadingChange) onLoadingChange(false);

        } catch (error) {
            console.error('Gemini API error:', error);
            
            if (error.name === 'AbortError') {
                if (onError) onError('Request was cancelled');
            } else {
                if (onError) onError(`Gemini API error: ${error.message}`);
            }
            
            if (onLoadingChange) onLoadingChange(false);
        }
    }
}

export default new ChatService(); 