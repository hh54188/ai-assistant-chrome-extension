# Notion Article Publisher Agent

## Overview
A professional content publisher that converts Notion pages to markdown and publishes them to a Jekyll blog repository on GitHub. It generates a slugged post ID, downloads and rewrites image links, injects Jekyll front matter, and commits both post and images to the target repo.

## Usage

### Prerequisites
- Run the terminal as administrator
- Navigate to the `backend/agents` folder
- Enable the virtual environment
- Navigate to the `backend/agents/src` folder
- Set up Notion and GitHub API keys in `.env`

### Running the Agent
```bash
adk run notion_article_publisher
```

## Features
- Converts Notion page content (headings, paragraphs, lists, quotes, code, dividers, images) to markdown
- Extracts the page title and generates a date-prefixed, English slug for the blog ID
- Downloads images to `blog/images/<blog_id>` and rewrites markdown image URLs
- Injects Jekyll front matter with title, tags (auto-selected up to 2), and featured image
- Creates the post file in `blog/_posts/<blog_id>.md`
- Publishes post and images to GitHub repo `hh54188/horace-jekyll-theme-v1.2.0`
- Cleans up local blog folders before publishing to avoid stale content

## Arguments

### Input
- **page_id** (str): The Notion page ID to publish
  - Example: `23b0cda410a68001b52ad66e1ead92e8`

### Example Query
```
"Help me publish the Notion article which ID was 23b0cda410a68001b52ad66e1ead92e8"
```

### Workflow
1. Cleanup `blog/_posts` and `blog/images`
2. Convert Notion page blocks to markdown
3. Extract page title and generate blog ID: `YYYY-MM-DD-<english-slug>`
4. Download images, rename by caption (slug), rewrite markdown image URLs
5. Insert Jekyll front matter (layout, title, tags, featured_image)
6. Create post file under `blog/_posts/<blog_id>.md`
7. Upload post and images to `hh54188/horace-jekyll-theme-v1.2.0` on `master`
8. Report success with commit info

## Available Tools
- `create_folder(folder_name: str)`
- `create_file(file_name: str, file_content: str)`
- `cleanup_blog_folders()`
- `create_github_file(file_content: str, file_path: str)`
- `create_github_image(local_image_path: str, target_file_path: str)`
- `download_image(image_url: str, target_folder: str, filename: str)`
- `extract_title_from_page(page_id: str)`
- `convert_to_markdown(block_id: str)`

## API Keys Required

### Required API Keys
1. **GOOGLE_API_KEY** - For Gemini model access
2. **NOTION_API_KEY** - For Notion API access
3. **GITHUB_API_KEY** - For publishing to GitHub via PyGithub

### `.env` Configuration
Create a `.env` file in the `backend/agents` directory:
```
GOOGLE_GENAI_USE_VERTEXAI=0
GOOGLE_API_KEY=AIxxx
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_API_KEY=ghp_xxxxxxxxxxxxxxxxxxxxx
```

### GitHub Token Scopes
- Use a classic or fine-grained token with at least `repo` scope for `hh54188/horace-jekyll-theme-v1.2.0`.

## Model Configuration
- Model: `gemini-2.5-pro`
- Agent Name: `notion_article_publisher_agent`

## Technical Details
- Location: `backend/agents/src/notion_article_publisher/agent.py`
- Type: LLM Agent with custom tools (Notion + GitHub + local file ops)
- Target Blog Repo: `hh54188/horace-jekyll-theme-v1.2.0`

## Error Handling
- Validates Notion access; returns clear errors if the page is inaccessible
- Skips empty blocks; preserves spacing between different block types
- Verifies local file and image paths before upload; reports failed uploads

## Limitations
- Processes up to 100 blocks per level (Notion API limit)
- Image captions are used for filenames when available; otherwise auto-numbered
- Requires valid tokens and connectivity to Notion and GitHub