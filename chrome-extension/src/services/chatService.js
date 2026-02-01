import { isChromeExtension } from '../utils/environment';

const BACKEND_URL = 'http://localhost:3001';

// Utility functions to check settings

// Generic storage getter that handles both Chrome extension and localStorage
const getStorageValue = async (key, defaultValue) => {
    try {
        if (isChromeExtension() && chrome?.storage?.local) {
            const result = await chrome.storage.local.get([key]);
            return result[key] || defaultValue;
        } else {
            // Development mode - use localStorage
            const storedValue = localStorage.getItem(key);
            if (storedValue) {
                try {
                    // Parse JSON if it was stored as JSON
                    return JSON.parse(storedValue);
                } catch {
                    // If it's not JSON, return as is
                    return storedValue;
                }
            }
            return defaultValue;
        }
    } catch (error) {
        console.error(`Error getting ${key}:`, error);
        return defaultValue;
    }
};

export const getBackendUrl = async () => {
    return await getStorageValue('backendUrl', 'http://localhost:3001');
};

class ChatService {
    constructor() {
        this.baseUrl = BACKEND_URL; // Fallback URL
    }

    async getBaseUrl() {
        return await getBackendUrl();
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
            onFirstChunk,
            abortController,
            files = []
        } = callbacks;

        try {
            const baseUrl = await this.getBaseUrl();
            const response = await fetch(`${baseUrl}/api/chat/stream`, {
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
                    files,
                    useFakeStream: false
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
            let isFirstChunk = true;

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
                                        console.log('jsonData.content----->', jsonData.content);
                                        
                                        // Call onFirstChunk callback if this is the first chunk
                                        if (isFirstChunk && onFirstChunk) {
                                            onFirstChunk();
                                            isFirstChunk = false;
                                        }
                                        
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
     * Health check
     */
    async healthCheck() {
        try {
            const baseUrl = await this.getBaseUrl();
            const response = await fetch(`${baseUrl}/health`);
            
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

}

export default new ChatService(); 