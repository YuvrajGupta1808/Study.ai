import type { ChatMessage as Message } from '@/types';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const formatMessageContent = (content: string) => {
  // Split content into lines
  const lines = content.split('\n');
  const formatted: JSX.Element[] = [];
  
  lines.forEach((line, index) => {
    // Headers (###)
    if (line.startsWith('### ')) {
      formatted.push(
        <h3 key={index} className="text-base font-semibold mt-4 mb-2 text-foreground">
          {line.replace('### ', '')}
        </h3>
      );
    }
    // Bold text (**text**)
    else if (line.includes('**')) {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      formatted.push(
        <p key={index} className="text-sm leading-relaxed mb-2">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}
        </p>
      );
    }
    // List items (- )
    else if (line.startsWith('- ')) {
      formatted.push(
        <div key={index} className="flex gap-2 mb-1.5 ml-2">
          <span className="text-primary mt-1">•</span>
          <span className="text-sm leading-relaxed flex-1">{line.replace('- ', '')}</span>
        </div>
      );
    }
    // Links
    else if (line.includes('](') && line.includes('[')) {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = line.split(linkRegex);
      formatted.push(
        <p key={index} className="text-sm leading-relaxed mb-2">
          {parts.map((part, i) => {
            if (i % 3 === 1) {
              return <a key={i} href={parts[i + 1]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{part}</a>;
            }
            if (i % 3 === 2) return null;
            return <span key={i}>{part}</span>;
          })}
        </p>
      );
    }
    // Regular text
    else if (line.trim()) {
      formatted.push(
        <p key={index} className="text-sm leading-relaxed mb-2">
          {line}
        </p>
      );
    }
    // Empty line
    else {
      formatted.push(<div key={index} className="h-2" />);
    }
  });
  
  return formatted;
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div 
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''} ${
        isUser ? 'animate-slide-in-right' : 'animate-slide-in-left'
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-gradient-to-br from-muted to-muted/50 border border-border/50'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-primary" />
        )}
      </div>
      
      <div className={`max-w-[85%] px-5 py-4 rounded-2xl ${
        isUser 
          ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-lg shadow-primary/20' 
          : 'bg-card/80 backdrop-blur-sm border border-border/50 rounded-tl-sm text-foreground'
      }`}>
        <div className={isUser ? 'text-primary-foreground' : 'text-foreground/90'}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          ) : (
            <div className="space-y-1">
              {formatMessageContent(message.content)}
            </div>
          )}
        </div>
        <p className={`text-xs mt-3 ${
          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
