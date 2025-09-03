# Web Page Summary for Firecrawl MCP Server

This MCP (Model Context Protocol) server provides a tool for summarizing web pages using Firecrawl for web scraping and Gemini for content summarization.

## Features

- **Web Scraping**: Uses Firecrawl to extract content from web pages
- **Content Analysis**: Detects paywalls and extracts available content
- **Batch Processing**: Processes content in batches for better handling of long articles
- **Metadata Extraction**: Extracts article metadata (title, author, description, etc.)
- **AI Summarization**: Uses Google Gemini to create comprehensive summaries
- **Paywall Handling**: Detects paywalls and provides archive URLs as alternatives

## Dependencies

- `@mendable/firecrawl-js`: For web scraping
- `@google/genai`: For AI-powered content summarization

## Installation

```bash
cd backend/mcp-servers/web-page-summary-for-firecrawl
npm install
```

## Usage

The server provides a `summarize-web-page` tool that accepts:

- `url`: The web page URL to summarize
- `firecrawlApiKey`: Your Firecrawl API key
- `geminiApiKey`: Your Gemini API key

## API Keys Required

- **Firecrawl API Key**: Get from [Firecrawl](https://firecrawl.dev/)
- **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/)

## Tool Registration

This server is registered in the main MCP server as `summarize-web-page` and can be used by MCP clients to summarize web content programmatically.
