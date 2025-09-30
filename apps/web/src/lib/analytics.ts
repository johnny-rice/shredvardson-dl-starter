import { AnalyticsEvent, AnalyticsData, AnalyticsMetrics } from '@shared/types';
import { env } from './env';
import { monitoring } from '@/lib/adapters/sentry';

const STORAGE_KEY = 'dl-analytics';
const MAX_EVENTS = 1000; // Prevent storage bloat

/**
 * Generate cryptographically secure random string
 */
function secureRandomString(length = 12): string {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    // Browser environment with crypto API
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => chars[byte % chars.length]).join('');
  } else if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // Node.js environment or browsers with randomUUID
    return crypto.randomUUID().replace(/-/g, '').slice(0, length);
  } else {
    // Fallback for environments without crypto support
    console.warn('No secure crypto available, falling back to timestamp-based ID');
    return `${Date.now()}${performance?.now() || 0}`.replace('.', '').slice(0, length);
  }
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${secureRandomString(9)}`;
}

/**
 * Create analytics event
 */
export function createEvent(
  type: AnalyticsEvent['type'],
  path: string,
  metadata?: Record<string, string | number>
): AnalyticsEvent {
  return {
    id: `${Date.now()}-${secureRandomString(9)}`,
    type,
    path,
    timestamp: Date.now(),
    metadata,
  };
}

/**
 * Get current analytics data from storage
 */
export function getAnalyticsData(): AnalyticsData {
  if (typeof window === 'undefined' || !env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
    return createEmptyAnalyticsData();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createEmptyAnalyticsData();
    }

    const data = JSON.parse(stored) as AnalyticsData;
    return data;
  } catch {
    return createEmptyAnalyticsData();
  }
}

/**
 * Save analytics data to storage
 */
export function saveAnalyticsData(data: AnalyticsData): void {
  if (typeof window === 'undefined' || !env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
    return;
  }

  try {
    // Rotate old events if we're at the limit
    if (data.events.length > MAX_EVENTS) {
      data.events = data.events.slice(-MAX_EVENTS);
    }

    data.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save analytics data:', error);
  }
}

/**
 * Track analytics event
 */
export function trackEvent(
  type: AnalyticsEvent['type'],
  path: string,
  metadata?: Record<string, string | number>
): void {
  if (!env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
    return;
  }

  const event = createEvent(type, path, metadata);
  const data = getAnalyticsData();

  data.events.push(event);
  saveAnalyticsData(data);

  // Send to telemetry for monitoring
  sendToTelemetry(event);
}

/**
 * Track page view
 */
export function trackPageView(path: string): void {
  trackEvent('page_view', path);
}

/**
 * Track click event
 */
export function trackClick(path: string, component: string): void {
  trackEvent('click', path, { component });
}

/**
 * Start new session
 */
export function startSession(): string {
  const sessionId = generateSessionId();
  trackEvent('session_start', '/', { sessionId });
  return sessionId;
}

/**
 * End current session
 */
export function endSession(): void {
  trackEvent('session_end', '/');
}

/**
 * Calculate analytics metrics
 */
export function calculateMetrics(data: AnalyticsData): AnalyticsMetrics {
  const { events } = data;

  const pageViews = events.filter((e) => e.type === 'page_view');
  const clicks = events.filter((e) => e.type === 'click');
  const sessionStarts = events.filter((e) => e.type === 'session_start');
  const sessionEnds = events.filter((e) => e.type === 'session_end');

  // Calculate unique pages
  const uniquePaths = new Set(pageViews.map((e) => e.path));

  // Calculate top pages
  const pageViewCounts = pageViews.reduce(
    (acc: Record<string, number>, event: AnalyticsEvent) => {
      acc[event.path] = (acc[event.path] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topPages = Object.entries(pageViewCounts)
    .map(([path, views]) => ({ path, views: views as number }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Calculate clicks by component
  const clickCounts = clicks.reduce(
    (acc: Record<string, number>, event: AnalyticsEvent) => {
      const component = (event.metadata?.component as string) || 'unknown';
      acc[component] = (acc[component] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const clicksByComponent = Object.entries(clickCounts)
    .map(([component, clicks]) => ({ component, clicks: clicks as number }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  // Calculate average session duration
  const completedSessions = Math.min(sessionStarts.length, sessionEnds.length);
  let totalDuration = 0;

  for (let i = 0; i < completedSessions; i++) {
    const start = sessionStarts[i];
    const end = sessionEnds[i];
    if (start && end && end.timestamp > start.timestamp) {
      totalDuration += end.timestamp - start.timestamp;
    }
  }

  const averageSessionDuration = completedSessions > 0 ? totalDuration / completedSessions : 0;

  return {
    totalPageViews: pageViews.length,
    uniquePages: uniquePaths.size,
    totalClicks: clicks.length,
    averageSessionDuration,
    topPages,
    clicksByComponent,
  };
}

/**
 * Clear all analytics data
 */
export function clearAnalyticsData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear analytics data:', error);
  }
}

/**
 * Send analytics event to telemetry system
 */
function sendToTelemetry(event: AnalyticsEvent): void {
  try {
    // Add breadcrumb for navigation events
    if (event.type === 'page_view') {
      monitoring.addBreadcrumb(`Page view: ${event.path}`, 'navigation', 'info');
    }

    // Track significant user interactions
    if (event.type === 'click' && event.metadata?.component) {
      monitoring.addBreadcrumb(
        `User clicked: ${event.metadata.component} on ${event.path}`,
        'user',
        'info'
      );
    }

    // Send session events as messages
    if (event.type === 'session_start') {
      monitoring.captureMessage('User session started', {
        level: 'info',
        tags: { feature: 'analytics', event_type: 'session_start' },
        extra: { path: event.path, sessionId: event.metadata?.sessionId },
      });
    }
  } catch (error) {
    console.warn('Failed to send analytics to telemetry:', error);
  }
}

/**
 * Send analytics metrics summary to telemetry (called periodically)
 */
export function reportMetricsToTelemetry(metrics: AnalyticsMetrics): void {
  try {
    monitoring.captureMessage('Analytics metrics report', {
      level: 'info',
      tags: {
        feature: 'analytics',
        event_type: 'metrics_report',
      },
      extra: {
        totalPageViews: metrics.totalPageViews,
        uniquePages: metrics.uniquePages,
        totalClicks: metrics.totalClicks,
        averageSessionDuration: metrics.averageSessionDuration,
        topPages: metrics.topPages.slice(0, 5), // Top 5 pages
        topComponents: metrics.clicksByComponent.slice(0, 5), // Top 5 components
      },
    });
  } catch (error) {
    console.warn('Failed to report metrics to telemetry:', error);
  }
}

/**
 * Create empty analytics data structure
 */
function createEmptyAnalyticsData(): AnalyticsData {
  return {
    events: [],
    sessionId: secureRandomString(16),
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };
}
