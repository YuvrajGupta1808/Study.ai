"""
Neo4j Setup and Configuration
This module handles Neo4j database setup, schema creation, and initial configuration
"""
import os
import asyncio
from typing import Optional
from dotenv import load_dotenv
import neo4j
from neo4j_graphrag.llm import OpenAILLM as LLM
from neo4j_graphrag.embeddings.openai import OpenAIEmbeddings as Embeddings
from neo4j_graphrag.experimental.pipeline.kg_builder import SimpleKGPipeline

# Load environment variables
load_dotenv()

class Neo4jSetup:
    _instance: Optional['Neo4jSetup'] = None
    _driver: Optional[neo4j.Driver] = None
    
    def __new__(cls):
        """Singleton pattern to reuse driver connection"""
        if cls._instance is None:
            cls._instance = super(Neo4jSetup, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.username = os.getenv("NEO4J_USERNAME", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        
    @property
    def driver(self):
        """Get or create driver with connection pooling"""
        if Neo4jSetup._driver is None:
            Neo4jSetup._driver = neo4j.GraphDatabase.driver(
                self.uri,
                auth=(self.username, self.password),
                max_connection_lifetime=3600,
                max_connection_pool_size=50,
                connection_acquisition_timeout=60
            )
        return Neo4jSetup._driver
        
    def connect(self):
        """Establish connection to Neo4j database"""
        try:
            self.driver.verify_connectivity()
            print("✅ Neo4j connection successful")
            return True
        except Exception as e:
            print(f"❌ Neo4j connection failed: {e}")
            return False
    
    def clear_database(self):
        """Clear all nodes, relationships, and vector indexes (use with caution)"""
        try:
            with self.driver.session() as session:
                # Drop the vector index first
                print("🗑️ Dropping vector index...")
                try:
                    session.run("DROP INDEX text_embeddings IF EXISTS")
                    print("✅ Vector index dropped")
                except Exception as idx_error:
                    print(f"⚠️ Could not drop index (may not exist): {idx_error}")
                
                # Delete all nodes and relationships
                print("🗑️ Deleting all nodes and relationships...")
                result = session.run("MATCH (n) DETACH DELETE n")
                result.consume()  # Ensure the query completes
                
                # Verify the database is empty
                count_result = session.run("MATCH (n) RETURN count(n) as count")
                count = count_result.single()["count"]
                
                if count == 0:
                    print("✅ Database cleared successfully")
                    return True
                else:
                    print(f"⚠️ Database still has {count} nodes after clear")
                    return False
        except Exception as e:
            print(f"❌ Database clear failed: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def close(self):
        """Close database connection (only call when shutting down)"""
        if Neo4jSetup._driver:
            Neo4jSetup._driver.close()
            Neo4jSetup._driver = None
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
    
    if file_path is None:
        print("❌ No file path provided")
        return False
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    try:
        # Initialize LLM and embedder
        llm = LLM(
            model_name="gpt-4o-mini",
            model_params={
                "response_format": {"type": "json_object"},
                "temperature": 0
            }
        )
        
        embedder = Embeddings()
        
        # Determine if it's a PDF
        is_pdf = file_path.lower().endswith('.pdf')
        
        # Build knowledge graph
        kg_builder = SimpleKGPipeline(
            llm=llm,
            driver=setup.driver,
            embedder=embedder,
            from_pdf=is_pdf
        )
        
        print(f"📄 Processing document: {file_path}")
        await kg_builder.run_async(file_path=file_path)
        print("✅ Knowledge graph built successfully")
        
        # Ensure vector index exists
        _ensure_vector_index(setup.driver)
        
        return True
        
    except Exception as e:
        print(f"❌ Document processing failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def _ensure_vector_index(driver: neo4j.Driver):
    """Ensure the vector index exists for embeddings"""
    try:
        with driver.session() as session:
            # Check if index exists
            result = session.run("SHOW INDEXES WHERE name = 'text_embeddings'")
            if not list(result):
                print("🔧 Creating vector index 'text_embeddings'...")
                session.run("""
                    CREATE VECTOR INDEX text_embeddings IF NOT EXISTS
                    FOR (c:Chunk)
                    ON c.embedding
                    OPTIONS {indexConfig: {
                        `vector.dimensions`: 1536,
                        `vector.similarity_function`: 'cosine'
                    }}
                """)
                print("✅ Vector index created")
            else:
                print("✅ Vector index already exists")
    except Exception as e:
        print(f"⚠️ Vector index check/creation failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting Neo4j setup...")
    # You can provide a file path as argument or it will use the default
    import sys
    file_path = sys.argv[1] if len(sys.argv) > 1 else None
    asyncio.run(upload(file_path))
    print("✅ Setup complete!")