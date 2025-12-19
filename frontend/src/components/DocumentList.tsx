import { FileQuestion } from 'lucide-react';
import DocumentCard from './DocumentCard';
import type { Document } from '@/types';

interface DocumentListProps {
  documents: Document[];
}

const DocumentList = ({ documents }: DocumentListProps) => {
  if (documents.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <FileQuestion className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No documents uploaded yet
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Upload files above to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground px-1">
        Uploaded Documents ({documents.length})
      </h3>
      <div className="space-y-2">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
