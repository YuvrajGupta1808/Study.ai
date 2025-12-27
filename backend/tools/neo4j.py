"""
Neo4j Vector Retrieval Tool for Strands Agent
Provides vector search capabilities using Neo4j GraphRAG
"""
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import neo4j
from neo4j_graphrag.llm import OpenAILLM as LLM
from neo4j_graphrag.embeddings.openai import OpenAIEmbeddings as Embeddings
from neo4j_graphrag.retrievers import VectorRetriever
from neo4j_graphrag.generation.graphrag import GraphRAG
from strands import tool

# Load environment variables
load_dotenv()

class Neo4jVectorTool:
    _instance: Optional['Neo4jVectorTool'] = None
    
    def __new__(cls):
        """Singleton pattern to ensure only one instance exists"""
        if cls._instance is None:
            cls._instance = super(Neo4jVectorTool, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Initialize connection (lazy initialization for retriever)"""
        if self._initialized:
            return
            
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.username = os.getenv("NEO4J_USERNAME", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        
        # Create driver with connection pooling
        self.driver = neo4j.GraphDatabase.driver(
            self.uri,
            auth=(self.username, self.password),
            max_connection_lifetime=3600,
            max_connection_pool_size=50,
            connection_acquisition_timeout=60
        )
        
        # Initialize embedder once
        self.embedder = Embeddings()
        
        # These will be initialized lazily when first search happens
        self.vector_retriever = None
        self.rag = None
        
        self._initialized = True
        print("✅ Neo4j driver initialized")
    
    def _ensure_retriever(self):
        """Lazy initialization of retriever and RAG (only when index exists)"""
        if self.rag is not None:
            return True
            
        try:
            # Check if index exists first
            with self.driver.session() as session:
                result = session.run("SHOW INDEXES WHERE name = 'text_embeddings'")
                if not list(result):
                    print("⚠️ Vector index 'text_embeddings' not found. Please upload documents first.")
                    return False
            
            # Initialize vector retriever
            self.vector_retriever = VectorRetriever(
                self.driver,
                index_name="text_embeddings",
                embedder=self.embedder
            )
            
            # Initialize GraphRAG
            llm = LLM(model_name="gpt-4o-mini")
            self.rag = GraphRAG(llm=llm, retriever=self.vector_retriever)
            
            print("✅ Neo4j GraphRAG initialized")
            return True
            
        except Exception as e:
            print(f"⚠️ GraphRAG initialization failed: {e}")
            return False
    
    def search_documents(self, query: str, top_k: int = 5) -> Dict[str, Any]:
        """
        Search documents using vector similarity
        
        Args:
            query: Search query string
            top_k: Number of top results to return
            
        Returns:
            Dictionary with search results and answer
        """
        try:
            # Ensure retriever is initialized
            if not self._ensure_retriever():
                return {
                    "error": "No documents indexed yet. Please upload documents first.",
                    "query": query,
                    "success": False
                }
            
            print(f"🔍 Searching Neo4j for: {query} (top_k={top_k})")
            
            # Perform GraphRAG search
            retriever_config = {"top_k": top_k}
            response = self.rag.search(query, retriever_config=retriever_config)
            
            print(f"✅ Search completed")
            
            return {
                "answer": response.answer,
                "query": query,
                "success": True
            }
            
        except Exception as e:
            print(f"❌ Search failed: {str(e)}")
            return {
                "error": f"Search failed: {str(e)}",
                "query": query,
                "success": False
            }
    
    def reset_retriever(self):
        """Reset the retriever and RAG instances (call after clearing database)"""
        self.vector_retriever = None
        self.rag = None
        print("🔄 Neo4j retriever reset")
    
    def close(self):
        """Close Neo4j connection"""
        if self.driver:
            self.driver.close()
            print("🔌 Neo4j connection closed")

# Global singleton instance - initialized once at module load
_neo4j_tool_instance = None

def get_neo4j_tool() -> Neo4jVectorTool:
    """Get or create the singleton Neo4j tool instance"""
    global _neo4j_tool_instance
    if _neo4j_tool_instance is None:
        _neo4j_tool_instance = Neo4jVectorTool()
    return _neo4j_tool_instance

@tool
def search_knowledge_base(query: str, top_k: int = 5) -> str:
    """
    Search the knowledge base using vector similarity
    
    Args:
        query: The search query
        top_k: Number of top results to return (default: 5)
        
    Returns:
        String containing the search results and answer
    """
    neo4j_tool = get_neo4j_tool()
    result = neo4j_tool.search_documents(query, top_k)
    
    if result.get("success"):
        return f"Query: {result['query']}\n\nAnswer: {result['answer']}"
    else:
        return f"Search failed: {result.get('error', 'Unknown error')}"
