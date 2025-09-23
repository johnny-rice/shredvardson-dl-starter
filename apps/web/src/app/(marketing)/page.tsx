import { Button } from '@/components/Button';

export const metadata = {
  title: 'Ship Faster with AI-Ready Code',
  description:
    'A lightweight, LLM-friendly starter to go from idea to production without the bloat.',
  openGraph: { title: 'Ship Faster with AI-Ready Code' },
  twitter: { card: 'summary_large_image' },
};

export default function Marketing() {
  return (
    <main className="min-h-dvh bg-[hsl(var(--bg))] py-16 px-8">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-20" data-testid="smoke">
        <h1 className="text-5xl font-bold text-[hsl(var(--text))] mb-6">
          Ship Faster with AI-Ready Code
        </h1>
        <p className="text-xl text-[hsl(var(--text-muted))] mb-8 max-w-2xl mx-auto">
          A lightweight, LLM-friendly starter that gets you from idea to production without the bloat. 
          Built for developers who want to ship, not configure.
        </p>
        <div className="flex gap-4 justify-center">
          <Button className="text-lg px-8 py-3">Get Started</Button>
          <Button variant="ghost" className="text-lg px-8 py-3">View Docs</Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold text-center text-[hsl(var(--text))] mb-12">
          Why Choose This Starter?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-lg)] p-6 border border-[hsl(var(--border))]">
            <h3 className="text-xl font-semibold text-[hsl(var(--text))] mb-4">⚡ Zero Bloat</h3>
            <p className="text-[hsl(var(--text-muted))]">
              Clean, minimal codebase with only essential dependencies. No framework fatigue, 
              just the tools you need to build and ship.
            </p>
          </div>
          <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-lg)] p-6 border border-[hsl(var(--border))]">
            <h3 className="text-xl font-semibold text-[hsl(var(--text))] mb-4">🤖 AI-Optimized</h3>
            <p className="text-[hsl(var(--text-muted))]">
              Built with Claude and LLMs in mind. Clear patterns, excellent documentation, 
              and structured workflows that AI can understand and extend.
            </p>
          </div>
          <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-lg)] p-6 border border-[hsl(var(--border))]">
            <h3 className="text-xl font-semibold text-[hsl(var(--text))] mb-4">🔧 Recipe-Driven</h3>
            <p className="text-[hsl(var(--text-muted))]">
              Add features progressively with battle-tested recipes. Auth, payments, 
              database - each component slots in cleanly when you need it.
            </p>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="max-w-4xl mx-auto mb-20 bg-[hsl(var(--surface))] rounded-[var(--radius-lg)] p-8 border border-[hsl(var(--border))]">
        <h2 className="text-3xl font-semibold text-center text-[hsl(var(--text))] mb-8">
          Perfect For
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-[hsl(var(--text))] mb-3">Solo Developers</h3>
            <p className="text-[hsl(var(--text-muted))] mb-4">
              Skip the setup headaches. Focus on your unique value, not boilerplate configuration.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[hsl(var(--text))] mb-3">AI-Assisted Teams</h3>
            <p className="text-[hsl(var(--text-muted))] mb-4">
              Structured for seamless human-AI collaboration with clear patterns and documentation.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[hsl(var(--text))] mb-3">Rapid Prototypes</h3>
            <p className="text-[hsl(var(--text-muted))] mb-4">
              Get from concept to working prototype in hours, not weeks. Perfect for MVPs and experiments.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[hsl(var(--text))] mb-3">Production Apps</h3>
            <p className="text-[hsl(var(--text-muted))] mb-4">
              Built-in monitoring, security, and CI/CD. Scale from prototype to production seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold text-center text-[hsl(var(--text))] mb-12">
          How It Works
        </h2>
        <ol className="space-y-8" role="list">
          <li className="flex items-start gap-6">
            <div className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-contrast))] rounded-full w-10 h-10 flex items-center justify-center font-semibold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[hsl(var(--text))] mb-2">Clone & Configure</h3>
              <p className="text-[hsl(var(--text-muted))]">
                One command to get started. Minimal environment setup with clear documentation for every step.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-6">
            <div className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-contrast))] rounded-full w-10 h-10 flex items-center justify-center font-semibold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[hsl(var(--text))] mb-2">Build Features</h3>
              <p className="text-[hsl(var(--text-muted))]">
                Use our command palette and recipes to add exactly what you need. Auth, payments, analytics - all optional.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-6">
            <div className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-contrast))] rounded-full w-10 h-10 flex items-center justify-center font-semibold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[hsl(var(--text))] mb-2">Ship & Scale</h3>
              <p className="text-[hsl(var(--text-muted))]">
                Built-in CI/CD, monitoring, and security. Deploy with confidence and iterate rapidly.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Documentation Links */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold text-center text-[hsl(var(--text))] mb-8">
          Learn More
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-lg)] p-6 border border-[hsl(var(--border))]">
            <h3 className="text-lg font-semibold text-[hsl(var(--text))] mb-4">📚 Documentation</h3>
            <div className="space-y-2">
              <a href="https://github.com/Shredvardson/dl-starter/blob/main/docs/wiki/WIKI-Home.md" 
                 className="block text-[hsl(var(--primary))] hover:underline focus-visible:underline">
                Getting Started Guide
              </a>
              <a href="https://github.com/Shredvardson/dl-starter/blob/main/docs/wiki/WIKI-Commands.md" 
                 className="block text-[hsl(var(--primary))] hover:underline focus-visible:underline">
                Command Reference
              </a>
              <a href="https://github.com/Shredvardson/dl-starter/blob/main/docs/wiki/WIKI-Architecture.md" 
                 className="block text-[hsl(var(--primary))] hover:underline focus-visible:underline">
                Architecture Overview
              </a>
            </div>
          </div>
          <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-lg)] p-6 border border-[hsl(var(--border))]">
            <h3 className="text-lg font-semibold text-[hsl(var(--text))] mb-4">🛠️ Recipes</h3>
            <div className="space-y-2">
              <a href="https://github.com/Shredvardson/dl-starter/blob/main/docs/recipes/auth.md" 
                 className="block text-[hsl(var(--primary))] hover:underline focus-visible:underline">
                Authentication Setup
              </a>
              <a href="https://github.com/Shredvardson/dl-starter/blob/main/docs/recipes/db.md" 
                 className="block text-[hsl(var(--primary))] hover:underline focus-visible:underline">
                Database Integration
              </a>
              <a href="https://github.com/Shredvardson/dl-starter/blob/main/docs/recipes/stripe.md" 
                 className="block text-[hsl(var(--primary))] hover:underline focus-visible:underline">
                Payment Processing
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
