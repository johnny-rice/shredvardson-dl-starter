import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 *
 * This utility function combines multiple class values and merges conflicting
 * Tailwind CSS classes intelligently. It's the primary utility for conditional
 * styling in the design system.
 *
 * @param inputs - Class values to combine (strings, objects, arrays, etc.)
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * ```tsx
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': isActive })
 * // Returns: "px-4 py-2 bg-blue-500 text-white" (if isActive is true)
 *
 * cn('px-2', 'px-4') // Returns: "px-4" (latter wins)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
