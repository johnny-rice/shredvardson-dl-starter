import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Card component variants using CVA (Class Variance Authority)
 * Provides consistent styling with semantic design tokens
 */
const cardVariants = cva('rounded-lg border bg-card text-card-foreground transition-all', {
  variants: {
    variant: {
      default: 'shadow-sm',
      elevated: 'shadow-md hover:shadow-lg',
      outlined: 'shadow-none border-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

/**
 * Card component props extending standard HTML div attributes
 * with design system variants
 */
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

/**
 * Card component for grouping related content
 *
 * A container component that creates visual boundaries around related information.
 * Uses semantic design tokens for consistent styling across themes.
 *
 * @usageGuidelines
 * - Use for grouping related information with clear visual boundaries
 * - Use 'default' variant for standard content containers
 * - Use 'elevated' variant to emphasize important cards or interactive cards
 * - Use 'outlined' variant for lower hierarchy cards or nested content
 * - Avoid nesting cards more than 2 levels deep to prevent visual clutter
 * - Use Card + CardHeader + CardContent + CardFooter for standard layout structure
 * - Prefer consistent padding across cards in a grid or list for visual harmony
 * - Keep card content concise and focused on a single topic or action
 *
 * @accessibilityConsiderations
 * - Uses semantic HTML (div) with proper heading hierarchy in CardTitle
 * - Ensures sufficient contrast between card background and page background
 * - Keep interactive elements inside cards keyboard accessible with proper tab order
 * - CardDescription uses muted text with WCAG AA compliant contrast
 * - Shadow/border changes maintain accessibility (don't convey meaning solely through visual style)
 *
 * @example
 * ```tsx
 * // Standard card
 * <Card variant="default">
 *   <CardHeader>
 *     <CardTitle>User Settings</CardTitle>
 *     <CardDescription>Manage your account preferences</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Card content goes here</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Save Changes</Button>
 *   </CardFooter>
 * </Card>
 *
 * // Elevated card for emphasis
 * <Card variant="elevated">
 *   <CardHeader>
 *     <CardTitle>Premium Feature</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Unlock advanced capabilities</p>
 *   </CardContent>
 * </Card>
 * ```
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, className }))} {...props} />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
