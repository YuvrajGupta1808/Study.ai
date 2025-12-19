import { FileText, FileSpreadsheet, File, Check, Loader2 } from 'lucide-react';
import type { Document } from '@/types';

interface DocumentCardProps {
  document: Document;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: Document['type']) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-400" />;
    case 'docx':
      return <FileText className="w-5 h-5 text-blue-400" />;
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
    default:
      return <File className="w-5 h-5 text-muted-foreground" />;
  }
};

const DocumentCard = ({ document }: DocumentCardProps) => {
  const isProcessing = document.status === 'processing' || document.status === 'uploading';
  const isIndexed = document.status === 'indexed';

  return (
    <div className="glass-card-hover p-4 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted/50">
          {getFileIcon(document.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate" title={document.name}>
            {document.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatFileSize(document.size)}
          </p>
        </div>
        
        <div className="flex-shrink-0">
          {isProcessing && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing...
            </span>
          )}
          {isIndexed && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
              <Check className="w-3 h-3" />
              Indexed
            </span>
          )}
        </div>
      </div>
      
      {isProcessing && (
        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-purple-400 animate-progress rounded-full" />
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
