'use client';

import Link from 'next/link';
import { useTrackClick } from './AnalyticsProvider';

export function Header() {
  const trackHelpClick = useTrackClick('header-help');
  const trackAnalyticsClick = useTrackClick('header-analytics');

  return (
    <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-semibold text-[hsl(var(--text))]">
              Your Starter
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            <Link
              href="/dashboard/analytics"
              className="text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text))] transition-colors"
              onClick={trackAnalyticsClick}
            >
              Analytics
            </Link>
            <a
              href="https://github.com/Shredvardson/dl-starter/wiki/Two-Lanes-Quick-Start"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text))] transition-colors"
              data-testid="help-link"
              data-analytics="header-help"
              onClick={trackHelpClick}
            >
              Help
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
