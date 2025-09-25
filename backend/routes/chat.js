import express from 'express';
import aiService from '../services/aiService.js';

const router = express.Router();
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * POST /api/chat/stream
 * Stream chat response from AI provider
 */
router.post('/stream', async (req, res) => {
    const { message, model = 'gpt-4.1-nano', conversationHistory = [], sessionId = 'default', files = [], useFakeStream = false} = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    try {
        let stream;
        let provider;

        // Determine provider based on model name
        if (model.startsWith('gpt-') || model.startsWith('o4-')) {
            provider = 'openai';
            stream = await aiService.streamOpenAI(message, conversationHistory, model);
        } else if (model.startsWith('gemini-')) {
            provider = 'gemini';
            // Use fake stream for debugging if requested
            if (useFakeStream) {
                console.log('🔧 Using FAKE Gemini stream for debugging');
                stream = await aiService.streamGeminiFake(message, conversationHistory, model, sessionId, files, false);
            } else {
                // stream = await aiService.streamGeminiWithTools(message, conversationHistory, model, sessionId, files);
                stream = await aiService.streamGemini(message, conversationHistory, model, sessionId, files, false);
            }
        } else {
            throw new Error(`Unsupported model: ${model}`);
        }
        
        for await (const chunk of stream) {
            const content = provider === 'openai' 
                ? chunk.choices[0]?.delta?.content || ''
                : provider === 'gemini' 
                    ? chunk.text
                    : chunk.text() || '';
            
            if (content) {
                const dataToSend = JSON.stringify({ content, provider, model });
                console.log('dataToSend', dataToSend);
                res.write(`data: ${dataToSend}\n\n`);
                if (res.flush) {
                    res.flush();
                }
            }
        }

        res.write(`data: ${JSON.stringify({ done: true, provider, model })}\n\n`);
        res.end();
    } catch (error) {
        console.error('Chat streaming error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message, model })}\n\n`);
        res.end();
    }
});

/**
 * GET /api/chat/models
 * Get available AI models
 */
router.get('/models', (req, res) => {
    try {
        const models = aiService.getAvailableModels();
        res.json({ models });
    } catch (error) {
        console.error('Error getting models:', error);
        res.status(500).json({ error: 'Failed to get models' });
    }
});

/**
 * GET /api/chat/test
 * Test connections to AI providers
 */
router.get('/test', async (req, res) => {
    try {
        const results = await aiService.testConnections();
        res.json({ results });
    } catch (error) {
        console.error('Error testing connections:', error);
        res.status(500).json({ error: 'Failed to test connections' });
    }
});

/**
 * DELETE /api/chat/conversation/:sessionId
 * Clear a specific conversation
 */
router.delete('/conversation/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        aiService.clearConversation(sessionId);
        res.json({ message: `Session ${sessionId} cleared successfully` });
    } catch (error) {
        console.error('Error clearing session:', error);
        res.status(500).json({ error: 'Failed to clear session' });
    }
});

/**
 * GET /api/chat/conversation/:sessionId/history
 * Get conversation history
 */
router.get('/conversation/:sessionId/history', (req, res) => {
    try {
        const { sessionId } = req.params;
        const history = aiService.getConversationHistory(sessionId);
        res.json({ history, sessionId });
    } catch (error) {
        console.error('Error getting conversation history:', error);
        res.status(500).json({ error: 'Failed to get conversation history' });
    }
});

/**
 * POST /api/chat/non-stream
 * Non-streaming chat response (for fallback)
 */
router.post('/non-stream', async (req, res) => {
    const { message, model = 'gpt-4.1-nano', conversationHistory = [], files = [] } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        let response;
        let provider;

        // Determine provider based on model name
        if (model.startsWith('gpt-') || model.startsWith('o4-')) {
            provider = 'openai';
            const result = await aiService.openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.'
                    },
                    ...conversationHistory,
                    { role: 'user', content: message }
                ],
                max_tokens: 1000,
                temperature: 0.7
            });
            response = result.choices[0].message.content;
        } else if (model.startsWith('gemini-')) {
            provider = 'gemini';
            const chat = aiService.genAI.chats.create({ model: model });
            const result = await chat.sendMessage({ message: message });
            response = result.text;
        } else {
            throw new Error(`Unsupported model: ${model}`);
        }

        res.json({ 
            content: response, 
            provider,
            model,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router; 