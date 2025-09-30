import * as React from 'react';
import { cn } from '../../lib/utils';

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'ghost';
};

export const Link = React.forwardRef<HTMLAnchorElement, Props>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center px-4 py-2 rounded-md transition-colors duration-200 no-underline font-medium';

    if (variant === 'ghost') {
      return (
        <a
          ref={ref}
          className={cn(base, 'bg-transparent hover:bg-muted text-foreground', className)}
          {...props}
        />
      );
    }

    return (
      <a
        ref={ref}
        className={cn(
          base,
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
        {...props}
      />
    );
  }
);

Link.displayName = 'Link';
