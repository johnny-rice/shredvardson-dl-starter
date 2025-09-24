import { AnchorHTMLAttributes } from 'react';
import { cn } from './utils';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'ghost';
};

export function Link({ className, variant = 'primary', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-md)] transition-[background,opacity,box-shadow] duration-1 ease-[var(--ease-std)] no-underline';

  if (variant === 'ghost') {
    return (
      <a
        className={cn(
          base,
          'bg-transparent hover:bg-[hsl(var(--overlay))] text-[hsl(var(--text))]',
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
        'bg-[hsl(var(--primary))] text-[hsl(var(--primary-contrast))]',
        'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] hover:opacity-95',
        className
      )}
      {...props}
    />
  );
}