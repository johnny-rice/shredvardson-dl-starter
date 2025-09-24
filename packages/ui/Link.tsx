import { AnchorHTMLAttributes } from 'react';
import { cn } from './utils';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'ghost';
};

export function Link({ className, variant = 'primary', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center px-4 py-2 rounded-md transition-colors duration-200 no-underline font-medium';

  if (variant === 'ghost') {
    return (
      <a
        className={cn(
          base,
          'bg-transparent hover:bg-muted text-foreground',
          className
        )}
        {...props}
      />
    );
  }

  return (
    <a
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