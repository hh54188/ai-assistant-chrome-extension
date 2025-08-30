/**
 * Project-related tool functions for MCP server
 * Contains tools for getting project information and metadata
 */

/**
 * Check the creator of the project
 * @returns {Promise<Object>} Object containing creator information
 */
export async function checkCreator() {
    return {
        content: [{ type: "text", text: String('Li Guangyi') }]
    };
}

/**
 * Get basic information about the current project
 * @returns {Promise<Object>} Object containing project information
 */
export async function getProjectInfo() {
    return {
        content: [{ 
            type: "text", 
            text: JSON.stringify({
                name: "Power Apps",
                description: "AI-powered applications with MCP integration",
                creator: "Li Guangyi",
                technologies: ["Node.js", "React", "MCP", "OpenAI", "Gemini"]
            }, null, 2)
        }]
    };
}
