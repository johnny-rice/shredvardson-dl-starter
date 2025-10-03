import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-10',
        sm: 'h-9 px-2 text-xs',
        lg: 'h-11 px-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

/**
 * Input component for text input fields
 *
 * A flexible text input component that supports multiple sizes and follows
 * semantic design token patterns for consistent styling.
 *
 * @usageGuidelines
 * - Always pair with a Label component for accessibility
 * - Use placeholder text sparingly - prefer labels for clarity
 * - Use appropriate input type (email, password, tel, url, etc.)
 * - Provide clear validation feedback for errors
 * - Use disabled state when input should not be editable
 * - Consider using helper text for additional context
 *
 * @accessibilityConsiderations
 * - Must have associated label (via Label component or aria-label)
 * - Focus ring uses 2px ring with 2px offset for visibility
 * - Ensure placeholder text meets WCAG AA contrast for your active token palette
 * - Disabled state prevents interaction and reduces opacity
 * - Supports all standard ARIA attributes (aria-invalid, aria-describedby)
 * - Works with screen readers for error announcements
 *
 * @example
 * ```tsx
 * <div className="space-y-2">
 *   <Label htmlFor="email">Email</Label>
 *   <Input
 *     id="email"
 *     type="email"
 *     placeholder="you@example.com"
 *     aria-describedby="email-error"
 *   />
 * </div>
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', size, ...props }, ref) => {
    return (
      <input type={type} className={cn(inputVariants({ size, className }))} ref={ref} {...props} />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
