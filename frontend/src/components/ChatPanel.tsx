import type { ChatMessage as Message } from '@/types';
import { Plus, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
  hasDocuments: boolean;
}

const WelcomeMessage = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12 animate-fade-in-up">
    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
      <Sparkles className="w-8 h-8 text-primary" />
    </div>
    <h2 className="text-xl font-semibold text-foreground mb-2">
      Welcome to KnowledgeForge!
    </h2>
    <p className="text-muted-foreground mb-6 max-w-sm">
      Upload some documents on the left, then ask me anything about them.
    </p>
    <div className="space-y-2 text-left w-full max-w-sm">
      <p className="text-sm text-muted-foreground mb-3">Try questions like:</p>
      {[
        'What companies are mentioned in my documents?',
        'Summarize the key points',
        'Who are the main people discussed?',
      ].map((question, i) => (
        <div
          key={i}
          className="glass-card-hover p-3 text-sm text-foreground/80 cursor-pointer"
        >
          <span className="text-primary mr-2">•</span>
          {question}
        </div>
      ))}
    </div>
  </div>
);

const ChatPanel = ({ messages, isTyping, onSendMessage, onNewChat, hasDocuments }: ChatPanelProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleNewChatClick = () => {
    if (messages.length > 0) {
      setShowNewChatDialog(true);
    } else {
      onNewChat();
    }
  };

  const confirmNewChat = () => {
    setShowNewChatDialog(false);
    onNewChat();
  };

  return (
    <div className="flex flex-col h-full bg-background/30 backdrop-blur-sm">
      {/* Header with New Chat button */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-md">
          <h3 className="text-sm font-medium text-foreground">Chat</h3>
          <Button
            onClick={handleNewChatClick}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>
      )}

      {/* New Chat Confirmation Dialog */}
      <AlertDialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the current conversation. Your memories and document knowledge will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNewChat}>
              Start New Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {messages.length === 0 && !isTyping ? (
          <WelcomeMessage />
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-md">
        {!hasDocuments && messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mb-3">
            Upload documents to unlock full capabilities
          </p>
        )}
        <div className="max-w-4xl mx-auto">
          <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
