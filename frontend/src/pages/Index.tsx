import ChatPanel from '@/components/ChatPanel';
import DocumentList from '@/components/DocumentList';
import FileUpload from '@/components/FileUpload';
import Header from '@/components/Header';
import KnowledgeStats from '@/components/KnowledgeStats';
import MobileNav from '@/components/MobileNav';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import type { ChatMessage, Document, KnowledgeStats as Stats } from '@/types';
import { useCallback, useEffect, useState } from 'react';

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [stats, setStats] = useState<Stats>({ documents: 0, entities: 0, relationships: 0 });
  const [activeTab, setActiveTab] = useState<'documents' | 'chat'>('documents');
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const docs = await apiService.getDocuments();
        setDocuments(docs);
        
        const statsData = await apiService.getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    try {
      toast({
        title: "Uploading documents...",
        description: `Processing ${files.length} file(s)`,
      });

      const uploadedDocs = await apiService.uploadDocuments(files);
      setDocuments((prev) => [...prev, ...uploadedDocs]);

      toast({
        title: "Upload successful",
        description: "Documents are being processed",
      });

      // Poll for document status updates
      const pollInterval = setInterval(async () => {
        const docs = await apiService.getDocuments();
        setDocuments(docs);
        
        const allProcessed = docs.every(d => d.status !== 'processing');
        if (allProcessed) {
          clearInterval(pollInterval);
          // Reload stats after processing
          const statsData = await apiService.getStats();
          setStats(statsData);
        }
      }, 2000);

      // Clear interval after 30 seconds
      setTimeout(() => clearInterval(pollInterval), 30000);

    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const aiMessage = await apiService.sendMessage(content);
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Chat error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 pb-24 lg:pb-6">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] lg:h-[calc(100vh-120px)]">
          {/* Left Panel - Documents */}
          <div className={`lg:w-[40%] flex flex-col gap-4 overflow-hidden ${
            activeTab === 'documents' ? 'flex' : 'hidden lg:flex'
          }`}>
            <FileUpload onFilesSelected={handleFilesSelected} />
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
              <DocumentList documents={documents} />
            </div>
            
            <KnowledgeStats stats={stats} />
          </div>
          
          {/* Right Panel - Chat */}
          <div className={`lg:w-[60%] glass-card overflow-hidden ${
            activeTab === 'chat' ? 'flex flex-col flex-1' : 'hidden lg:flex lg:flex-col'
          }`}>
            <ChatPanel
              messages={messages}
              isTyping={isTyping}
              onSendMessage={handleSendMessage}
              hasDocuments={documents.length > 0}
            />
          </div>
        </div>
      </main>
      
      <MobileNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default Index;
