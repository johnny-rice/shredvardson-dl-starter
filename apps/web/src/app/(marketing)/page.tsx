/**
 * Marketing landing page for DLStarter.
 * 
 * This page serves as the primary marketing landing for the DLStarter project,
 * showcasing the key benefits, target audience, and available resources.
 * 
 * Features:
 * - Hero section with value proposition
 * - Three key benefits highlighting unique selling points
 * - Target audience section for Solo Developers and AI-Assisted Teams
 * - Documentation and recipe links for getting started
 * - Responsive design with mobile/desktop optimization
 * - Typography using design system tokens
 * - Semantic HTML structure for accessibility
 */
import { Link } from '@/components/Link';

/** Page metadata for SEO and social sharing */
export const metadata = {
  title: 'Ship Faster with AI-Ready Code',
  description:
    'A lightweight, LLM-friendly starter to go from idea to production without the bloat.',
  openGraph: { title: 'Ship Faster with AI-Ready Code' },
  twitter: { card: 'summary_large_image' },
};

/**
 * Marketing page component.
 * 
 * Renders a comprehensive marketing landing page with:
 * - Hero section with primary value proposition
 * - Benefits section highlighting Zero Bloat, AI-Optimized, Recipe-Driven features
 * - Target audience section for Solo Developers and AI-Assisted Teams  
 * - Resource links section with documentation and recipes
 * 
 * Uses design system tokens for consistent typography and spacing.
 * Responsive design adapts to mobile and desktop viewports.
 * 
 * @returns JSX element containing the complete marketing page
 */
export default function Marketing() {
  return (
    <main className="min-h-dvh bg-background font-sans py-4xl px-xl">
      <div className="max-w-4xl mx-auto" data-testid="smoke">
        <header className="text-center mb-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight mb-lg">
            Ship Faster with AI-Ready Code
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-3xl max-w-3xl mx-auto">
            A lightweight, LLM-friendly starter that gets you from idea to production without the bloat.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <Link href="/docs" className="text-lg px-3xl py-lg font-medium" aria-label="Get started with DLStarter documentation">
              Get Started
            </Link>
            <Link href="/docs" variant="ghost" className="text-lg px-3xl py-lg font-medium" aria-label="View complete documentation">
              View Docs
            </Link>
          </div>
        </header>

        <section className="mb-4xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-foreground leading-tight mb-3xl">
            Top 3 Benefits
          </h2>
          <div className="grid md:grid-cols-3 gap-xl">
            <div className="bg-card rounded-lg p-xl border border-border">
              <h3 className="text-xl font-semibold text-card-foreground mb-md leading-tight">⚡ Zero Bloat</h3>
              <p className="text-muted-foreground leading-relaxed">
                Clean, minimal codebase with only essential dependencies.
              </p>
            </div>
            <div className="bg-card rounded-lg p-xl border border-border">
              <h3 className="text-xl font-semibold text-card-foreground mb-md leading-tight">🤖 AI-Optimized</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built for Claude and LLMs with clear patterns and documentation.
              </p>
            </div>
            <div className="bg-card rounded-lg p-xl border border-border">
              <h3 className="text-xl font-semibold text-card-foreground mb-md leading-tight">🔧 Recipe-Driven</h3>
              <p className="text-muted-foreground leading-relaxed">
                Add features progressively with battle-tested recipes.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-4xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-foreground leading-tight mb-3xl">
            Perfect For
          </h2>
          <div className="bg-card rounded-lg p-3xl border border-border">
            <div className="grid md:grid-cols-2 gap-2xl">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-md leading-tight">Solo Developers</h3>
                <p className="text-muted-foreground leading-normal">Skip setup headaches, focus on your unique value.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-md leading-tight">AI-Assisted Teams</h3>
                <p className="text-muted-foreground leading-normal">Structured for seamless human-AI collaboration.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-foreground leading-tight mb-3xl">
            What&apos;s Inside
          </h2>
          <div className="grid md:grid-cols-2 gap-xl">
            <div className="bg-card rounded-lg p-xl border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-md leading-tight">Documentation</h3>
              <nav className="space-y-sm">
                <a href="/docs" className="block text-primary hover:underline focus-visible:underline leading-normal">
                  Getting Started Guide
                </a>
                <a href="/docs" className="block text-primary hover:underline focus-visible:underline leading-normal">
                  Command Reference
                </a>
                <a href="/docs" className="block text-primary hover:underline focus-visible:underline leading-normal">
                  Architecture Overview
                </a>
              </nav>
            </div>
            <div className="bg-card rounded-lg p-xl border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-md leading-tight">Recipes</h3>
              <nav className="space-y-sm">
                <a href="/docs" className="block text-primary hover:underline focus-visible:underline leading-normal">
                  Authentication Setup
                </a>
                <a href="/docs" className="block text-primary hover:underline focus-visible:underline leading-normal">
                  Database Integration
                </a>
                <a href="/docs" className="block text-primary hover:underline focus-visible:underline leading-normal">
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
