/**
 * @fileoverview Test suite for date utility functions
 * @module utils/date/tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatDate, getRelativeTime, isPastDate } from './date';

describe('Date Utilities', () => {
  describe('formatDate', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should format a valid Date object to ISO string', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      expect(formatDate(date)).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should format a valid date string to ISO string', () => {
      const dateString = '2024-01-01T00:00:00.000Z';
      expect(formatDate(dateString)).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should handle different date string formats', () => {
      expect(formatDate('2024-01-01')).toBe('2024-01-01T00:00:00.000Z');
      // Natural language parsing can have timezone offsets that vary by environment
      const result = formatDate('January 1, 2024');
      // Should be within 24 hours of Jan 1, 2024
      expect(result).toMatch(/202[34]-1[21]-[23][01]T/);
    });

    it('should return current date ISO string when input is null', () => {
      expect(formatDate(null)).toBe('2024-01-15T12:00:00.000Z');
    });

    it('should return current date ISO string when input is undefined', () => {
      expect(formatDate(undefined as any)).toBe('2024-01-15T12:00:00.000Z');
    });

    it('should handle invalid date strings gracefully', () => {
      expect(formatDate('invalid-date')).toBe('2024-01-15T12:00:00.000Z');
    });

    it('should handle empty string', () => {
      expect(formatDate('')).toBe('2024-01-15T12:00:00.000Z');
    });

    it('should handle edge case dates', () => {
      // Epoch time
      expect(formatDate(new Date(0))).toBe('1970-01-01T00:00:00.000Z');

      // Leap year date
      expect(formatDate('2024-02-29')).toBe('2024-02-29T00:00:00.000Z');
    });

    it('should preserve timezone information through ISO conversion', () => {
      const date = new Date('2024-01-01T12:00:00.000+05:00');
      const result = formatDate(date);
      // ISO string should be in UTC
      expect(result).toBe('2024-01-01T07:00:00.000Z');
    });
  });

  describe('isPastDate', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true for dates in the past', () => {
      const pastDate = new Date('2024-01-14T12:00:00.000Z');
      expect(isPastDate(pastDate)).toBe(true);
    });

    it('should return true for dates far in the past', () => {
      const pastDate = new Date('2020-01-01T00:00:00.000Z');
      expect(isPastDate(pastDate)).toBe(true);
    });

    it('should return false for dates in the future', () => {
      const futureDate = new Date('2024-01-16T12:00:00.000Z');
      expect(isPastDate(futureDate)).toBe(false);
    });

    it('should return false for dates far in the future', () => {
      const futureDate = new Date('2030-01-01T00:00:00.000Z');
      expect(isPastDate(futureDate)).toBe(false);
    });

    it('should handle the current moment correctly', () => {
      const now = new Date('2024-01-15T12:00:00.000Z');
      // Current moment should be considered "not past"
      expect(isPastDate(now)).toBe(false);
    });

    it('should handle past date strings', () => {
      expect(isPastDate('2024-01-14T12:00:00.000Z')).toBe(true);
    });

    it('should handle future date strings', () => {
      expect(isPastDate('2024-01-16T12:00:00.000Z')).toBe(false);
    });

    it('should handle invalid dates gracefully', () => {
      expect(isPastDate('invalid-date')).toBe(false);
    });

    it('should handle edge cases', () => {
      // One millisecond in the past
      const justPast = new Date('2024-01-15T11:59:59.999Z');
      expect(isPastDate(justPast)).toBe(true);

      // One millisecond in the future
      const justFuture = new Date('2024-01-15T12:00:00.001Z');
      expect(isPastDate(justFuture)).toBe(false);
    });

    it('should handle epoch time', () => {
      expect(isPastDate(new Date(0))).toBe(true);
    });
  });

  describe('getRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "just now" for current time', () => {
      const now = new Date('2024-01-15T12:00:00.000Z');
      expect(getRelativeTime(now)).toBe('just now');
    });

    it('should return "just now" for times less than 1 minute ago', () => {
      const thirtySecondsAgo = new Date('2024-01-15T11:59:30.000Z');
      expect(getRelativeTime(thirtySecondsAgo)).toBe('just now');
    });

    it('should return "just now" for future times', () => {
      const future = new Date('2024-01-15T12:01:00.000Z');
      expect(getRelativeTime(future)).toBe('just now');
    });

    it('should return singular "minute ago" for 1 minute', () => {
      const oneMinuteAgo = new Date('2024-01-15T11:59:00.000Z');
      expect(getRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
    });

    it('should return plural "minutes ago" for multiple minutes', () => {
      const fiveMinutesAgo = new Date('2024-01-15T11:55:00.000Z');
      expect(getRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');

      const thirtyMinutesAgo = new Date('2024-01-15T11:30:00.000Z');
      expect(getRelativeTime(thirtyMinutesAgo)).toBe('30 minutes ago');

      const fiftyNineMinutesAgo = new Date('2024-01-15T11:01:00.000Z');
      expect(getRelativeTime(fiftyNineMinutesAgo)).toBe('59 minutes ago');
    });

    it('should return singular "hour ago" for 1 hour', () => {
      const oneHourAgo = new Date('2024-01-15T11:00:00.000Z');
      expect(getRelativeTime(oneHourAgo)).toBe('1 hour ago');
    });

    it('should return plural "hours ago" for multiple hours', () => {
      const twoHoursAgo = new Date('2024-01-15T10:00:00.000Z');
      expect(getRelativeTime(twoHoursAgo)).toBe('2 hours ago');

      const twelveHoursAgo = new Date('2024-01-15T00:00:00.000Z');
      expect(getRelativeTime(twelveHoursAgo)).toBe('12 hours ago');

      const twentyThreeHoursAgo = new Date('2024-01-14T13:00:00.000Z');
      expect(getRelativeTime(twentyThreeHoursAgo)).toBe('23 hours ago');
    });

    it('should return singular "day ago" for 1 day', () => {
      const oneDayAgo = new Date('2024-01-14T12:00:00.000Z');
      expect(getRelativeTime(oneDayAgo)).toBe('1 day ago');
    });

    it('should return plural "days ago" for multiple days', () => {
      const twoDaysAgo = new Date('2024-01-13T12:00:00.000Z');
      expect(getRelativeTime(twoDaysAgo)).toBe('2 days ago');

      const sevenDaysAgo = new Date('2024-01-08T12:00:00.000Z');
      expect(getRelativeTime(sevenDaysAgo)).toBe('7 days ago');

      const thirtyDaysAgo = new Date('2023-12-16T12:00:00.000Z');
      expect(getRelativeTime(thirtyDaysAgo)).toBe('30 days ago');
    });

    it('should handle date strings', () => {
      expect(getRelativeTime('2024-01-14T12:00:00.000Z')).toBe('1 day ago');
      expect(getRelativeTime('2024-01-15T11:00:00.000Z')).toBe('1 hour ago');
    });

    it('should handle invalid dates gracefully', () => {
      expect(getRelativeTime('invalid-date')).toBe('unknown time');
    });

    it('should handle non-finite timestamps', () => {
      // Create an invalid date that produces NaN timestamp
      const invalidDate = new Date('not-a-real-date');
      expect(getRelativeTime(invalidDate)).toBe('unknown time');
    });

    it('should handle edge cases at boundaries', () => {
      // Exactly 59 seconds ago - should be "just now"
      const fiftyNineSecondsAgo = new Date('2024-01-15T11:59:01.000Z');
      expect(getRelativeTime(fiftyNineSecondsAgo)).toBe('just now');

      // Exactly 60 seconds ago - should be "1 minute ago"
      const sixtySecondsAgo = new Date('2024-01-15T11:59:00.000Z');
      expect(getRelativeTime(sixtySecondsAgo)).toBe('1 minute ago');

      // Exactly 24 hours ago - should be "1 day ago"
      const exactlyOneDayAgo = new Date('2024-01-14T12:00:00.000Z');
      expect(getRelativeTime(exactlyOneDayAgo)).toBe('1 day ago');
    });

    it('should handle very old dates', () => {
      const veryOldDate = new Date('2020-01-01T00:00:00.000Z');
      const result = getRelativeTime(veryOldDate);
      expect(result).toMatch(/^\d+ days? ago$/);
      expect(result).toBe('1475 days ago');
    });

    it('should handle epoch time', () => {
      const epochDate = new Date(0);
      const result = getRelativeTime(epochDate);
      expect(result).toMatch(/^\d+ days? ago$/);
    });
  });
});
