/**
 * Design System Layout
 *
 * Provides consistent chrome for the design system viewer
 */

import type { Metadata } from 'next';
import DesignNav from './DesignNav';

export const metadata: Metadata = {
  title: 'Design System | DL Starter',
  description: 'Interactive component library and design token reference',
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DesignNav />
      <main>{children}</main>
    </div>
  );
}
