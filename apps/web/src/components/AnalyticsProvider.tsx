'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, startSession, endSession } from '@/lib/analytics';

interface AnalyticsContextType {
  trackClick: (component: string) => void;
  enabled: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  trackClick: () => {},
  enabled: false,
});

export function useAnalytics() {
  return useContext(AnalyticsContext);
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const sessionStarted = useRef(false);

  const enabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

  // Start session on mount
  useEffect(() => {
    if (enabled && !sessionStarted.current) {
      startSession();
      sessionStarted.current = true;

      // End session on unload
      const handleUnload = () => {
        endSession();
      };

      window.addEventListener('beforeunload', handleUnload);
      return () => {
        window.removeEventListener('beforeunload', handleUnload);
      };
    }
  }, [enabled]);

  // Track page views
  useEffect(() => {
    if (enabled && pathname) {
      trackPageView(pathname);
    }
  }, [enabled, pathname]);

  const trackClick = (component: string) => {
    if (enabled && pathname) {
      import('@/lib/analytics').then(({ trackClick: trackClickEvent }) => {
        trackClickEvent(pathname, component);
      });
    }
  };

  const contextValue: AnalyticsContextType = {
    trackClick,
    enabled,
  };

  return <AnalyticsContext.Provider value={contextValue}>{children}</AnalyticsContext.Provider>;
}

/**
 * Hook to track clicks on components
 */
export function useTrackClick(component: string) {
  const { trackClick } = useAnalytics();

  return () => trackClick(component);
}
