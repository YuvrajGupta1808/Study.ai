import { FileText, MessageSquare } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'documents' | 'chat';
  onTabChange: (tab: 'documents' | 'chat') => void;
  unreadCount?: number;
}

const MobileNav = ({ activeTab, onTabChange, unreadCount = 0 }: MobileNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-glass-border p-2 lg:hidden z-50">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onTabChange('documents')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
            activeTab === 'documents'
              ? 'bg-primary/20 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-xs font-medium">Documents</span>
        </button>
        
        <button
          onClick={() => onTabChange('chat')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all relative ${
            activeTab === 'chat'
              ? 'bg-primary/20 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs font-medium">Chat</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-8 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileNav;
