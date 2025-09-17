import FirecrawlApp from '@mendable/firecrawl-js';
import { GoogleGenAI } from '@google/genai';

// Get API keys directly from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

// Initialize Gemini client
const genAI = new GoogleGenAI({
    vertexai: false,
    apiKey: GEMINI_API_KEY
});

// Function to split content into batches with overlap
function createBatches(content, batchSize = 3, overlap = 1) {
    const paragraphs = content.split('\n').filter(p => p.trim().length > 0);
    const batches = [];
    
    for (let i = 0; i < paragraphs.length; i += batchSize - overlap) {
        const batch = paragraphs.slice(i, i + batchSize);
        if (batch.length > 0) {
            batches.push(batch.join('\n'));
        }
    }
    
    return batches;
}

// Function to extract useful information from metadata
function extractMetadataInfo(metadata) {
    const info = {
        title: metadata.title || metadata.ogTitle || '',
        author: metadata.author || metadata['article:author'] || '',
        description: metadata.description || metadata.ogDescription || metadata['twitter:description'] || '',
        publishedTime: metadata.publishedTime || metadata['article:published_time'] || '',
        keywords: metadata.keywords || metadata.news_keywords || '',
        siteName: metadata['og:site_name'] || metadata.ogSiteName || '',
        image: metadata.ogImage || metadata['twitter:image'] || '',
        contentTier: metadata['article:content_tier'] || '',
        section: metadata['article:section'] || ''
    };
    
    return info;
}

// Function to create a summary from metadata and available content
async function createPartialSummary(metadata, availableContent = '', geminiApiKey) {
    try {
        const metadataInfo = extractMetadataInfo(metadata);
        
        let prompt = `Based on the following article metadata and any available content, create a comprehensive summary of what this article is about. Focus on the main topic, key points, and what readers can expect to learn.

Article Metadata:
- Title: ${metadataInfo.title}
- Author: ${metadataInfo.author}
- Description: ${metadataInfo.description}
- Published: ${metadataInfo.publishedTime}
- Keywords: ${metadataInfo.keywords}
- Site: ${metadataInfo.siteName}
- Content Tier: ${metadataInfo.contentTier}
- Section: ${metadataInfo.contentTier}`;

        if (availableContent.trim()) {
            prompt += `\n\nAvailable Content Preview:\n${availableContent.substring(0, 1000)}...`;
        }

        prompt += `\n\nPlease provide a detailed summary based on this information. If the content is behind a paywall, explain what the article covers and why it might be worth reading.`;

        // Create a new chat session with Gemini
        const chat = genAI.chats.create({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
        });

        const response = await chat.sendMessage({
            message: prompt,
            config: {
                systemInstruction: "You are an expert content analyst. Create informative summaries based on available metadata and content previews. Be thorough and engaging."
            }
        });
        return response.text
    } catch (error) {
        console.error('Error creating partial summary:', error);
        return null;
    }
}

// Function to detect paywall and get available content
async function detectPaywallWithContent(content, geminiApiKey) {
    try {
        // Create a new chat session with Gemini
        const chat = genAI.chats.create({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
        });

        const response = await chat.sendMessage({
            message: content,
            config: {
                systemInstruction: "You are a paywall detection expert. Analyze the given content and determine if it's behind a paywall. Look for indicators like 'Subscribe to read', 'Subscribe to unlock', 'Pay to read', 'Premium content', etc. If a paywall is detected, also identify any useful content that appears BEFORE the paywall message. Respond in JSON format: {\"isPaywall\": true/false, \"availableContent\": \"content before paywall if any\"}"
            }
        });

        const result = response.text
        try {
            return JSON.parse(result);
        } catch (parseError) {
            // Fallback to simple detection if JSON parsing fails
            const simpleResult = result.toLowerCase();
            if (simpleResult.includes('paywall') || simpleResult.includes('subscribe')) {
                return { isPaywall: true, availableContent: '' };
            }
            return { isPaywall: false, availableContent: '' };
        }
    } catch (error) {
        console.error('Error detecting paywall:', error);
        return { isPaywall: false, availableContent: '', error: true };
    }
}

// Function to generate archive URL
function generateArchiveUrl(originalUrl) {
    const encodedUrl = encodeURIComponent(originalUrl);
    return `https://archive.today/?run=1&url=${encodedUrl}`;
}

// Function to summarize content
async function summarizeContent(content, geminiApiKey) {
    try {
        // Create a new chat session with Gemini
        const chat = genAI.chats.create({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
        });

        const response = await chat.sendMessage({
            message: content,
            config: {
                systemInstruction: "You are a content summarizer. Create a comprehensive summary of the given content. Focus on the main points, key insights, and important details. Make the summary clear and well-structured."
            }
        });
        
        return response.text
    } catch (error) {
        console.error('Error summarizing content:', error);
        return null;
    }
}

