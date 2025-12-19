"""
MemMachine Memory Tool for Strands Agent
"""
import os
import requests
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
from strands import tool

load_dotenv()

MEMMACHINE_URL = os.getenv("MEMMACHINE_URL", "http://localhost:8080")
MEMMACHINE_API_KEY = os.getenv("MEMMACHINE_API_KEY", "")

DEFAULT_ORG_ID = "knowledgeforge"
DEFAULT_PROJECT_ID = "default"

# Check if MemMachine is available
try:
    response = requests.get(f"{MEMMACHINE_URL}/api/v2/health", timeout=5)
    MEMMACHINE_AVAILABLE = response.status_code == 200
    if MEMMACHINE_AVAILABLE:
        print("✓ MemMachine server is available")
except Exception as e:
    MEMMACHINE_AVAILABLE = False
    print(f"⚠️  MemMachine server not available: {e}")

def _get_headers() -> Dict[str, str]:
    """Get headers for API requests"""
    headers = {"Content-Type": "application/json"}
    if MEMMACHINE_API_KEY:
        headers["Authorization"] = f"Bearer {MEMMACHINE_API_KEY}"
    return headers

def _ensure_project() -> bool:
    """Ensure the project exists, create if it doesn't"""
    if not MEMMACHINE_AVAILABLE:
        return False
    
    try:
        # Try to get the project
        response = requests.post(
            f"{MEMMACHINE_URL}/api/v2/projects/get",
            json={"org_id": DEFAULT_ORG_ID, "project_id": DEFAULT_PROJECT_ID},
            headers=_get_headers(),
            timeout=10
        )
        if response.status_code == 200:
            return True
        
        # Project doesn't exist, create it
        response = requests.post(
            f"{MEMMACHINE_URL}/api/v2/projects",
            json={
                "org_id": DEFAULT_ORG_ID,
                "project_id": DEFAULT_PROJECT_ID,
                "description": "KnowledgeForge document analysis project"
            },
            headers=_get_headers(),
            timeout=10
        )
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"Warning: Could not ensure project: {e}")
        return False

@tool
def store_memory(content: str, user_id: str = "default_user", agent_id: str = "docs_agent") -> str:
    """Store a memory in MemMachine for later retrieval"""
    if not MEMMACHINE_AVAILABLE:
        return "Memory storage unavailable: MemMachine server not available"
    
    if not _ensure_project():
        return "Failed to ensure project exists"
    
    try:
        response = requests.post(
            f"{MEMMACHINE_URL}/api/v2/memories",
            json={
                "org_id": DEFAULT_ORG_ID,
                "project_id": DEFAULT_PROJECT_ID,
                "types": ["episodic", "semantic"],
                "messages": [{
                    "content": content,
                    "producer": user_id,
                    "produced_for": agent_id,
                    "role": "user",
                    "metadata": {
                        "user_id": user_id,
                        "agent_id": agent_id
                    }
                }]
            },
            headers=_get_headers(),
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            return f"✓ Memory stored for user: {user_id}"
        else:
            return f"Failed to store memory: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Failed to store memory: {str(e)}"

@tool
def retrieve_memories(query: str, user_id: str = "default_user", agent_id: str = "docs_agent", limit: int = 5) -> str:
    """Search and retrieve relevant memories based on a query"""
    if not MEMMACHINE_AVAILABLE:
        return "Memory retrieval unavailable: MemMachine server not available"
    
    if not _ensure_project():
        return "Failed to ensure project exists"
    
    try:
        filter_str = f"metadata.user_id={user_id}"
        
        response = requests.post(
            f"{MEMMACHINE_URL}/api/v2/memories/search",
            json={
                "org_id": DEFAULT_ORG_ID,
                "project_id": DEFAULT_PROJECT_ID,
                "query": query,
                "filter": filter_str,
                "top_k": limit,
                "types": ["episodic", "semantic"]
            },
            headers=_get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", {})
            
            memories_list = []
            
            # Get episodic memories
            episodic = content.get("episodic_memory", {})
            ltm_episodes = episodic.get("long_term_memory", {}).get("episodes", [])
            stm_episodes = episodic.get("short_term_memory", {}).get("episodes", [])
            
            for ep in ltm_episodes + stm_episodes:
                memories_list.append(ep.get("content", "N/A"))
            
            # Get semantic memories
            semantic = content.get("semantic_memory", [])
            for sem in semantic:
                memories_list.append(sem.get("value", "N/A"))
            
            if not memories_list:
                return "No relevant memories found."
            
            formatted = [f"{i+1}. {mem}" for i, mem in enumerate(memories_list[:limit])]
            return "Relevant memories:\n" + "\n".join(formatted)
        else:
            return f"Failed to retrieve memories: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Failed to retrieve memories: {str(e)}"

@tool
def get_all_memories(user_id: str = "default_user", agent_id: str = "docs_agent", limit: int = 10) -> str:
    """Get all memories for a user"""
    # Use search with a broad query to get all memories
    return retrieve_memories("user information preferences interests", user_id=user_id, agent_id=agent_id, limit=limit)

def clear_all_memories(user_id: str = "default_user", agent_id: str = "docs_agent") -> Dict[str, Any]:
    """
    Clear all memories from MemMachine for a specific user
    
    Returns:
        Dictionary with success status and message
    """
    if not MEMMACHINE_AVAILABLE:
        return {
            "success": True,
            "message": "MemMachine server not available - no memories to clear"
        }
    
    if not _ensure_project():
        return {
            "success": False,
            "message": "Failed to ensure project exists"
        }
    
    try:
        response = requests.post(
            f"{MEMMACHINE_URL}/api/v2/memories/episodic/delete",
            json={
                "org_id": DEFAULT_ORG_ID,
                "project_id": DEFAULT_PROJECT_ID,
                "user_id": user_id,
                "agent_id": agent_id
            },
            headers=_get_headers(),
            timeout=10
        )
        
        if response.status_code in [200, 204]:
            return {
                "success": True,
                "message": f"All memories cleared for user: {user_id}"
            }
        else:
            return {
                "success": False,
                "message": f"Failed to clear memories: {response.status_code} - {response.text}"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to clear memories: {str(e)}"
        }
