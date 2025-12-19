"""
Neo4j Setup and Configuration
This module handles Neo4j database setup, schema creation, and initial configuration
"""
import os
import asyncio
from dotenv import load_dotenv
import neo4j
from neo4j_graphrag.llm import OpenAILLM as LLM
from neo4j_graphrag.embeddings.openai import OpenAIEmbeddings as Embeddings
from neo4j_graphrag.experimental.pipeline.kg_builder import SimpleKGPipeline


# Load environment variables
load_dotenv()

class Neo4jSetup:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.username = os.getenv("NEO4J_USERNAME", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = None
        
    def connect(self):
        """Establish connection to Neo4j database"""
        try:
            self.driver = neo4j.GraphDatabase.driver(
                self.uri,
                auth=(self.username, self.password)
            )
            # Test connection
            with self.driver.session() as session:
                result = session.run("RETURN 1 as test")
                print("✅ Neo4j connection successful")
                return True
        except Exception as e:
            print(f"❌ Neo4j connection failed: {e}")
            return False
    
    def clear_database(self):
        """Clear all nodes and relationships (use with caution)"""
        try:
            with self.driver.session() as session:
                session.run("MATCH (n) DETACH DELETE n")
                print("✅ Database cleared")
        except Exception as e:
            print(f"❌ Database clear failed: {e}")
    
    def close(self):
        """Close database connection"""
        if self.driver:
            self.driver.close()
            print("✅ Neo4j connection closed")

async def upload(file_path: str = None):
    """
    Upload and process document into Neo4j knowledge graph
    
    Args:
        file_path: Path to the document file to process
    
    Returns:
        bool: True if successful, False otherwise
    """
    setup = Neo4jSetup()
    
    if not setup.connect():
        return False
    
    # Use provided file path or fallback to default
    if file_path is None:
        file_path = "/Users/Yuvraj/Study.ai/backend/medium1.pdf"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        setup.close()
        return False
    
    # Initialize LLM and embedder
    llm = LLM(
        model_name="gpt-4o-mini",
        model_params={
            "response_format": {"type": "json_object"},
            "temperature": 0
        }
    )
    
    embedder = Embeddings()
    
    # Build knowledge graph from document
    try:
        # Determine if it's a PDF based on file extension
        is_pdf = file_path.lower().endswith('.pdf')
        
        kg_builder = SimpleKGPipeline(
            llm=llm,
            driver=setup.driver,
            embedder=embedder,
            from_pdf=is_pdf
        )
        
        print(f"📄 Processing document: {file_path}")
        await kg_builder.run_async(file_path=file_path)
        print("✅ Knowledge graph built successfully")
        
    except Exception as e:
        print(f"❌ Document processing failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        setup.close()
    
    return True

if __name__ == "__main__":
    print("🚀 Starting Neo4j setup...")
    # You can provide a file path as argument or it will use the default
    import sys
    file_path = sys.argv[1] if len(sys.argv) > 1 else None
    asyncio.run(upload(file_path))
    print("✅ Setup complete!")