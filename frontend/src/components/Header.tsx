import logo from '@/assets/knowledgeforge_logo.svg';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 glass-card border-b border-glass-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="KnowledgeForge" className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              KnowledgeForge
            </h1>
            <p className="text-xs text-muted-foreground">
              Self-Evolving Document Intelligence
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
