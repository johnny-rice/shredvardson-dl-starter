/**
 * Analytics event types for user behavior tracking
 */

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'click' | 'session_start' | 'session_end';
  path: string;
  timestamp: number;
  metadata?: Record<string, string | number>;
}

export interface AnalyticsData {
  events: AnalyticsEvent[];
  sessionId: string;
  createdAt: number;
  lastUpdated: number;
}

export interface AnalyticsMetrics {
  totalPageViews: number;
  uniquePages: number;
  totalClicks: number;
  averageSessionDuration: number;
  topPages: Array<{ path: string; views: number }>;
  clicksByComponent: Array<{ component: string; clicks: number }>;
}

export interface ChartData {
  title: string;
  type: 'bar' | 'line' | 'pie';
  data: Array<{ label: string; value: number }>;
}
