import type { Variants } from 'framer-motion';

/**
 * Custom animation properties for component-level usage.
 *
 * @remarks
 * This interface is for component wrappers and future extension, NOT for
 * automatic variant adaptation. The static variant objects (fadeIn, slideUp, etc.)
 * do not automatically consume these props. Components must manually branch using
 * the useReducedMotion hook and getReducedMotionVariants utility:
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * <motion.div variants={prefersReducedMotion ? getReducedMotionVariants(fadeIn) : fadeIn}>
 * ```
 *
 * This design keeps variants static and predictable while allowing custom
 * component wrappers to implement dynamic behavior if needed.
 */
export interface AnimationCustomProps {
  /**
   * Whether the user prefers reduced motion.
   * When true, animations should be minimal or disabled.
   */
  prefersReducedMotion?: boolean;
}

/**
 * Fade in animation variant.
 *
 * @usageGuidelines Use for content that appears on page load or modal entry.
 * Suitable for cards, modals, toasts, and page transitions.
 * IMPORTANT: Use with useReducedMotion hook or getReducedMotionVariants utility:
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * <motion.div variants={prefersReducedMotion ? getReducedMotionVariants(fadeIn) : fadeIn}>
 * ```
 *
 * @accessibilityConsiderations
 * These variants do NOT automatically respect prefers-reduced-motion.
 * You must use the useReducedMotion hook or getReducedMotionVariants utility
 * to adapt animations for users with motion sensitivity (WCAG 2.1 Level AAA).
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Slide up animation variant.
 *
 * @usageGuidelines Use for bottom sheets, drawers, or content that enters
 * from the bottom of the viewport. Ideal for mobile-first interactions.
 * Must be combined with useReducedMotion hook for accessibility.
 *
 * @accessibilityConsiderations
 * Does NOT automatically respect prefers-reduced-motion.
 * Use getReducedMotionVariants() or useReducedMotion hook to adapt for motion sensitivity.
 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

/**
 * Scale animation variant.
 *
 * @usageGuidelines Use for elements that need to draw attention or indicate
 * selection state. Common for buttons, cards on hover, or featured content.
 * Must be combined with useReducedMotion hook for accessibility.
 *
 * @accessibilityConsiderations
 * Does NOT automatically respect prefers-reduced-motion.
 * Use getReducedMotionVariants() or useReducedMotion hook to adapt for motion sensitivity.
 */
export const scale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Slide in from right animation variant.
 *
 * @usageGuidelines Use for sidebars, navigation panels, or content that
 * enters from the right edge. Ideal for LTR interfaces.
 * Must be combined with useReducedMotion hook for accessibility.
 *
 * @accessibilityConsiderations
 * Does NOT automatically respect prefers-reduced-motion.
 * Use getReducedMotionVariants() or useReducedMotion hook to adapt for motion sensitivity.
 */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

/**
 * Utility function to create reduced motion variants.
 *
 * @param variants - Original animation variants
 * @returns Modified variants with minimal animation for reduced motion preference
 *
 * @usageGuidelines Use this utility when you need to dynamically adjust
 * animations based on user preference detected at runtime.
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 * const variants = prefersReducedMotion ? getReducedMotionVariants(fadeIn) : fadeIn;
 * ```
 */
export function getReducedMotionVariants(variants: Variants): Variants {
  const reduced: Variants = {};

  for (const key in variants) {
    const variant = variants[key];

    // Handle function-based variants (common when using custom props)
    if (typeof variant === 'function') {
      // biome-ignore lint/suspicious/noExplicitAny: Framer Motion library interop requires any for variant function signatures
      reduced[key] = ((custom?: any, current?: any, velocity?: any) => {
        const resolved = variant(custom, current, velocity);
        if (resolved && typeof resolved === 'object') {
          return {
            ...resolved,
            transition: {
              duration: 0.01,
              ease: 'linear',
            },
            // Remove transform properties but keep opacity and other non-transform props
            y: 0,
            x: 0,
            scale: 1,
          };
        }
        return resolved;
      }) as typeof variant;
      continue;
    }

    // Handle object-based variants
    if (variant && typeof variant === 'object') {
      reduced[key] = {
        ...variant,
        transition: {
          duration: 0.01,
          ease: 'linear',
        },
        // Remove transform properties but keep opacity
        y: 0,
        x: 0,
        scale: 1,
      };
    }
  }

  return reduced;
}
