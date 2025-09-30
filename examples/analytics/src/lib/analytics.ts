/**
 * 🚧 EXAMPLE ONLY: Secure Analytics Utilities
 *
 * This is a secure reference implementation that fixes CodeQL security issues.
 * Uses CSPRNG instead of Math.random() for cryptographically secure IDs.
 *
 * Status: Example code - not used in production starter template
 */

import type { AnalyticsEvent, AnalyticsData } from '@shared/types';

// --- Secure random helpers (browser + Node/SSR) -----------------------------

function getCrypto() {
  // Browser / Workers
  if (typeof globalThis !== 'undefined' && globalThis.crypto) return globalThis.crypto;
  try {
    // Node >=16
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require('crypto');
    return nodeCrypto;
  } catch {
    return undefined;
  }
}

/**
 * Return URL-safe, cryptographically secure random string of length `len`.
 * Uses base64url-encoding of random bytes; avoids modulo bias.
 */
function secureRandomString(len = 12): string {
  const c = getCrypto();
  if (!c) throw new Error('No crypto available for secure randomness');

  // Use randomUUID when available (trim to length)
  if (c.randomUUID && typeof c.randomUUID === 'function') {
    return c.randomUUID().replace(/-/g, '').slice(0, len);
  }

  // get random bytes (browser or Node)
  let bytes: Uint8Array;
  if (c.getRandomValues) {
    bytes = new Uint8Array(Math.ceil((len * 6) / 8)); // ~6 bits/char with base64
    c.getRandomValues(bytes);
  } else if (c.randomBytes) {
    bytes = c.randomBytes(Math.ceil((len * 6) / 8));
  } else {
    throw new Error('No CSPRNG available');
  }

  // base64url encode then slice
  // In browser, Buffer may not exist; polyfill via btoa if needed
  let b64: string;
  try {
    // Node path
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Buffer } = require('buffer');
    b64 = Buffer.from(bytes).toString('base64');
  } catch {
    // Browser path
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    b64 = btoa(binary);
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '').slice(0, len);
}

const STORAGE_KEY = 'dl-analytics';
const MAX_EVENTS = 1000; // Prevent storage bloat

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  // Keep timestamp prefix for ordering; use CSPRNG suffix
  return `${Date.now().toString(36)}-${secureRandomString(12)}`;
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
    id: `${Date.now().toString(36)}-${secureRandomString(12)}`,
    type,
    path,
    timestamp: Date.now(),
    ...(metadata ? { metadata } : {}),
  };
}

/**
 * Get analytics data from storage
 */
export function getAnalyticsData(): AnalyticsData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Save analytics data to storage
 */
export function saveAnalyticsData(data: AnalyticsData): void {
  try {
    // Trim events if too many
    if (data.events.length > MAX_EVENTS) {
      data.events = data.events.slice(-MAX_EVENTS);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage quota exceeded - ignore
  }
}

/**
 * Track an analytics event
 */
export function trackEvent(
  type: AnalyticsEvent['type'],
  path: string,
  metadata?: Record<string, string | number>
): void {
  if (typeof window === 'undefined') return; // SSR safety

  const event = createEvent(type, path, metadata);
  const data = getAnalyticsData() || {
    sessionId: generateSessionId(),
    events: [],
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };

  data.events.push(event);
  data.lastUpdated = Date.now();

  saveAnalyticsData(data);
}

/**
 * Track a page view
 */
export function trackPageView(path: string): void {
  trackEvent('page_view', path);
}

/**
 * Track a click event
 */
export function trackClick(path: string, component: string): void {
  trackEvent('click', path, { component });
}

/**
 * Start a new session
 */
export function startSession(): void {
  trackEvent('session_start', window.location.pathname);
}

/**
 * End the current session
 */
export function endSession(): void {
  trackEvent('session_end', window.location.pathname);
}

/**
 * Get analytics summary for display
 */
export function getAnalyticsSummary() {
  const data = getAnalyticsData();
  if (!data) return null;

  const pageViews = data.events.filter((e) => e.type === 'page_view');
  const clicks = data.events.filter((e) => e.type === 'click');
  const uniquePages = new Set(pageViews.map((e) => e.path)).size;

  return {
    totalEvents: data.events.length,
    pageViews: pageViews.length,
    clicks: clicks.length,
    uniquePages,
    sessionDuration: data.lastUpdated - data.createdAt,
  };
}
