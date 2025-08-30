import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

// Initialize Gemini client
const genAI = new GoogleGenAI({ 
    vertexai: false, 
    apiKey: config.gemini.apiKey 
});

// Function to save base64 data as a file
async function saveBase64AsFile(base64Data, outputDir = './temp') {
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
                console.log('================ extFromBase64 ==================');
                console.log(extFromBase64);
            }
        }
        if (base64Data.startsWith('data:')) {
            actualBase64Data = base64Data.split(',')[1];
        }

        const fileBuffer = Buffer.from(actualBase64Data, 'base64');
        
        const randomStr = Math.random().toString(36).substring(2, 10);
        console.log('================ randomStr ==================');
        console.log(randomStr);
        const timestamp = Date.now();
        const randomFilename = `${timestamp}_${randomStr}${extFromBase64}`;
        console.log('================ randomFilename ==================');
        console.log(randomFilename);
        const filePath = path.join(outputDir, randomFilename);
        console.log('================ filePath ==================');
        console.log(filePath);
        
        // fs.writeFileSync(filePath, fileBuffer);
        
        console.log(`File saved successfully: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('Error saving base64 as file:', error);
        throw error;
    }
}

async function uploadFile(filePath, mimeType) {
    try {
        const uploadedFile = await genAI.files.upload({
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

// Test function using cat.jpg
async function testCatImageUpload() {
    try {
        console.log('Testing cat.jpg file upload...');
        
        const imagePath = path.join(process.cwd(), 'cat.jpg');
        const imageBuffer = fs.readFileSync(imagePath);
        const base64String = imageBuffer.toString('base64');
        console.log('================ base64String ==================');
        console.log(base64String);

        const savedFilePath = await saveBase64AsFile(base64String, './temp');
        const result = await uploadFile(savedFilePath, 'image/jpeg');
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testCatImageUpload();