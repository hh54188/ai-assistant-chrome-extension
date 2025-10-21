# Notion Article Reviewer Agent

## Overview
A professional content reviewer and editorial assistant specialized in analyzing Notion articles. This agent reviews article structure, clarity, grammar, coherence, and overall quality, providing feedback by adding targeted comments directly to specific blocks within Notion pages.

## Usage

### Prerequisites
- Run the terminal as administrator
- Navigate to the `backend/agents` folder
- Enable the virtual environment
- Navigate to the `backend/agents/src` folder
- Set up Notion API key in `.env` file

### Running the Agent
```bash
adk run notion_article_reviewer
```

## Features
- Extracts UUID from Notion page URLs
- Validates page existence and accessibility
- Extracts text content from all block types (paragraphs, headings, lists, quotes)
- Analyzes content for grammar, clarity, structure, style, accuracy, and completeness
- Adds constructive feedback comments directly to Notion blocks
- Provides Chinese-language feedback
- Recursive traversal of nested blocks

## Arguments

### Input
- **page_url** (str): The full URL of the Notion page to review
  - Example: `https://www.notion.so/DONE-E20-AI-23b0cda410a68001b52ad66e1ead92e8`
  - Can include query strings and hash fragments

## Example Usage

### Query Example
```
"Please review this Notion article: https://www.notion.so/DONE-E20-AI-23b0cda410a68001b52ad66e1ead92e8"
```

### Workflow
1. Agent extracts UUID from the provided URL
2. Validates that the page exists and is accessible
3. Extracts all text content with block IDs
4. Analyzes each block for issues
5. Adds comments to blocks with issues
6. Provides a summary of the review

### Expected Output
```
Review Complete for Page 23b0cda410a68001b52ad66e1ead92e8
- Total blocks reviewed: 45
- Comments added: 12
- Issues identified: Grammar (5), Clarity (4), Structure (3)
- Overall assessment: The article has a solid structure but needs improvement in clarity and grammar. Several paragraphs could benefit from more concise language, and there are some grammatical errors that should be corrected.
```

## Available Tools

### 1. extract_uuid_from_page_url(page_url: str) -> str
Extracts the UUID from a Notion page URL.
- Handles URLs with query strings and hash fragments
- Returns clean UUID for API calls

### 2. validate_page_exist(page_id: str) -> bool
Validates whether a Notion page exists and is accessible.
- Returns `True` if accessible, `False` otherwise
- Must be called before attempting to review content

### 3. extract_text_with_block_id(block_id: str) -> list[BlockTextMap]
Recursively extracts text content from blocks.
- Returns list of dictionaries with `id` and `text` fields
- Supports: paragraphs, headings (h1-h3), lists, quotes
- Automatically traverses nested blocks

### 4. add_comment(blockId: str, comment: str) -> bool
Adds a comment to a specific Notion block.
- Returns `True` on success
- Comments are in Chinese
- Non-destructive (doesn't modify original content)

## Review Guidelines

The agent analyzes content for:
- **Grammar and spelling**: Typos, grammatical errors, punctuation
- **Clarity**: Unclear or ambiguous statements
- **Structure**: Logical flow, transitions, organization
- **Style**: Readability and tone consistency
- **Accuracy**: Factual inconsistencies or unsupported claims
- **Completeness**: Missing context or incomplete explanations

### Comment Format
```
[Issue Type]: [Brief description]
Suggestion: [Specific recommendation]
```

## API Keys Required

### Required API Keys
1. **GOOGLE_API_KEY** - For Gemini model access
2. **NOTION_API_KEY** - For Notion API access

### `.env` Configuration
Create a `.env` file in the `backend/agents` directory:
```
GOOGLE_GENAI_USE_VERTEXAI=0
GOOGLE_API_KEY=AIxxx
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxx
```

### Obtaining Notion API Key
1. Go to https://www.notion.so/my-integrations
2. Create a new integration
3. Copy the "Internal Integration Token"
4. Share your Notion pages with the integration

### Required Permissions
The Notion integration must have:
- Read access to pages
- Comment permissions on the workspace

## Model Configuration
- Model: `gemini-2.5-pro`
- Agent Name: `notion_article_reviewer_agent`

## Technical Details
- Location: `backend/agents/src/notion_article_reviewer/agent.py`
- Type: LLM Agent with custom tools
- Async: Uses async/await for Notion API calls
- Language: Primarily Chinese for feedback

## Error Handling
- Returns error if page doesn't exist or isn't accessible
- Continues review if individual comments fail
- Provides clear status updates throughout the process
- Gracefully handles empty pages or blocks

## Limitations
- Processes up to 100 blocks per level (Notion API limit)
- Only extracts plain text (formatting is ignored)
- Comments are added sequentially to avoid rate limiting

