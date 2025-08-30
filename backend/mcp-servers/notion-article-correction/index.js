import { Client } from "@notionhq/client";
import OpenAI from "openai";
import { GoogleGenAI } from '@google/genai';
import { config } from '../../config.js';
import dotenv from "dotenv";
dotenv.config();

// Configuration - these will be passed as parameters to the MCP tool
const NOTION_TOKEN = config.notion.apiKey;
const OPENAI_API_KEY = config.openai.apiKey;
const GEMINI_API_KEY = config.gemini.apiKey;

// Initialize clients
const notion = new Client({ auth: NOTION_TOKEN });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const genAI = new GoogleGenAI({
    vertexai: false,
    apiKey: GEMINI_API_KEY
});

class ArticleReviewer {
    constructor(aiProvider = 'openai', notionPageId) {
        this.aiProvider = aiProvider;
        this.notionPageId = notionPageId;
        this.reviewedBlocks = new Set();
        
        // Common prompt for both AI providers
        this.reviewPrompt = `你是一个专业的中文文章审阅专家。请仔细分析以下中文文本，检查：
1. 句子分割是否正确
2. 语法是否准确
3. 表达是否自然流畅
4. 是否有更好的表达方式

如果发现问题，请提供具体的修改建议。如果没有问题，请回复"无需修改"。

请用中文回复，格式如下：
问题：[具体问题描述]
建议：[修改建议或更好的表达方式]`;
    }

    async reviewWithOpenAI(text) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: this.reviewPrompt
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                temperature: 0.3,
                max_tokens: 500
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error("OpenAI API 错误:", error.message);
            return "API 调用失败，请检查网络连接和 API 密钥";
        }
    }

    async reviewWithGemini(text) {
        try {

            const prompt = `${this.reviewPrompt}

待审阅文本：
${text}`;

            const result = await genAI.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: prompt,
            });
            return result.text;
        } catch (error) {
            console.error("Gemini API 错误:", error.message);
            return "API 调用失败，请检查网络连接和 API 密钥";
        }
    }

    async reviewText(text) {
        if (!text || text.trim().length === 0) {
            return "无需修改";
        }

        console.log(`正在使用 ${this.aiProvider} 审阅文本: "${text.substring(0, 50)}..."`);

        if (this.aiProvider === 'openai') {
            return await this.reviewWithOpenAI(text);
        } else if (this.aiProvider === 'gemini') {
            return await this.reviewWithGemini(text);
        } else {
            throw new Error("不支持的 AI 提供商");
        }
    }

    async addComment(blockId, comment) {
        try {
            await notion.comments.create({
                parent: { block_id: blockId },
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: comment
                        }
                    }
                ]
            });
            console.log(`✅ 已为块 ${blockId} 添加评论`);
        } catch (error) {
            console.error(`❌ 添加评论失败 (块 ${blockId}):`, error.message);
        }
    }

    async getPageContent() {
        try {
            const response = await notion.blocks.children.list({
                block_id: this.notionPageId,
                page_size: 100
            });
            return response.results;
        } catch (error) {
            console.error("获取页面内容失败:", error.message);
            return [];
        }
    }

    async processBlock(block) {
        if (this.reviewedBlocks.has(block.id)) {
            return;
        }

        let textToReview = "";
        let blockType = block.type;

        // 提取文本内容
        if (block.type === "paragraph" && block.paragraph.rich_text.length > 0) {
            textToReview = block.paragraph.rich_text.map(rt => rt.plain_text).join("");
        } else if (block.type === "heading_1" && block.heading_1.rich_text.length > 0) {
            textToReview = block.heading_1.rich_text.map(rt => rt.plain_text).join("");
        } else if (block.type === "heading_2" && block.heading_2.rich_text.length > 0) {
            textToReview = block.heading_2.rich_text.map(rt => rt.plain_text).join("");
        } else if (block.type === "heading_3" && block.heading_3.rich_text.length > 0) {
            textToReview = block.heading_3.rich_text.map(rt => rt.plain_text).join("");
        } else if (block.type === "bulleted_list_item" && block.bulleted_list_item.rich_text.length > 0) {
            textToReview = block.bulleted_list_item.rich_text.map(rt => rt.plain_text).join("");
        } else if (block.type === "numbered_list_item" && block.numbered_list_item.rich_text.length > 0) {
            textToReview = block.numbered_list_item.rich_text.map(rt => rt.plain_text).join("");
        } else if (block.type === "quote" && block.quote.rich_text.length > 0) {
            textToReview = block.quote.rich_text.map(rt => rt.plain_text).join("");
        }

        // 检查是否包含中文
        if (textToReview && /[\u4e00-\u9fff]/.test(textToReview)) {
            console.log(`\n📝 处理 ${blockType} 块: "${textToReview.substring(0, 100)}..."`);
            
            const review = await this.reviewText(textToReview);
            
            if (review && review !== "无需修改" && !review.includes("API 调用失败")) {
                const comment = `🤖 AI 审阅建议:\n\n${review}`;
                await this.addComment(block.id, comment);
            } else if (review === "无需修改") {
                console.log("✅ 文本无需修改");
            }
        }

        this.reviewedBlocks.add(block.id);

        // 递归处理子块
        if (block.has_children) {
            try {
                const children = await notion.blocks.children.list({
                    block_id: block.id,
                    page_size: 100
                });
                
                for (const child of children.results) {
                    await this.processBlock(child);
                }
            } catch (error) {
                console.error(`获取子块失败 (块 ${block.id}):`, error.message);
            }
        }
    }

    async reviewArticle() {
        console.log(`🚀 开始使用 ${this.aiProvider} 审阅 Notion 文章...`);
        console.log(`📄 页面 ID: ${this.notionPageId}`);
        
        const blocks = await this.getPageContent();
        
        if (blocks.length === 0) {
            console.log("❌ 未找到页面内容或页面为空");
            return { success: false, message: "未找到页面内容或页面为空" };
        }

        console.log(`📊 找到 ${blocks.length} 个内容块`);

        for (const block of blocks) {
            await this.processBlock(block);
        }

        console.log("\n🎉 文章审阅完成！");
        console.log(`📈 共处理了 ${this.reviewedBlocks.size} 个内容块`);
        
        return { 
            success: true, 
            message: "文章审阅完成", 
            processedBlocks: this.reviewedBlocks.size 
        };
    }
}

