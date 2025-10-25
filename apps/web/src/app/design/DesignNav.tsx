'use client';

/**
 * Design System Navigation
 *
 * Client component for navigation with active state
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DesignNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/design') {
      return pathname === '/design';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            ← Back to App
          </Link>
          <div className="h-4 w-px bg-border" />
          <Link
            href="/design"
            className={`text-sm font-medium hover:text-primary transition-colors ${
              isActive('/design') ? 'text-primary' : ''
            }`}
          >
            Components
          </Link>
          <Link
            href="/design/tokens"
            className={`text-sm font-medium hover:text-primary transition-colors ${
              isActive('/design/tokens') ? 'text-primary' : ''
            }`}
          >
            Tokens
          </Link>
        </div>
      </div>
    </nav>
  );
}
