# KnowledgeForge

An AI-powered knowledge management and document analysis platform that combines intelligent document processing with graph-based knowledge representation.

## 🚀 Features

- **Document Upload & Analysis**: Upload PDFs and other documents for AI-powered analysis
- **Knowledge Graph**: Neo4j-powered graph database for storing and visualizing knowledge relationships
- **AI Agent Integration**: Intelligent agents for document processing and question answering
- **Web Search Integration**: Enhanced research capabilities with web search tools
- **Modern UI**: React-based frontend with shadcn/ui components and Tailwind CSS
- **Real-time Chat**: Interactive chat interface for querying your knowledge base

## 🏗️ Architecture

```
KnowledgeForge/
├── backend/           # Python FastAPI backend
│   ├── agent.py      # AI agent implementation
│   ├── main.py       # FastAPI application
│   ├── tools/        # Agent tools (Neo4j, web search)
│   └── structure/    # Database setup scripts
└── frontend/         # React TypeScript frontend
    ├── src/
    │   ├── components/  # UI components
    │   ├── pages/      # Application pages
    │   └── types/      # TypeScript definitions
    └── public/         # Static assets
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Neo4j** - Graph database for knowledge representation
- **Python Agent Framework** - AI agent implementation
- **Web Search Tools** - Enhanced research capabilities

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **shadcn/ui** - Modern UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching

## 🚀 Getting Started

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **Neo4j Database** (local or cloud instance)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Set up Neo4j database:
   ```bash
   python structure/neo4j/setup.py
   ```

6. Start the backend server:
   ```bash
   python main.py
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## 📝 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password

# API Keys
OPENAI_API_KEY=your_openai_api_key
SEARCH_API_KEY=your_search_api_key

# Application Settings
DEBUG=True
CORS_ORIGINS=http://localhost:5173
```

## 🔧 Development

### Backend Development

- **Run tests**: `python -m pytest`
- **Format code**: `black .`
- **Lint code**: `flake8 .`
- **Type checking**: `mypy .`

### Frontend Development

- **Run dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Lint code**: `npm run lint`
- **Type checking**: `npx tsc --noEmit`

## 📚 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation powered by FastAPI's automatic OpenAPI generation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and AI frameworks
- Inspired by the need for intelligent knowledge management
- Thanks to the open-source community for the amazing tools and libraries

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**KnowledgeForge** - Transforming documents into actionable knowledge through AI-powered analysis and graph-based insights.