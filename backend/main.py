"""
Main application for PDF processing and Neo4j vector retrieval
"""
import os
import asyncio
from dotenv import load_dotenv
from structure.neo4j.setup import upload
from agent import docs_agent

# Load environment variables
load_dotenv()

async def main():
    """Main application flow"""
    
    # Step 1: Setup Neo4j and process demo PDF
    print("\n📋 Step 1: Setting up Neo4j and processing PDF...")
    setup_success = await upload()
    
    if not setup_success:
        print("❌ Setup failed. Please check your Neo4j connection and try again.")
        return
    
    print("✅ Setup completed successfully!")
    
    # Step 2: Test the agent with sample queries
    print("\n📋 Step 2: Testing the agent with sample queries...")
    
    test_queries = [
        "What is diffusion models?",
        "Tell me about details of Encoder to decoder",
        "Whats playground v3?",
        "What challenges does AI face in healthcare?"
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n🔍 Test Query {i}: {query}")
        print("-" * 40)
        
        try:
            response = docs_agent(query)
            print(f"🤖 Agent Response:\n{response}")
        except Exception as e:
            print(f"❌ Error processing query: {e}")
        
        print("\n" + "="*50)
    
    # Step 3: Interactive mode
    print("\n📋 Step 3: Interactive mode")
    print("You can now ask questions about the processed document.")
    print("Type 'exit' to quit.\n")
    
    while True:
        try:
            user_input = input("You > ")
            if user_input.lower() in ['exit', 'quit', 'q']:
                break
            
            if user_input.strip():
                response = docs_agent(user_input)
                print(f"\n🤖 Agent: {response}\n")
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

def run_setup_only():
    """Run only the setup process"""
    print("🔧 Running Neo4j setup only...")
    asyncio.run(upload())

def run_interactive():
    """Run interactive mode only (assumes setup is already done)"""
    print("💬 Starting interactive mode...")
    print("Ask questions about the processed document. Type 'exit' to quit.\n")
    
    while True:
        try:
            user_input = input("You > ")
            if user_input.lower() in ['exit', 'quit', 'q']:
                break
            
            if user_input.strip():
                response = docs_agent(user_input)
                print(f"\n🤖 Agent: {response}\n")
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "setup":
            run_setup_only()
        elif sys.argv[1] == "interactive":
            run_interactive()
        else:
            print("Usage: python main.py [setup|interactive]")
            print("  setup      - Run Neo4j setup and PDF processing only")
            print("  interactive - Run interactive mode only")
            print("  (no args)  - Run full flow")
    else:
        asyncio.run(main())