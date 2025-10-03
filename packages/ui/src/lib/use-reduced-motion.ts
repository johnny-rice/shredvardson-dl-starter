'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect user's reduced motion preference
 *
 * Checks the prefers-reduced-motion media query and returns a boolean
 * indicating whether the user prefers reduced motion. Updates when the
 * preference changes.
 *
 * @usageGuidelines
 * - Use this hook in components with animations to respect user preferences
 * - Reduce or disable animations when this returns true
 * - Test animations with both motion preferences enabled/disabled
 * - Consider using getReducedMotionVariants utility for Framer Motion
 *
 * @accessibilityConsiderations
 * - Respects prefers-reduced-motion CSS media query
 * - Helps prevent vestibular motion disorders from being triggered
 * - Required for WCAG 2.1 Success Criterion 2.3.3 (Level AAA)
 * - Users with motion sensitivity can enable this in OS settings
 *
 * @returns {boolean} True if user prefers reduced motion, false otherwise
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   return (
 *     <motion.div
 *       initial="hidden"
 *       animate="visible"
 *       variants={prefersReducedMotion ? getReducedMotionVariants(fadeIn) : fadeIn}
 *     >
 *       Content
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is defined (SSR safety)
    if (typeof window === 'undefined') {
      return;
    }

    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Create event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener (use addEventListener if available, fallback to addListener for older browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // @ts-ignore - deprecated but needed for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // @ts-ignore - deprecated but needed for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}
