import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import type { ChatMessage as Message } from '@/types';

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
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

const ChatPanel = ({ messages, isTyping, onSendMessage, hasDocuments }: ChatPanelProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {messages.length === 0 && !isTyping ? (
          <WelcomeMessage />
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border/50">
        {!hasDocuments && messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mb-3">
            Upload documents to unlock full capabilities
          </p>
        )}
        <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};

export default ChatPanel;