// Function to process content in batches
async function processContentInBatches(content, metadata, geminiApiKey) {
    const batches = createBatches(content);
    let allSummaries = [];
    let paywallDetected = false;
    let paywallBatchIndex = -1;
    let skippedBatches = 0;
    
    for (let i = 0; i < batches.length; i++) {
        console.log(`Processing batch ${i + 1}/${batches.length}`);
        
        // Check for paywall with content extraction
        const paywallResult = await detectPaywallWithContent(batches[i], geminiApiKey);
        
        if (paywallResult.isPaywall && !paywallDetected) {
            console.log(`Paywall detected in batch ${i + 1}! Marking and skipping this batch.`);
            paywallDetected = true;
            paywallBatchIndex = i;
            skippedBatches++;
            continue; // Skip this batch and continue with the next ones
        } else if (paywallResult.error) {
            console.log('Error detecting paywall status. Continuing with summary...');
        }
        
        // If no paywall or paywall already detected and skipped, summarize this batch
        const batchSummary = await summarizeContent(batches[i], geminiApiKey);
        if (batchSummary) {
            allSummaries.push(batchSummary);
        }
    }
    
    // Combine all batch summaries into a final summary
    if (allSummaries.length > 0) {
        const combinedContent = allSummaries.join('\n\n');
        const finalSummary = await summarizeContent(combinedContent, geminiApiKey);
        
        const result = {
            status: 'SUCCESS',
            summary: finalSummary,
            batchCount: batches.length,
            processedBatches: allSummaries.length,
            metadata: extractMetadataInfo(metadata)
        };
        
        // Add paywall information if detected
        if (paywallDetected) {
            result.paywallInfo = {
                detected: true,
                batchIndex: paywallBatchIndex,
                skippedBatches: skippedBatches,
                archiveUrl: generateArchiveUrl(metadata.url || '')
            };
            result.message = `Summary completed with paywall detected and skipped. Processed ${allSummaries.length} batches, skipped ${skippedBatches} paywall batch(es).`;
        } else {
            result.message = `Summary completed successfully. Processed all ${allSummaries.length} batches.`;
        }
        
        return result;
    }
    
    return {
        status: 'ERROR',
        message: 'Failed to generate summary'
    };
}

// Main function to summarize web page
export async function summarizeWebPage(params) {
    const { url } = params;
    
    // Validate required parameters
    if (!url) {
        return {
            status: 'ERROR',
            message: 'Missing required parameter: url is required'
        };
    }
    
    // Use API keys from config
    const firecrawlApiKey = FIRECRAWL_API_KEY;
    const geminiApiKey = GEMINI_API_KEY;
    
    if (!firecrawlApiKey) {
        return {
            status: 'ERROR',
            message: 'Missing FIRECRAWL_API_KEY environment variable'
        };
    }
    
    if (!geminiApiKey) {
        return {
            status: 'ERROR',
            message: 'Missing GEMINI_API_KEY environment variable'
        };
    }
    
    try {
        console.log('Fetching content from:', url);
        const app = new FirecrawlApp({ apiKey: firecrawlApiKey });
        const scrapeResult = await app.scrapeUrl(url, { formats: ['markdown'] });
        const { markdown, success, error, metadata } = scrapeResult;
        
        if (!success || !markdown) {
            console.error('Failed to scrape URL:', error);
            return {
                status: 'ERROR',
                message: `Failed to scrape URL: ${error}`
            };
        }
        
        console.log('Content fetched successfully. Processing...');
        console.log('Content preview:', markdown.substring(0, 200) + '...');
        console.log('Metadata available:', Object.keys(metadata).length, 'fields');
        
        // Add URL to metadata for archive generation
        metadata.url = url;
        
        const result = await processContentInBatches(markdown, metadata, geminiApiKey);
        
        if (result.status === 'SUCCESS') {
            console.log('\n=== SUMMARY COMPLETE ===');
            console.log('Message:', result.message);
            console.log('Total batches:', result.batchCount);
            console.log('Processed batches:', result.processedBatches);
            
            if (result.paywallInfo) {
                console.log('\n=== PAYWALL INFORMATION ===');
                console.log('Paywall detected in batch:', result.paywallInfo.batchIndex + 1);
                console.log('Skipped batches:', result.paywallInfo.skippedBatches);
                console.log('Archive URL:', result.paywallInfo.archiveUrl);
            }
            
            console.log('\nArticle Information:');
            console.log('- Title:', result.metadata.title);
            console.log('- Author:', result.metadata.author);
            console.log('- Published:', result.metadata.publishedTime);
            console.log('- Site:', result.metadata.siteName);
            console.log('- Keywords:', result.metadata.keywords);
            console.log('\nSummary:');
            console.log(result.summary);
        }
        
        return result.summary;
        
    } catch (error) {
        console.error('Error in main process:', error);
        return {
            status: 'ERROR',
            message: `Error processing web page: ${error.message}`
        };
    }
}
