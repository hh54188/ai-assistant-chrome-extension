# Creator Checker Agent

## Overview
A simple agent that provides information about the project creator. This agent is designed to answer queries about who created the project and how to contact them.

## Usage

### Prerequisites
- Run the terminal as administrator
- Navigate to the `backend/agents` folder
- Enable the virtual environment
- Navigate to the `backend/agents/src` folder

### Running the Agent
```bash
adk run creator_checker
```

## Features
- Returns the creator's name
- Provides website URL
- Provides GitHub profile
- Provides email contact

## Arguments
This agent does not require any arguments. Simply ask questions about the project creator.

## Example Queries
```
"Who created this project?"
"What is the creator's website?"
"How can I contact the creator?"
"Tell me about the project creator"
```

## Example Response
```json
{
  "name": "Li Guangyi",
  "website": "https://www.v2think.com",
  "github": "https://github.com/hh54188",
  "email": "liguangyi08@gmail.com"
}
```

## API Keys Required
### Required API Keys
- `GOOGLE_API_KEY` - For Gemini model access

### `.env` Configuration
Create a `.env` file in the `backend/agents` directory:
```
GOOGLE_GENAI_USE_VERTEXAI=0
GOOGLE_API_KEY=AIxxx
```

## Model Configuration
- Model: `gemini-2.5-flash`
- Agent Name: `creator_checker_agent`

## Technical Details
- Location: `backend/agents/src/creator_checker/agent.py`
- Type: LLM Agent
- Tools: `get_project_creator()` function

