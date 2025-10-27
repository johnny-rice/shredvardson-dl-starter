import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

/**
 * Label component for form input labeling
 *
 * A semantic label component built on Radix UI that provides accessible
 * form input labeling with proper associations and styling.
 *
 * @usageGuidelines
 * - Always use with form inputs (Input, Select, Textarea, etc.)
 * - Use htmlFor prop to associate with input id
 * - Keep label text concise and descriptive
 * - Place label above or to the left of input (not below)
 * - Use sentence case, not title case (e.g., "Email address" not "Email Address")
 * - Avoid using colons after labels in modern UIs
 *
 * @accessibilityConsiderations
 * - Creates proper label-input association via htmlFor/id
 * - Clicking label focuses associated input
 * - Works with screen readers to announce input purpose
 * - Disables cursor when associated input is disabled (peer-disabled)
 * - Reduces opacity when associated input is disabled for visual feedback
 *
 * @example
 * ```tsx
 * <div className="space-y-2">
 *   <Label htmlFor="username">Username</Label>
 *   <Input id="username" placeholder="Enter username" />
 * </div>
 * ```
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
