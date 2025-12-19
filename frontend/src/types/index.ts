export interface Document {
  id: string;
  name: string;
  size: number;
  type: 'pdf' | 'docx' | 'xlsx' | 'csv';
  status: 'uploading' | 'processing' | 'indexed' | 'error';
  uploadedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface KnowledgeStats {
  documents: number;
  entities: number;
  relationships: number;
}
