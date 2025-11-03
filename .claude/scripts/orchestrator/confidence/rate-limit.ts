/**
 * Rate limiting for auto-research triggers
 * Simple Map-based storage with TTL cleanup
 */

interface RateLimitEntry {
  count: number;
  createdAt: number;
}

/**
 * Rate limit storage: sessionId → count + timestamp
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Default configuration
 */
const DEFAULT_MAX_TRIGGERS = 10;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Determine whether another auto-research trigger is permitted for the given session.
 *
 * @param sessionId - The session identifier to check
 * @param maxTriggers - Maximum allowed triggers for the session (defaults to DEFAULT_MAX_TRIGGERS)
 * @returns `true` if another trigger is permitted for the session, `false` otherwise
 */
export function checkRateLimit(
  sessionId: string,
  maxTriggers: number = DEFAULT_MAX_TRIGGERS
): boolean {
  // Clean up expired entries
  cleanupExpired();

  const entry = rateLimitStore.get(sessionId);

  if (!entry) {
    return true; // No entry, allowed
  }

  return entry.count < maxTriggers;
}

/**
 * Increment rate limit counter for a session
 *
 * @param sessionId - Session identifier
 * @returns New count after increment
 */
export function incrementRateLimit(sessionId: string): number {
  const entry = rateLimitStore.get(sessionId);

  if (!entry) {
    rateLimitStore.set(sessionId, {
      count: 1,
      createdAt: Date.now(),
    });
    return 1;
  }

  entry.count += 1;
  return entry.count;
}

/**
 * Get current rate limit count for a session
 *
 * @param sessionId - Session identifier
 * @returns Current count (0 if no entry)
 */
export function getRateLimitCount(sessionId: string): number {
  const entry = rateLimitStore.get(sessionId);
  return entry?.count || 0;
}

/**
 * Reset rate limit for a session
 *
 * @param sessionId - Session identifier
 */
export function resetRateLimit(sessionId: string): void {
  rateLimitStore.delete(sessionId);
}

/**
 * Removes rate limit entries older than the specified time-to-live.
 *
 * @param ttlMs - Maximum age in milliseconds for entries to keep; entries older than `ttlMs` are deleted. Defaults to 24 hours.
 */
function cleanupExpired(ttlMs: number = DEFAULT_TTL_MS): void {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [sessionId, entry] of rateLimitStore.entries()) {
    if (now - entry.createdAt > ttlMs) {
      expiredKeys.push(sessionId);
    }
  }

  for (const key of expiredKeys) {
    rateLimitStore.delete(key);
  }
}

/**
 * Produce a user-facing error message when a session has exceeded its auto-research trigger limit.
 *
 * @param sessionId - Session identifier whose usage will be reported
 * @param maxTriggers - Maximum allowed triggers for the session (defaults to DEFAULT_MAX_TRIGGERS)
 * @returns A message showing the current `{count}/{maxTriggers}` usage and advising to proceed or start a new planning session
 */
export function getRateLimitErrorMessage(
  sessionId: string,
  maxTriggers: number = DEFAULT_MAX_TRIGGERS
): string {
  const count = getRateLimitCount(sessionId);
  return `Rate limit exceeded: ${count}/${maxTriggers} auto-research triggers used in this session. Please proceed with the current confidence level or start a new planning session.`;
}

/**
 * Check rate limit and throw error if exceeded
 *
 * @param sessionId - Session identifier
 * @param maxTriggers - Maximum triggers per session
 * @throws Error if rate limit exceeded
 */
export function enforceRateLimit(
  sessionId: string,
  maxTriggers: number = DEFAULT_MAX_TRIGGERS
): void {
  if (!checkRateLimit(sessionId, maxTriggers)) {
    throw new Error(getRateLimitErrorMessage(sessionId, maxTriggers));
  }
}

/**
 * Remove all entries from the in-memory rate limit store.
 *
 * Intended for tests to reset global rate-limit state.
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
