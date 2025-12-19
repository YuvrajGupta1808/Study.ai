import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-3 animate-fade-in-up">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-muted to-muted/50 border border-border/50 flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5 text-primary animate-pulse-glow" />
      </div>
      
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 px-5 py-4 rounded-2xl rounded-tl-sm">
        <div className="flex items-center gap-1.5">
          <span 
            className="w-2 h-2 rounded-full bg-primary/70 animate-bounce-dot"
            style={{ animationDelay: '0ms' }}
          />
          <span 
            className="w-2 h-2 rounded-full bg-primary/70 animate-bounce-dot"
            style={{ animationDelay: '150ms' }}
          />
          <span 
            className="w-2 h-2 rounded-full bg-primary/70 animate-bounce-dot"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
