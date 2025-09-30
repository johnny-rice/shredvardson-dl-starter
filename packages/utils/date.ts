/**
 * Date utility functions for the application
 * Safe, tested date operations
 */

/**
 * Format a date to ISO string with fallback
 * @param date - Date to format
 * @returns ISO string or current date if invalid
 */
export function formatDate(date: Date | string | null): string {
  if (!date) {
    return new Date().toISOString();
  }

  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    return parsedDate.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns true if date is before now
 */
export function isPastDate(date: Date | string): boolean {
  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    return parsedDate.getTime() < Date.now();
  } catch {
    return false;
  }
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param date - Date to compare
 * @returns Human-readable relative time
 */
export function getRelativeTime(date: Date | string): string {
  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    const t = parsedDate.getTime();
    if (!Number.isFinite(t)) return 'unknown time';
    const diffMs = Date.now() - t;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMs <= 0 || diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } catch {
    return 'unknown time';
  }
}
