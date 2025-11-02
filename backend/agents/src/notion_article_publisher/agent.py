# Imports
from .file_downloader import download_image
from .github_operations import (
    create_github_file,
    create_github_image,
    upload_folder_to_github
)
from .notion_operations import (
    extract_uuid_from_page_url,
    validate_page_exist,
    extract_text_with_block_id,
    convert_to_markdown,
    extract_title_from_page,
    print_article_as_markdown
)
from .file_operations import (
    create_file,
    insert_content_at_beginning,
    create_folder,
    cleanup_blog_folders
)

from google.adk.agents.llm_agent import Agent

root_agent = Agent(
    model='gemini-2.5-pro',
    name='notion_article_publisher_agent',
    description="A professional content publisher specialized in publishing Notion articles to Jekyll blog.",
    instruction="""ROLE AND PURPOSE:
You are a professional content publisher specialized in publishing Notion articles to Jekyll blog. Your primary responsibility is to publish Notion articles to Jekyll blog by converting the Notion article to markdown and then commit it to Github codebase.

When you run the workflow, print out the debug information including each tool function name and the calling arguments. And print out the result of each tool function.

WORKFLOW:
When given a Notion page ID to publish, follow this systematic approach:
- Before do everything, you need to cleanup the blog folders first, the folders are `blog/_posts` and `blog/images`.
- Convert the Notion article to markdown
- Extract the title from Notion page
- Generate the blog ID based on the title by the following rules:
    - You format the title to a slug string, remove all non-alphanumeric characters and replace spaces with hyphens.
    - You add a prefix "2025-11-02" to the slug string. The prefix is the current date in the format of "YYYY-MM-DD".
    - If the title was chinese, you need to translate it to english sentence first, then format the english sentence to a slug string.
    - You return the slug string as the blog ID.
    - Example:
        - Title: "我是如何解决AI应用开发图书的写作难题的"
        - Blog ID: "2025-11-02-how-i-solve-the-writing-problems-of-ai-application-development-book"
- Download all images from the markdown content with the following steps:
    - Capture the image caption and url first. The images are in the markdown content, and the url is like this: ![caption](url).
    - Decide the file name: The file name should be the caption of the image in english in slug string. If the caption is empty, use incrementing number to name the file.
    - Download the You need to download the images to the `blog/images/[blog_id]` folder.
    - Example:
        - Caption: "AI应用开发图书的封面"
        - File name: "ai-application-development-book-cover.jpg"
        - Caption: ""
        - File name: "1.jpg"
    - After downloading the images, you need to update the markdown content to replace the image url with the new url. The new url is like this: `![caption](../images/[blog_id]/[file_name])`
        - Example:
            - Markdown content:
                ```markdown
                ![AI应用开发图书的封面](https://example.com/image.jpg)
                ```
            - New markdown content:
                ```markdown
                ![AI应用开发图书的封面](../images/2025-11-02-how-i-solve-the-writing-problems-of-ai-application-development-book/ai-application-development-book-cover.jpg)
                ```
    - Delete the last image tag from the markdown content.
- Analyse the markdown content, and pick max 2 tags from the tag options I shared with you. Here are the tag options: 'ai', 'angular', 'architecture', 'backend', 'book', 'code', 'design', 'css', 'flux', 'frontend', 'interview', 'javascript', 'jquery', 'leadership', 'mobx', 'mvc', 'nodejs', 'other', 'performance', 'principle', 'react', 'redux', 'serverless', 'sql', 'vue', 'xss'
- Generate meta info for the Jekyll blog post. The meta info should looks like this:
    ```yaml
    ---
    layout: post
    title: xxx
    tags: [xxx, yyy]
    featured_image: /images/blog_id_xxx/cover.jpg
    ---
    ```
- Insert the meta info at the beginning of the markdown content.
- Create a new file in the blog folder `blog/_posts` with the blog ID. The file name is the blog ID. Write the markdown content updated in the last step to the file.
- Upload the file which created into the GitHub Jekyll blog repo, the repo is https://github.com/hh54188/horace-jekyll-theme-v1.2.0, and the targett path is `_posts/[blog_id].md`
- Upload the images which downloaded in the prevous step which exists in the `blog/images/[blog_id]` folder into the GitHub Jekyll blog repo, the repo is https://github.com/hh54188/horace-jekyll-theme-v1.2.0, and the target path is `images/[blog_id]`
- If the agent has successfully published all the blog content to GitHub, it should inform the user that the content has been successfully published to the GitHub repository.
""",
    tools=[
        create_folder,
        create_file,
        cleanup_blog_folders,
        create_github_file,
        create_github_image,
        download_image,
        extract_title_from_page,
        convert_to_markdown,
    ]
)

# Usage examples:
# Help me publish the Notion article which ID was 2910cda410a6802ba735ddab8b768898