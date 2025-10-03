import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Button component variants using CVA (Class Variance Authority)
 * Provides consistent styling with semantic design tokens
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Button component props extending standard HTML button attributes
 * with design system variants
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a child component instead of button */
  asChild?: boolean;
}

/**
 * Button component with design system variants
 *
 * A flexible button component that supports multiple visual styles and sizes.
 * Built with accessibility in mind and follows semantic design token patterns.
 *
 * @usageGuidelines
 * - Only one primary button visible per screen to avoid user confusion
 * - Use default variant for primary CTAs (sign up, submit, save)
 * - Use destructive variant for irreversible actions (delete, remove, cancel subscription)
 * - Use outline variant for secondary actions that need clear boundaries
 * - Use ghost variant for tertiary actions (navigation, less important actions)
 * - Use link variant for text-based actions that should appear inline
 * - Prefer ghost/link variants for secondary actions to reduce visual noise
 * - Disabled state should explain WHY button is disabled (via tooltip or helper text)
 *
 * @accessibilityConsiderations
 * - Minimum 4.5:1 contrast ratio on background (WCAG AA)
 * - Focus ring uses 2px outline with 2px offset for high visibility
 * - Disabled state uses pointer-events-none to prevent accidental clicks
 * - Disabled state uses opacity reduction for visual feedback
 * - Supports keyboard navigation (Space/Enter to activate)
 * - Works with screen readers (proper ARIA semantics via button element)
 * - Icon-only buttons should have aria-label for screen readers
 *
 * @example
 * ```tsx
 * // Primary CTA
 * <Button variant="default" size="lg">
 *   Sign Up Free
 * </Button>
 *
 * // Destructive action
 * <Button variant="destructive" onClick={handleDelete}>
 *   Delete Account
 * </Button>
 *
 * // Icon button with label
 * <Button variant="ghost" size="icon" aria-label="Close dialog">
 *   <X className="h-4 w-4" />
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
