import { FileText, Tags, GitBranch, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { KnowledgeStats as Stats } from '@/types';

interface KnowledgeStatsProps {
  stats: Stats;
}

const KnowledgeStats = ({ stats }: KnowledgeStatsProps) => {
  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
        <Network className="w-4 h-4" />
        Knowledge Graph
      </h3>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats.documents}</p>
          <p className="text-xs text-muted-foreground">Documents</p>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <Tags className="w-4 h-4" />
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats.entities}</p>
          <p className="text-xs text-muted-foreground">Entities</p>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <GitBranch className="w-4 h-4" />
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats.relationships}</p>
          <p className="text-xs text-muted-foreground">Relationships</p>
        </div>
      </div>
      
      <Button 
        variant="secondary" 
        className="w-full text-sm bg-muted hover:bg-muted/80 text-muted-foreground"
        disabled={stats.documents === 0}
      >
        <Network className="w-4 h-4 mr-2" />
        View Graph
      </Button>
    </div>
  );
};

export default KnowledgeStats;
