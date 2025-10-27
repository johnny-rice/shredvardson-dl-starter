import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * SectionHeader component variants using CVA (Class Variance Authority)
 * Provides consistent styling with semantic design tokens and fluid typography
 */
const sectionHeaderVariants = cva('font-bold tracking-tight text-foreground', {
  variants: {
    size: {
      sm: 'text-lg md:text-xl',
      md: 'text-2xl md:text-3xl',
      lg: 'text-3xl md:text-4xl lg:text-5xl',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    size: 'md',
    align: 'left',
  },
});

const sectionDescriptionVariants = cva('text-muted-foreground', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    size: 'md',
    align: 'left',
  },
});

/**
 * SectionHeader component props
 */
export interface SectionHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionHeaderVariants> {
  /** The heading level (h1-h6) to use for proper semantic hierarchy */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Optional description text below the heading */
  description?: string;
  /** Optional class name for the heading element itself (deprecated: use headingProps.className instead) */
  headingClassName?: string;
  /** Extra props passed directly to the rendered heading element (for id, aria-*, data-*, etc.) */
  headingProps?: React.HTMLAttributes<HTMLHeadingElement>;
}

/**
 * SectionHeader component with design system variants
 *
 * A heading component for introducing sections of content with proper semantic hierarchy.
 * Uses fluid typography tokens that scale responsively across viewport sizes.
 *
 * @usageGuidelines
 * - Use 'as' prop to maintain proper heading hierarchy (h1 → h2 → h3 etc.)
 * - Only one h1 per page (typically page title)
 * - Use 'lg' size for main page headings (h1)
 * - Use 'md' size for major section headings (h2, h3)
 * - Use 'sm' size for subsection headings (h4, h5, h6)
 * - Include description for context when heading alone isn't sufficient
 * - Keep headings concise (1-8 words ideal)
 * - Use sentence case rather than title case for better readability
 *
 * @accessibilityConsiderations
 * - Proper heading hierarchy is critical for screen reader navigation
 * - Don't skip heading levels (h2 directly after h1, not h3)
 * - High contrast text ensures WCAG AA compliance
 * - Semantic HTML (h1-h6) enables "skip to section" functionality
 * - Description text has sufficient contrast (muted but still readable)
 *
 * @example
 * ```tsx
 * // Page title
 * <SectionHeader as="h1" size="lg">
 *   Welcome to Dashboard
 * </SectionHeader>
 *
 * // Section with description
 * <SectionHeader
 *   as="h2"
 *   size="md"
 *   description="Manage your team members and their roles"
 * >
 *   Team Members
 * </SectionHeader>
 *
 * // Centered subsection
 * <SectionHeader as="h3" size="sm" align="center">
 *   Recent Activity
 * </SectionHeader>
 *
 * // Heading with skip link target (accessibility)
 * <SectionHeader
 *   as="h2"
 *   headingProps={{
 *     id: "user-section",
 *     "aria-label": "User management section"
 *   }}
 *   data-testid="user-section-wrapper"
 * >
 *   Users
 * </SectionHeader>
 *
 * // Legacy: Using headingClassName (still supported)
 * <SectionHeader
 *   headingClassName="custom-heading-class"
 * >
 *   Legacy Styling
 * </SectionHeader>
 * ```
 */
export const SectionHeader = React.forwardRef<HTMLHeadingElement, SectionHeaderProps>(
  (
    {
      className,
      headingClassName,
      headingProps,
      size,
      align,
      as: Comp = 'h2',
      description,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        <Comp
          ref={ref}
          {...headingProps}
          className={cn(
            sectionHeaderVariants({ size, align }),
            headingProps?.className,
            headingClassName
          )}
        >
          {children}
        </Comp>
        {description && (
          <p className={cn(sectionDescriptionVariants({ size, align }))}>{description}</p>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = 'SectionHeader';

export { sectionHeaderVariants, sectionDescriptionVariants };
