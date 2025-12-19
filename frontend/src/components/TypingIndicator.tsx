import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-3 animate-fade-in-up">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      
      <div className="glass-card px-4 py-3 max-w-xs">
        <div className="flex items-center gap-1">
          <span 
            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce-dot"
            style={{ animationDelay: '0ms' }}
          />
          <span 
            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce-dot"
            style={{ animationDelay: '150ms' }}
          />
          <span 
            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce-dot"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
