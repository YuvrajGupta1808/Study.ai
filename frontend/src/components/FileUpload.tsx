import { useCallback, useState } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

const FileUpload = ({ onFilesSelected }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  return (
    <div
      className={`upload-zone p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragging ? 'upload-zone-active' : 'hover:border-muted-foreground/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        multiple
        accept=".pdf,.docx,.xlsx,.csv"
        className="hidden"
        onChange={handleFileInput}
      />
      
      <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
        isDragging ? 'bg-primary/30 text-primary scale-110' : 'bg-muted text-muted-foreground'
      }`}>
        <Upload className="w-6 h-6" />
      </div>
      
      <p className="text-foreground font-medium mb-1">
        Drop files here or click to browse
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Upload your documents to start building knowledge
      </p>
      
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {['PDF', 'DOCX', 'XLSX', 'CSV'].map((format) => (
          <span
            key={format}
            className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            {format}
          </span>
        ))}
      </div>
    </div>
  );
};

export default FileUpload;
