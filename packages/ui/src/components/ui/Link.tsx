import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * Link component variants using CVA (Class Variance Authority)
 * Provides consistent styling with semantic design tokens
 */
const linkVariants = cva(
  'inline-flex items-center justify-center transition-colors duration-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-primary hover:text-primary/80 underline-offset-4 hover:underline',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-4 py-2',
        ghost: 'hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-2',
        nav: 'text-foreground/60 hover:text-foreground hover:bg-accent/50 rounded-md px-3 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Link component props extending standard HTML anchor attributes
 * with design system variants
 */
export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {}

/**
 * Link component with design system variants
 *
 * A flexible link component that supports multiple visual styles for different contexts.
 * Built with accessibility in mind and follows semantic design token patterns.
 *
 * @usageGuidelines
 * - Use 'default' variant for inline text links within paragraphs
 * - Use 'primary' variant for standalone CTA links (similar to buttons)
 * - Use 'ghost' variant for subtle navigation or tertiary links
 * - Use 'nav' variant specifically for navigation menu items
 * - Ensure links have descriptive text - avoid "click here" or "read more"
 * - External links should indicate they open in new window (icon or text)
 * - Links should be distinguishable from regular text (underline or color)
 *
 * @accessibilityConsiderations
 * - Minimum 4.5:1 contrast ratio for link text (WCAG AA)
 * - Focus ring uses 2px outline with 2px offset for keyboard navigation
 * - Minimum touch target 44x44px for touch devices (met by primary/secondary/ghost)
 * - Underline on hover helps users identify interactive elements
 * - Works with screen readers (proper semantics via anchor element)
 * - External links should have aria-label indicating "opens in new window"
 *
 * @example
 * ```tsx
 * // Inline text link
 * <Link variant="default" href="/docs">
 *   Read the documentation
 * </Link>
 *
 * // CTA link styled like button
 * <Link variant="primary" href="/signup">
 *   Get Started
 * </Link>
 *
 * // Navigation link
 * <Link variant="nav" href="/dashboard">
 *   Dashboard
 * </Link>
 *
 * // External link
 * <Link variant="default" href="https://example.com" target="_blank" rel="noopener noreferrer" aria-label="Visit Example.com (opens in new window)">
 *   Example.com
 * </Link>
 * ```
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, ...props }, ref) => {
    return <a ref={ref} className={cn(linkVariants({ variant, className }))} {...props} />;
  }
);

Link.displayName = 'Link';

export { linkVariants };
