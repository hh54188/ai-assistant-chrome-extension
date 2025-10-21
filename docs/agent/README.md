# Agent Documentation Index

This directory contains documentation for all AI agents built with Google ADK (Agent Development Kit).

## Available Agents

### 1. [Creator Checker Agent](./creator_checker.md)
A simple agent that provides information about the project creator.

**Use Case**: Quick access to project creator information and contact details

**Model**: `gemini-2.5-flash`

**Key Features**:
- Returns creator name, website, GitHub, and email
- No additional API keys required beyond Google API
- Simple query-response interface

[View Full Documentation →](./creator_checker.md)

---

### 2. [Notion Article Reviewer Agent](./notion_article_reviewer.md)
A professional content reviewer that analyzes Notion articles and provides constructive feedback.

**Use Case**: Automated content review and editorial feedback on Notion documents

**Model**: `gemini-2.5-pro`

**Key Features**:
- Reviews grammar, clarity, structure, and style
- Adds comments directly to Notion blocks
- Supports nested block structures
- Provides feedback in Chinese

**Additional Requirements**: Notion API key

[View Full Documentation →](./notion_article_reviewer.md)

---

### 3. [Podcast Shownotes Creator Agent](./podcast_shownotes_creator.md)
A specialized agent that creates comprehensive Chinese podcast shownotes from audio files.

**Use Case**: Automatic generation of professional podcast shownotes from audio recordings

**Model**: `gemini-2.5-flash` + Whisper (base)

**Key Features**:
- Audio transcription using Whisper AI
- Timestamped transcript generation
- Comprehensive shownotes in Chinese
- Structured output with multiple sections

**Additional Requirements**: Audio file in supported format (MP3, WAV, etc.)

[View Full Documentation →](./podcast_shownotes_creator.md)

---

## Common Setup

### Environment Requirements

#### `.env` File Format
Create a `.env` file in the `backend/agents` directory with the following format:

**Required for all agents:**
```
GOOGLE_GENAI_USE_VERTEXAI=0
GOOGLE_API_KEY=AIxxx
```

**Optional (required by specific agents):**
```
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxx
```

### Installation

#### 1. Install Python Dependencies

**For macOS:**
```bash
cd backend/agents
pip install -r requirements-osx.txt
```

**For Windows:**
```bash
cd backend/agents
pip install -r requirements-win.txt
```

#### 2. Set Up Virtual Environment (Recommended)

**For macOS/Linux:**
```bash
cd backend/agents
python -m venv venv
source venv/bin/activate
pip install -r requirements-osx.txt
```

**For Windows:**
```bash
cd backend/agents
python -m venv venv
venv\Scripts\activate
pip install -r requirements-win.txt
```

### Running an Agent

Follow these steps to run any agent:

1. **Run terminal as administrator** (Windows) or with appropriate permissions
2. **Navigate to the agents folder:**
   ```bash
   cd backend/agents
   ```
3. **Activate the virtual environment** (if using one):
   - macOS/Linux: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate`
4. **Navigate to the src folder:**
   ```bash
   cd src
   ```
5. **Run the target agent:**
   ```bash
   adk run <agent_name>
   ```

**Available agent names:**
- `creator_checker`
- `notion_article_reviewer`
- `podcast_shownotes_creator`

### Example
```bash
cd backend/agents
source venv/bin/activate  # or venv\Scripts\activate on Windows
cd src
adk run notion_article_reviewer
```

## Common Dependencies

All agents share these core dependencies:
- `google-adk>=1.16.0` - Google Agent Development Kit
- `python-dotenv==1.1.1` - Environment variable management
- Various Google Cloud libraries for AI platform integration

For complete dependency lists, see:
- `backend/agents/requirements-osx.txt` (macOS)
- `backend/agents/requirements-win.txt` (Windows)

## API Keys

### Google API Key (Required for all agents)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create or select a project
3. Generate an API key
4. Add to `.env` file as `GOOGLE_API_KEY`

### Notion API Key (Required for Notion Article Reviewer)

1. Go to https://www.notion.so/my-integrations
2. Create a new integration
3. Copy the "Internal Integration Token"
4. Add to `.env` file as `NOTION_API_KEY`
5. Share your Notion pages with the integration

## Troubleshooting

### Common Issues

**"Module not found" error:**
- Ensure you've activated the virtual environment
- Verify all dependencies are installed: `pip install -r requirements-[osx|win].txt`

**"API key not found" error:**
- Check that `.env` file exists in `backend/agents` directory
- Verify the API key format is correct
- Ensure no extra spaces or quotes in the `.env` file

**"Permission denied" error:**
- Run terminal as administrator (Windows)
- Check file permissions (macOS/Linux)

**Whisper model download issues:**
- Ensure sufficient disk space for model files
- Check internet connection
- Models are cached after first download

## Additional Resources

- [Google ADK Documentation](https://cloud.google.com/adk)
- [Notion API Documentation](https://developers.notion.com/)
- [Faster Whisper Documentation](https://github.com/guillaumekln/faster-whisper)

## Contributing

When adding new agents:
1. Create agent in `backend/agents/src/<agent_name>/`
2. Add documentation following the template in existing agent docs
3. Update this README index with the new agent
4. Update requirements files if new dependencies are needed
5. Test on both Windows and macOS if possible