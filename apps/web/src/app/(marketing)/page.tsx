import { Link } from '@/components/Link';

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
      <div className="max-w-4xl mx-auto" data-testid="smoke">
        <header className="text-center mb-20">
          <h1 className="text-5xl font-bold text-[hsl(var(--text))] mb-6">
            Ship Faster with AI-Ready Code
          </h1>
          <p className="text-xl text-[hsl(var(--text-muted))] mb-8">
            A lightweight, LLM-friendly starter that gets you from idea to production without the bloat.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/docs" className="text-lg px-8 py-3" aria-label="Get started with DLStarter documentation">
              Get Started
            </Link>
            <Link href="/docs" variant="ghost" className="text-lg px-8 py-3" aria-label="View complete documentation">
              View Docs
            </Link>
          </div>
        </header>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-center text-[hsl(var(--text))] mb-8">
            Top 3 Benefits
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-lg)] p-6 border border-[hsl(var(--border))]">
              <h3 className="text-lg font-semibold text-[hsl(var(--text))] mb-3">⚡ Zero Bloat</h3>
              <p className="text-[hsl(var(--text-muted))]">
                Clean, minimal codebase with only essential dependencies.
              </p>
            </div>
            <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-lg)] p-6 border border-[hsl(var(--border))]">
              <h3 className="text-lg font-semibold text-[hsl(var(--text))] mb-3">🤖 AI-Optimized</h3>
              <p className="text-[hsl(var(--text-muted))]">
                Built for Claude and LLMs with clear patterns and documentation.
              </p>
            </div>
            <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-lg)] p-6 border border-[hsl(var(--border))]">
              <h3 className="text-lg font-semibold text-[hsl(var(--text))] mb-3">🔧 Recipe-Driven</h3>
              <p className="text-[hsl(var(--text-muted))]">
                Add features progressively with battle-tested recipes.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-center text-[hsl(var(--text))] mb-8">
            Perfect For
          </h2>
          <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-lg)] p-8 border border-[hsl(var(--border))]">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-[hsl(var(--text))] mb-2">Solo Developers</h3>
                <p className="text-[hsl(var(--text-muted))] text-sm">Skip setup headaches, focus on your unique value.</p>
              </div>
              <div>
                <h3 className="font-semibold text-[hsl(var(--text))] mb-2">AI-Assisted Teams</h3>
                <p className="text-[hsl(var(--text-muted))] text-sm">Structured for seamless human-AI collaboration.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-center text-[hsl(var(--text))] mb-8">
            What&apos;s Inside
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-lg)] p-6 border border-[hsl(var(--border))]">
              <h3 className="font-semibold text-[hsl(var(--text))] mb-4">Documentation</h3>
              <nav className="space-y-2">
                <a href="/docs" className="block text-[hsl(var(--primary))] hover:underline focus-visible:underline">
                  Getting Started Guide
                </a>
                <a href="/docs" className="block text-[hsl(var(--primary))] hover:underline focus-visible:underline">
                  Command Reference
                </a>
                <a href="/docs" className="block text-[hsl(var(--primary))] hover:underline focus-visible:underline">
                  Architecture Overview
                </a>
              </nav>
            </div>
            <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-lg)] p-6 border border-[hsl(var(--border))]">
              <h3 className="font-semibold text-[hsl(var(--text))] mb-4">Recipes</h3>
              <nav className="space-y-2">
                <a href="/docs" className="block text-[hsl(var(--primary))] hover:underline focus-visible:underline">
                  Authentication Setup
                </a>
                <a href="/docs" className="block text-[hsl(var(--primary))] hover:underline focus-visible:underline">
                  Database Integration
                </a>
                <a href="/docs" className="block text-[hsl(var(--primary))] hover:underline focus-visible:underline">
                  Payment Processing
                </a>
              </nav>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
