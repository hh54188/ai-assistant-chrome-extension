# MCP Server Tools Organization

This directory contains the MCP server implementation with tools organized by domain/usage rather than by technical function.

## File Structure

### Core Files
- `index.js` - Main server setup and tool registration
- `README.md` - This documentation file

### Domain-Specific Tool Files

#### `projectTools.js`
Contains tools related to project information and metadata:
- `checkCreator()` - Returns project creator information
- `getProjectInfo()` - Returns comprehensive project details

#### `notionTools.js`
Contains tools for Notion article management:
- `fixNotionArticle(articleContent)` - Fixes grammar and spelling
- `analyzeNotionArticle(articleContent)` - Analyzes article readability

#### `gcpTools.js`
Contains tools for Google Cloud Platform management:
- `checkGcpCosts(projectId)` - Monitors GCP costs
- `getGcpBillingAlerts(projectId)` - Retrieves billing alerts
- `analyzeGcpOptimization(projectId)` - Provides optimization recommendations

## Adding New Tools

To add new tools:

1. **Create a new domain file** (e.g., `githubTools.js`, `slackTools.js`)
2. **Export your tool functions** with proper JSDoc documentation
3. **Import and register** the tools in `index.js`
4. **Update this README** with the new domain and tools

## Example: Adding GitHub Tools

```javascript
// githubTools.js
export async function checkGithubIssues(repoName) {
    // Implementation here
}

// index.js
import { checkGithubIssues } from "./githubTools.js";

server.registerTool("check-github-issues", {
    description: "Check issues in a GitHub repository",
}, checkGithubIssues);
```

## Benefits of This Structure

- **Clear separation of concerns** by domain
- **Easy to find and maintain** specific tool categories
- **Scalable** for adding many tools across different domains
- **Better organization** than generic "toolCallbacks" naming
- **Domain experts** can work on specific tool files independently
