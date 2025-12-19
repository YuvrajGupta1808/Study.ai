import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Brain, MessageSquare, Link2, Zap, Shield, Upload, Search, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import logo from '@/assets/knowledgeforge_logo.svg';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
    onClick={(e) => {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }}
  >
    {children}
  </a>
);

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any; title: string; description: string; delay: number }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`glass-card-hover p-6 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

const StepCard = ({ number, title, description, icon: Icon, delay }: { number: number; title: string; description: string; icon: any; delay: number }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  return (
    <div 
      ref={ref}
      className={`flex flex-col items-center text-center transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center mb-4 relative">
        <Icon className="w-7 h-7 text-primary-foreground" />
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-primary text-primary text-xs font-bold flex items-center justify-center">
          {number}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs">{description}</p>
    </div>
  );
};

const AnimatedSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: FileText, title: 'Multi-Format Support', description: 'Upload PDFs, Word docs, spreadsheets, and more. We handle the complexity.' },
    { icon: Brain, title: 'Knowledge Graph', description: 'Automatically extract entities and relationships into a connected knowledge graph.' },
    { icon: MessageSquare, title: 'Natural Conversations', description: 'Ask questions in plain English and get intelligent, contextual answers.' },
    { icon: Link2, title: 'Connected Insights', description: 'Discover hidden connections across all your documents automatically.' },
    { icon: Zap, title: 'Self-Evolving AI', description: 'The more you use it, the smarter it gets. Continuous learning from your documents.' },
    { icon: Shield, title: 'Secure & Private', description: 'Your documents stay private. Enterprise-grade security and encryption.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0015] via-background to-[#1a0a2e]">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary) / 0.15) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="KnowledgeForge" className="w-10 h-10" />
            <span className="text-xl font-bold text-foreground">KnowledgeForge</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How it Works</NavLink>
            <NavLink href="#about">About</NavLink>
            <Link to="/app">
              <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
          <div className="md:hidden">
            <Link to="/app">
              <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-foreground">Transform Documents into</span>
              <br />
              <span className="gradient-text">Knowledge</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload any document. Ask anything. Get intelligent answers powered by knowledge graphs.
            </p>
            <Link to="/app">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-purple-400 hover:opacity-90 text-lg px-8 py-6 glow-primary transition-all duration-300 hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              No signup required • Free to try
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Powerful Features
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Everything you need to unlock the knowledge hidden in your documents.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} delay={index * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-24">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Three simple steps to transform your documents into actionable knowledge.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-purple-400 to-primary" />
            <StepCard
              number={1}
              icon={Upload}
              title="Upload"
              description="Drag and drop your documents. We support PDFs, Word, Excel, and more."
              delay={0}
            />
            <StepCard
              number={2}
              icon={Search}
              title="Extract"
              description="Our AI automatically extracts entities, relationships, and key insights."
              delay={150}
            />
            <StepCard
              number={3}
              icon={HelpCircle}
              title="Ask"
              description="Chat naturally with your documents. Get answers backed by your data."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <AnimatedSection className="max-w-4xl mx-auto px-6 text-center">
          <div className="glass-card p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to unlock your documents?
            </h2>
            <p className="text-muted-foreground mb-8">
              Start extracting knowledge from your documents in seconds.
            </p>
            <Link to="/app">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-purple-400 hover:opacity-90 text-lg px-8 py-6 glow-primary transition-all duration-300 hover:scale-105 animate-pulse-glow"
              >
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer id="about" className="relative py-12 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="KnowledgeForge" className="w-8 h-8" />
              <span className="text-lg font-semibold text-foreground">KnowledgeForge</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#how-it-works">How it Works</NavLink>
              <Link to="/app" className="hover:text-foreground transition-colors">Try Now</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for MemVerge + Neo4j Hackathon 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
