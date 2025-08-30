import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config.js';
import chatRoutes from './routes/chat.js';

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));

// Compression middleware - but not for streaming endpoints
app.use((req, res, next) => {
    // Disable compression for streaming endpoints
    if (req.path.includes('/stream')) {
        res.setHeader('Content-Encoding', 'identity');
        return next();
    }
    compression()(req, res, next);
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: config.server.nodeEnv
    });
});

// API routes
app.use('/api/chat', chatRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'AI Copilot Backend Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            chat: {
                stream: 'POST /api/chat/stream',
                models: 'GET /api/chat/models',
                test: 'GET /api/chat/test',
                nonStream: 'POST /api/chat/non-stream'
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: config.server.nodeEnv === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
    console.log(`🚀 AI Copilot Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${config.server.nodeEnv}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
});

export default app; 