// MCP Tool function
async function reviewNotionArticle(params) {
    const { aiProvider, notionArticleId } = params;
    
    // Validate required parameters
    if (!aiProvider || !notionArticleId) {
        return {
            success: false,
            error: "Missing required parameters: aiProvider and notionArticleId are required"
        };
    }
    
    if (!['openai', 'gemini'].includes(aiProvider)) {
        return {
            success: false,
            error: "Invalid AI provider. Must be 'openai' or 'gemini'"
        };
    }
    
    try {
        const reviewer = new ArticleReviewer(aiProvider, notionArticleId);
        const result = await reviewer.reviewArticle();
        return result;
    } catch (error) {
        return {
            success: false,
            error: `Article review failed: ${error.message}`
        };
    }
}

// Export for MCP tool usage
export { reviewNotionArticle, ArticleReviewer };

// Legacy main function for direct usage
async function main() {
    const args = process.argv.slice(2);
    const aiProvider = args[0] || 'gemini';
    const notionPageId = args[1];
    
    if (!notionPageId) {
        throw new Error('notionPageId is required. Please provide it as the second command line argument.');
    }

    if (!['openai', 'gemini'].includes(aiProvider)) {
        console.log("❌ 请指定 AI 提供商: 'openai' 或 'gemini'");
        console.log("使用方法: node index.js [openai|gemini] [notion-page-id]");
        return;
    }

    const reviewer = new ArticleReviewer(aiProvider, notionPageId);
    
    try {
        await reviewer.reviewArticle();
    } catch (error) {
        console.error("❌ 程序执行失败:", error.message);
    }
}

// Run program if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

