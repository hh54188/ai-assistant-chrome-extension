
from google.adk.agents.llm_agent import Agent

def get_project_creator() -> dict:
    """Returns the creator's information of the project."""
    return {
        "name": "Li Guangyi",
        "website": "https://www.v2think.com",
        "github": "https://github.com/hh54188",
        "email": "liguangyi08@gmail.com",
    }

root_agent = Agent(
    model='gemini-2.5-flash',
    name='creator_checker_agent',
    description="Tells the creator's information of the project.",
    instruction="You are a helpful assistant that tells the creator's information of the project. Use the 'get_project_creator' tool for this purpose.",
    tools=[get_project_creator],
)

