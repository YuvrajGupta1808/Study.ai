"""
MemMachine Memory Tool for Strands Agent
"""
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from strands import tool

load_dotenv()

MEMMACHINE_URL = os.getenv("MEMMACHINE_URL", "http://localhost:8080")
MEMMACHINE_API_KEY = os.getenv("MEMMACHINE_API_KEY", "")

DEFAULT_ORG_ID = "knowledgeforge"
DEFAULT_PROJECT_ID = "default"

# Try to import MemMachine, but make it optional
try:
    from memmachine import MemMachineClient
    client = MemMachineClient(
        base_url=MEMMACHINE_URL,
        api_key=MEMMACHINE_API_KEY if MEMMACHINE_API_KEY else None
    )
    MEMMACHINE_AVAILABLE = True
except ImportError:
    client = None
    MEMMACHINE_AVAILABLE = False
    print("⚠️  MemMachine not installed. Memory features will be disabled.")

def ensure_project():
    if not MEMMACHINE_AVAILABLE or not client:
        return False
    try:
        client.get_project(org_id=DEFAULT_ORG_ID, project_id=DEFAULT_PROJECT_ID)
        return True
    except Exception:
        try:
            client.create_project(
                org_id=DEFAULT_ORG_ID,
                project_id=DEFAULT_PROJECT_ID,
                description="KnowledgeForge document analysis project"
            )
            return True
        except Exception as e:
            print(f"Warning: Could not create project: {e}")
            return False

@tool
def store_memory(content: str, user_id: str = "default_user") -> str:
    if not MEMMACHINE_AVAILABLE:
        return "Memory storage unavailable: MemMachine not installed"
    try:
        if not ensure_project():
            return "Failed to ensure project exists"
        client.add_memories(
            org_id=DEFAULT_ORG_ID,
            project_id=DEFAULT_PROJECT_ID,
            messages=[{"content": content, "producer": user_id}]
        )
        return f"Memory stored for {user_id}"
    except Exception as e:
        return f"Failed to store memory: {str(e)}"

@tool
def retrieve_memories(query: str, user_id: str = "default_user", limit: int = 5) -> str:
    if not MEMMACHINE_AVAILABLE:
        return "Memory retrieval unavailable: MemMachine not installed"
    try:
        if not ensure_project():
            return "Failed to ensure project exists"
        results = client.search_memories(
            org_id=DEFAULT_ORG_ID,
            project_id=DEFAULT_PROJECT_ID,
            query=query,
            top_k=limit,
            filter={"producer": user_id}
        )
        if not results or not results.get('memories'):
            return "No relevant memories found."
        memories_list = [f"{i+1}. {m.get('content', 'N/A')}" for i, m in enumerate(results['memories'])]
        return "Relevant memories:\n" + "\n".join(memories_list)
    except Exception as e:
        return f"Failed to retrieve memories: {str(e)}"

@tool
def get_all_memories(user_id: str = "default_user") -> str:
    if not MEMMACHINE_AVAILABLE:
        return "Memory retrieval unavailable: MemMachine not installed"
    try:
        if not ensure_project():
            return "Failed to ensure project exists"
        results = client.list_memories(
            org_id=DEFAULT_ORG_ID,
            project_id=DEFAULT_PROJECT_ID,
            page_size=10,
            page_num=1,
            filter={"producer": user_id}
        )
        if not results or not results.get('memories'):
            return "No memories found."
        memories_list = [f"{i+1}. {m.get('content', 'N/A')}" for i, m in enumerate(results['memories'])]
        return f"All memories:\n" + "\n".join(memories_list)
    except Exception as e:
        return f"Failed to get memories: {str(e)}"

def clear_all_memories() -> Dict[str, Any]:
    """
    Clear all memories from MemMachine
    
    Returns:
        Dictionary with success status and message
    """
    if not MEMMACHINE_AVAILABLE:
        return {
            "success": True,  # Return success since there's nothing to clear
            "message": "MemMachine not installed - no memories to clear"
        }
    
    try:
        # Delete all memories by deleting and recreating the project
        try:
            client.delete_project(org_id=DEFAULT_ORG_ID, project_id=DEFAULT_PROJECT_ID)
        except Exception:
            pass  # Project might not exist
        
        # Recreate the project
        client.create_project(
            org_id=DEFAULT_ORG_ID,
            project_id=DEFAULT_PROJECT_ID,
            description="KnowledgeForge document analysis project"
        )
        
        return {
            "success": True,
            "message": "All memories cleared successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to clear memories: {str(e)}"
        }
