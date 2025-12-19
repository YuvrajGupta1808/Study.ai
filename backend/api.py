"""
FastAPI server for PDF processing and Neo4j vector retrieval
"""
import os
import asyncio
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import shutil

from dotenv import load_dotenv
from structure.neo4j.setup import upload, Neo4jSetup
from agent import docs_agent
from tools.memory import clear_all_memories

# Load environment variables
load_dotenv()

app = FastAPI(title="KnowledgeForge API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo (replace with database in production)
documents_db = []
stats_db = {"documents": 0, "entities": 0, "relationships": 0}

# Pydantic models
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime

class DocumentResponse(BaseModel):
    id: str
    name: str
    size: int
    type: str
    status: str
    uploadedAt: datetime

class StatsResponse(BaseModel):
    documents: int
    entities: int
    relationships: int

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "KnowledgeForge API is running"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/upload", response_model=List[DocumentResponse])
async def upload_documents(files: List[UploadFile] = File(...)):
    """
    Upload and process documents
    """
    processed_docs = []
    
    for file in files:
        try:
            # Generate unique ID
            doc_id = f"doc_{len(documents_db)}_{int(datetime.now().timestamp())}"
            
            # Save file temporarily
            temp_dir = tempfile.mkdtemp()
            temp_path = os.path.join(temp_dir, file.filename)
            
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Get file info
            file_size = os.path.getsize(temp_path)
            file_ext = file.filename.split('.')[-1].lower()
            
            # Create document record
            doc = {
                "id": doc_id,
                "name": file.filename,
                "size": file_size,
                "type": file_ext,
                "status": "processing",
                "uploadedAt": datetime.now(),
                "path": temp_path
            }
            
            documents_db.append(doc)
            
            # Process document asynchronously (in background)
            asyncio.create_task(process_document(doc_id, temp_path))
            
            processed_docs.append(DocumentResponse(**doc))
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error uploading {file.filename}: {str(e)}")
    
    return processed_docs

async def process_document(doc_id: str, file_path: str):
    """
    Process document in background and upload to Neo4j
    """
    try:
        print(f"📤 Starting processing for document {doc_id}: {file_path}")
        
        # Run Neo4j upload with the actual file path
        success = await upload(file_path)
        
        # Update document status
        for doc in documents_db:
            if doc["id"] == doc_id:
                doc["status"] = "indexed" if success else "error"
                print(f"✅ Document {doc_id} status updated to: {doc['status']}")
                break
        
        # Update stats if successful
        if success:
            stats_db["documents"] += 1
            # TODO: Get actual entity and relationship counts from Neo4j
            stats_db["entities"] += 12  # Mock value
            stats_db["relationships"] += 8  # Mock value
            print(f"📊 Stats updated: {stats_db}")
        
        # Clean up temp file after processing
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                temp_dir = os.path.dirname(file_path)
                if os.path.exists(temp_dir):
                    os.rmdir(temp_dir)
                print(f"🗑️ Cleaned up temp file: {file_path}")
        except Exception as cleanup_error:
            print(f"⚠️ Cleanup warning: {cleanup_error}")
            
    except Exception as e:
        print(f"❌ Error processing document {doc_id}: {e}")
        import traceback
        traceback.print_exc()
        for doc in documents_db:
            if doc["id"] == doc_id:
                doc["status"] = "error"
                break

@app.get("/api/documents", response_model=List[DocumentResponse])
async def get_documents():
    """
    Get all uploaded documents
    """
    return [DocumentResponse(**doc) for doc in documents_db]

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """
    Get knowledge base statistics
    """
    return StatsResponse(**stats_db)

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Chat with the AI agent about uploaded documents
    """
    try:
        print(f"\n=== Chat Request ===")
        print(f"Message: {request.message}")
        
        # Check if any documents are indexed
        indexed_docs = [doc for doc in documents_db if doc["status"] == "indexed"]
        print(f"Indexed documents: {len(indexed_docs)}")
        
        if not indexed_docs:
            return {
                "id": f"msg_{int(datetime.now().timestamp())}",
                "role": "assistant",
                "content": "Please upload and index some documents first before asking questions.",
                "timestamp": datetime.now().isoformat()
            }
        
        # Get response from agent - Strands Agent returns an AgentResult object
        print("Calling docs_agent...")
        agent_result = docs_agent(request.message)
        
        print(f"Agent result type: {type(agent_result)}")
        print(f"Agent result attributes: {dir(agent_result)}")
        
        # Extract the text content from AgentResult
        response_text = None
        
        # Try different possible attributes
        if hasattr(agent_result, 'data'):
            response_text = agent_result.data
            print(f"Using .data attribute")
        elif hasattr(agent_result, 'content'):
            response_text = agent_result.content
            print(f"Using .content attribute")
        elif hasattr(agent_result, 'output'):
            response_text = agent_result.output
            print(f"Using .output attribute")
        elif hasattr(agent_result, 'text'):
            response_text = agent_result.text
            print(f"Using .text attribute")
        else:
            # Fallback: convert to string
            response_text = str(agent_result)
            print(f"Using str() conversion")
        
        # Ensure it's a string
        if not isinstance(response_text, str):
            response_text = str(response_text)
        
        print(f"Response text: {response_text[:200]}...")
        print(f"=== End Chat Request ===\n")
        
        return {
            "id": f"msg_{int(datetime.now().timestamp())}",
            "role": "assistant",
            "content": response_text,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Chat error: {error_details}")  # Log the full error
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: str):
    """
    Delete a document
    """
    global documents_db
    documents_db = [doc for doc in documents_db if doc["id"] != doc_id]
    return {"status": "success", "message": f"Document {doc_id} deleted"}

@app.post("/api/clear")
async def clear_all():
    """
    Clear all RAG documents, memories, and start a new session
    """
    try:
        results = {
            "neo4j_cleared": False,
            "memories_cleared": False,
            "documents_cleared": False,
            "stats_reset": False
        }
        
        # Clear Neo4j database
        setup = Neo4jSetup()
        if setup.connect():
            results["neo4j_cleared"] = setup.clear_database()
            setup.close()
        
        # Clear MemMachine memories
        memory_result = clear_all_memories()
        results["memories_cleared"] = memory_result.get("success", False)
        
        # Clear in-memory documents
        global documents_db, stats_db
        documents_db = []
        results["documents_cleared"] = True
        
        # Reset stats
        stats_db = {"documents": 0, "entities": 0, "relationships": 0}
        results["stats_reset"] = True
        
        success = all(results.values())
        
        return {
            "status": "success" if success else "partial",
            "message": "All data cleared successfully" if success else "Some operations failed",
            "details": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
