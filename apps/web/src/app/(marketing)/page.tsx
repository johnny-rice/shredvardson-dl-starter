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

import { Button } from '@ui/components';
import NextLink from 'next/link';
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
 * BenefitCard component props
 */
interface BenefitCardProps {
  /** Icon or emoji to display */
  icon: string;
  /** Title of the benefit */
  title: string;
  /** Description of the benefit */
  description: string;
}

/**
 * Reusable benefit card component
 *
 * Displays a card with an icon, title, and description following
 * the design system token patterns.
 */
function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h3 className="text-xl font-semibold text-card-foreground mb-4 leading-tight">
        {icon} {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

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
    <main className="min-h-dvh bg-background font-sans">
      {/* Navigation Header */}
      <nav className="border-b border-border" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-foreground hover:no-underline">
              DLStarter
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/docs" variant="nav">
                Docs
              </Link>
              <Link href="/showcase" variant="nav">
                Showcase
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <NextLink href="/login">Log In</NextLink>
            </Button>
            <Button asChild>
              <NextLink href="/signup">Sign Up</NextLink>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-24" data-testid="smoke">
        <header className="text-center mb-24">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Ship Faster with AI-Ready Code
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto">
            A lightweight, LLM-friendly starter that gets you from idea to production without the
            bloat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <NextLink href="/signup" aria-label="Get started with DLStarter">
                Get Started Free
              </NextLink>
            </Button>
            <Button asChild variant="outline" size="lg">
              <NextLink href="/docs" aria-label="View complete documentation">
                View Docs
              </NextLink>
            </Button>
          </div>
        </header>

        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-foreground leading-tight mb-12">
            Top 3 Benefits
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <BenefitCard
              icon="⚡"
              title="Zero Bloat"
              description="Clean, minimal codebase with only essential dependencies."
            />
            <BenefitCard
              icon="🤖"
              title="AI-Optimized"
              description="Built for Claude and LLMs with clear patterns and documentation."
            />
            <BenefitCard
              icon="🔧"
              title="Recipe-Driven"
              description="Add features progressively with battle-tested recipes."
            />
          </div>
        </section>

        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-foreground leading-tight mb-12">
            Perfect For
          </h2>
          <div className="bg-card rounded-lg p-12 border border-border">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-4 leading-tight">
                  Solo Developers
                </h3>
                <p className="text-muted-foreground leading-normal">
                  Skip setup headaches, focus on your unique value.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-4 leading-tight">
                  AI-Assisted Teams
                </h3>
                <p className="text-muted-foreground leading-normal">
                  Structured for seamless human-AI collaboration.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-foreground leading-tight mb-12">
            What&apos;s Inside
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 leading-tight">
                Documentation
              </h3>
              <nav className="space-y-2">
                <Link variant="default" href="/docs" className="block leading-normal">
                  Getting Started Guide
                </Link>
                <Link variant="default" href="/docs" className="block leading-normal">
                  Command Reference
                </Link>
                <Link variant="default" href="/docs" className="block leading-normal">
                  Architecture Overview
                </Link>
              </nav>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 leading-tight">
                Recipes
              </h3>
              <nav className="space-y-2">
                <Link variant="default" href="/docs" className="block leading-normal">
                  Authentication Setup
                </Link>
                <Link variant="default" href="/docs" className="block leading-normal">
                  Database Integration
                </Link>
                <Link variant="default" href="/docs" className="block leading-normal">
                  Payment Processing
                </Link>
              </nav>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
