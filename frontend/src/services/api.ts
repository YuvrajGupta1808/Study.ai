const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Document {
    id: string;
    name: string;
    size: number;
    type: 'pdf' | 'docx' | 'xlsx' | 'csv';
    status: 'processing' | 'indexed' | 'error';
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

class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async healthCheck(): Promise<{ status: string; timestamp: string }> {
        const response = await fetch(`${this.baseUrl}/api/health`);
        if (!response.ok) throw new Error('Health check failed');
        return response.json();
    }

    async uploadDocuments(files: File[]): Promise<Document[]> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await fetch(`${this.baseUrl}/api/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }

        const data = await response.json();
        return data.map((doc: any) => ({
            ...doc,
            uploadedAt: new Date(doc.uploadedAt),
        }));
    }

    async getDocuments(): Promise<Document[]> {
        const response = await fetch(`${this.baseUrl}/api/documents`);
        if (!response.ok) throw new Error('Failed to fetch documents');

        const data = await response.json();
        return data.map((doc: any) => ({
            ...doc,
            uploadedAt: new Date(doc.uploadedAt),
        }));
    }

    async getStats(): Promise<KnowledgeStats> {
        const response = await fetch(`${this.baseUrl}/api/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    }

    async sendMessage(message: string): Promise<ChatMessage> {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Chat request failed');
        }

        const data = await response.json();
        return {
            ...data,
            timestamp: new Date(data.timestamp),
        };
    }

    async deleteDocument(docId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/documents/${docId}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete document');
    }

    async clearAll(): Promise<{ status: string; message: string; details: any }> {
        const response = await fetch(`${this.baseUrl}/api/clear`, {
            method: 'POST',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to clear data');
        }

        return response.json();
    }
}

export const apiService = new ApiService();
