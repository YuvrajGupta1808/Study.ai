"""
Neo4j Vector Retrieval Tool for Strands Agent
Provides vector search capabilities using Neo4j GraphRAG
"""
import os
import asyncio
from typing import List, Dict, Any
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
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.username = os.getenv("NEO4J_USERNAME", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = None
        self.vector_retriever = None
        self.rag = None
        self._initialize()
    
    def _initialize(self):
        """Initialize Neo4j connection and components"""
        try:
            self.driver = neo4j.GraphDatabase.driver(
                self.uri,
                auth=(self.username, self.password)
            )
            
            # Initialize embedder
            embedder = Embeddings()
            
            # Initialize vector retriever
            self.vector_retriever = VectorRetriever(
                self.driver,
                index_name="text_embeddings",
                embedder=embedder
            )
            
            # Initialize GraphRAG
            llm = LLM(model_name="gpt-4o-mini")
            self.rag = GraphRAG(llm=llm, retriever=self.vector_retriever)
            
        except Exception as e:
            print(f"Neo4j initialization error: {e}")
    
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
            if not self.rag:
                return {"error": "Neo4j not properly initialized"}
            
            # Perform GraphRAG search with retriever_config
            retriever_config = {"top_k": top_k}
            response = self.rag.search(query, retriever_config=retriever_config)
            
            return {
                "answer": response.answer,
                "query": query,
                "sources": getattr(response, 'sources', []),
                "success": True
            }
            
        except Exception as e:
            return {
                "error": f"Search failed: {str(e)}",
                "query": query,
                "success": False
            }
        
    def close(self):
        """Close Neo4j connection"""
        if self.driver:
            self.driver.close()

# Initialize the tool instance
neo4j_tool = Neo4jVectorTool()

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
    result = neo4j_tool.search_documents(query, top_k)
    
    if result.get("success"):
        return f"Query: {result['query']}\n\nAnswer: {result['answer']}"
    else:
        return f"Search failed: {result.get('error', 'Unknown error')}"
