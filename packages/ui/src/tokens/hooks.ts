/**
 * Design Token Hooks
 *
 * React hooks for accessing and using design tokens
 * in components.
 *
 * @module tokens/hooks
 */

import { useEffect, useMemo, useState } from 'react';
import type {
  AnimationDurationToken,
  AnimationEasingToken,
  BorderRadiusToken,
  BreakpointToken,
  ColorToken,
  FontSizeToken,
  ShadowToken,
  SpacingToken,
} from './index';
import { tokens } from './index';

/**
 * Hook to access color tokens
 */
export function useColorToken(category: keyof typeof tokens.colors) {
  return tokens.colors[category];
}

/**
 * Hook to access spacing tokens
 */
export function useSpacingToken(size: SpacingToken) {
  return tokens.spacing[size];
}

/**
 * Hook to access typography tokens
 */
export function useTypographyTokens() {
  return tokens.typography;
}

/**
 * Hook to access current theme tokens
 */
export function useThemeTokens() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // SSR-safe initialization
    if (typeof window === 'undefined') return 'light';
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? 'dark' : 'light';
  });

  useEffect(() => {
    // Skip if SSR
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Check for theme from document
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      const isDark = root.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return useMemo(() => tokens.themes[theme], [theme]);
}

/**
 * Calculate current breakpoint from window width
 */
function getBreakpointFromWidth(width: number): BreakpointToken | 'xs' {
  if (width >= parseInt(tokens.breakpoints['2xl'])) return '2xl';
  if (width >= parseInt(tokens.breakpoints.xl)) return 'xl';
  if (width >= parseInt(tokens.breakpoints.lg)) return 'lg';
  if (width >= parseInt(tokens.breakpoints.md)) return 'md';
  if (width >= parseInt(tokens.breakpoints.sm)) return 'sm';
  return 'xs';
}

/**
 * Hook to check current breakpoint with debounced resize handling
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<BreakpointToken | 'xs'>(() => {
    // SSR-safe initialization
    if (typeof window === 'undefined') return 'xs';
    return getBreakpointFromWidth(window.innerWidth);
  });

  useEffect(() => {
    // Skip if SSR
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const checkBreakpoint = () => {
      setBreakpoint(getBreakpointFromWidth(window.innerWidth));
    };

    const debouncedCheckBreakpoint = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkBreakpoint, 150);
    };

    // Initial check without debounce
    checkBreakpoint();

    window.addEventListener('resize', debouncedCheckBreakpoint);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedCheckBreakpoint);
    };
  }, []);

  return breakpoint;
}

/**
 * Hook to check if screen is above a certain breakpoint
 */
export function useMediaQuery(query: BreakpointToken): boolean {
  const [matches, setMatches] = useState(() => {
    // SSR-safe initialization
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia(`(min-width: ${tokens.breakpoints[query]})`).matches;
  });

  useEffect(() => {
    // Skip if SSR or matchMedia not available
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(`(min-width: ${tokens.breakpoints[query]})`);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Set initial state
    setMatches(mediaQuery.matches);

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

/**
 * Hook to get animation tokens
 */
export function useAnimationTokens() {
  return tokens.animation;
}

/**
 * Hook to create CSS variables from tokens
 */
export function useCSSVariables(prefix = '') {
  return useMemo(() => {
    const cssVars: Record<string, string> = {};
    // Ensure prefix ends with separator if provided
    const varPrefix = prefix ? `${prefix.replace(/-+$/, '')}-` : '';

    // Add color variables
    Object.entries(tokens.colors).forEach(([category, colors]) => {
      Object.entries(colors).forEach(([shade, value]) => {
        cssVars[`--${varPrefix}color-${category}-${shade}`] = value;
      });
    });

    // Add spacing variables
    Object.entries(tokens.spacing).forEach(([size, value]) => {
      cssVars[`--${varPrefix}spacing-${size}`] = value;
    });

    // Add typography variables
    Object.entries(tokens.typography.fontSize).forEach(([size, value]) => {
      cssVars[`--${varPrefix}font-size-${size}`] = value;
    });

    Object.entries(tokens.typography.fontWeight).forEach(([weight, value]) => {
      cssVars[`--${varPrefix}font-weight-${weight}`] = value;
    });

    Object.entries(tokens.typography.lineHeight).forEach(([height, value]) => {
      cssVars[`--${varPrefix}line-height-${height}`] = value;
    });

    Object.entries(tokens.typography.letterSpacing).forEach(([spacing, value]) => {
      cssVars[`--${varPrefix}letter-spacing-${spacing}`] = value;
    });

    // Add border radius variables
    Object.entries(tokens.borderRadius).forEach(([size, value]) => {
      cssVars[`--${varPrefix}radius-${size}`] = value;
    });

    // Add shadow variables
    Object.entries(tokens.shadows).forEach(([size, value]) => {
      cssVars[`--${varPrefix}shadow-${size}`] = value;
    });

    // Add animation variables
    Object.entries(tokens.animation.duration).forEach(([speed, value]) => {
      cssVars[`--${varPrefix}duration-${speed}`] = value;
    });

    Object.entries(tokens.animation.easing).forEach(([easing, value]) => {
      cssVars[`--${varPrefix}easing-${easing}`] = value;
    });

    // Add z-index variables
    Object.entries(tokens.zIndex).forEach(([level, value]) => {
      cssVars[`--${varPrefix}z-${level}`] = value;
    });

    return cssVars;
  }, [prefix]);
}

/**
 * Hook to get a specific token value by path
 */
export function useToken(path: string): string | undefined {
  return useMemo(() => {
    const parts = path.split('.');
    let value: unknown = tokens;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return typeof value === 'string' ? value : undefined;
  }, [path]);
}

// Cache validated elements to avoid redundant work
const validatedElements = new WeakSet<HTMLElement>();

/**
 * Hook to validate token usage in development
 * @param enabled - Whether to enable validation (defaults to development mode)
 * @param root - Optional root element to limit validation scope
 */
export function useTokenValidation(
  enabled = process.env.NODE_ENV === 'development',
  root?: HTMLElement | Document | null
) {
  useEffect(() => {
    // Skip if disabled or SSR
    if (!enabled || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // In development, log warnings for non-token values
    const checkElement = (element: HTMLElement) => {
      // Skip if already validated
      if (validatedElements.has(element)) return;
      validatedElements.add(element);

      const styles = window.getComputedStyle(element);

      // Check for hardcoded colors
      const colorProps = ['color', 'background-color', 'border-color'];
      colorProps.forEach((prop) => {
        const value = styles.getPropertyValue(prop);
        if (value && !value.startsWith('var(--') && !value.includes('transparent')) {
          if (value.match(/#|rgb|hsl/)) {
            console.warn(`Non-token color detected on ${element.tagName}:`, prop, value, element);
          }
        }
      });
    };

    // Use requestIdleCallback for better performance
    const validateElements = () => {
      const targetRoot = root || document;
      const elements = targetRoot.querySelectorAll('*');

      elements.forEach((el) => {
        if (el instanceof HTMLElement) {
          checkElement(el);
        }
      });
    };

    // Use requestIdleCallback if available, otherwise use setTimeout
    if (typeof (window as any).requestIdleCallback === 'function') {
      const handle = (window as any).requestIdleCallback(validateElements) as number;
      return () => {
        if (typeof (window as any).cancelIdleCallback === 'function') {
          (window as any).cancelIdleCallback(handle);
        }
      };
    }

    const timeoutId = setTimeout(validateElements, 0);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [enabled, root]);
}

// Individual exports for better tree-shaking
// Avoid default exports to allow bundlers to eliminate unused hooks
