# Import Agent and tools
import logging
import os
from dotenv import load_dotenv

from strands import Agent
from strands.models.openai import OpenAIModel
from tools import websearch
from tools.neo4j import search_knowledge_base

# Load environment variables
load_dotenv()

# Configure logging
logging.getLogger("strands").setLevel(
    logging.INFO
)

model = OpenAIModel(
    client_args={
        "api_key": os.getenv("OPENAI_API_KEY"),
    },
    model_id="gpt-4o-mini",
    params={
        "max_tokens": 1500,
        "temperature": 0.7,
    }
)

# Create a docs assistant agent with Neo4j vector retrieval
docs_agent = Agent(
    system_prompt="""You are Docs Analyse AI that provides detailed analysis of document materials.

You have access to:
1. A knowledge base with vector search capabilities through Neo4j
2. Web search for additional information
3. Document chunk retrieval for detailed context

When answering questions:
- First search the knowledge base for relevant information
- Use document chunks to provide specific details
- Supplement with web search if needed
- Provide comprehensive and accurate responses based on the available data""",
    tools=[websearch, search_knowledge_base],
    model=model
)

if __name__ == "__main__":
    # Run the agent in a loop for interactive conversation
    while True:
        user_input = input("\nYou > ")
        if user_input.lower() == "exit":
            break
        response = docs_agent(user_input)
