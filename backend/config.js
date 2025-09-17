import dotenv from 'dotenv';

// Load .env file only in development mode (not in production or test)
// In test/CI environments, rely on environment variables passed from the parent process
if (process.env.NODE_ENV === 'development') {
    try {
        dotenv.config();
        console.log('✅ Loaded environment variables from .env file');
    } catch (error) {
        console.log('No .env file found, using environment variables directly');
    }
} else {
    console.log('Using environment variables from process environment');
}

// Debug: Log environment variable status
console.log('🔧 Backend environment variable status:');
console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`  - GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  - PORT: ${process.env.PORT || 'default (3001)'}`);

// Validate required environment variables
const requiredEnvVars = [
    'GEMINI_API_KEY',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
    console.error('Please check your .env file (for local development) or environment variables (for CI/production) and ensure all required variables are set.');
    process.exit(1);
}

export const config = {
    // OpenAI Configuration
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
    },
    
    // Gemini Configuration
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
        maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 1000,
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7
    },
    
    // Notion Configuration
    notion: {
        apiKey: process.env.NOTION_API_KEY
    },
    
    // Firecrawl Configuration
    firecrawl: {
        apiKey: process.env.FIRECRAWL_API_KEY
    },
    
    // Server Configuration
    server: {
        port: parseInt(process.env.PORT) || 3001,
        nodeEnv: process.env.NODE_ENV || 'development'
    },
    
    // CORS Configuration
    cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:5173',
            'http://localhost:3000'
        ]
    }
}; 