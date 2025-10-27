import { describe, expect, it } from 'vitest';

// Learnings Loop: unit test for doctor metrics JSON parsing
describe('Doctor Metrics JSON', () => {
  it('parses valid LEARNINGS_STATS JSON line', () => {
    const sampleOutput =
      'LEARNINGS_STATS={"micro_lessons_total":3,"top10_updated_at":"2025-09-21T16:41:13.235Z","display_guard_violations_last_7d":0}';

    // Extract JSON part after the equals sign
    const jsonPart = sampleOutput.split('=')[1];
    const parsed = JSON.parse(jsonPart);

    expect(parsed).toHaveProperty('micro_lessons_total');
    expect(parsed).toHaveProperty('top10_updated_at');
    expect(parsed).toHaveProperty('display_guard_violations_last_7d');

    expect(typeof parsed.micro_lessons_total).toBe('number');
    expect(typeof parsed.display_guard_violations_last_7d).toBe('number');
    // top10_updated_at can be null or a string
    expect(parsed.top10_updated_at === null || typeof parsed.top10_updated_at === 'string').toBe(
      true
    );
  });

  it('handles null timestamp in LEARNINGS_STATS', () => {
    const sampleOutput =
      'LEARNINGS_STATS={"micro_lessons_total":0,"top10_updated_at":null,"display_guard_violations_last_7d":0}';

    const jsonPart = sampleOutput.split('=')[1];
    const parsed = JSON.parse(jsonPart);

    expect(parsed.top10_updated_at).toBe(null);
    expect(parsed.micro_lessons_total).toBe(0);
  });

  it('validates ISO-8601 timestamp format when present', () => {
    const sampleOutput =
      'LEARNINGS_STATS={"micro_lessons_total":1,"top10_updated_at":"2025-09-21T16:41:13.235Z","display_guard_violations_last_7d":0}';

    const jsonPart = sampleOutput.split('=')[1];
    const parsed = JSON.parse(jsonPart);

    if (parsed.top10_updated_at) {
      // Should be valid ISO-8601 format
      const date = new Date(parsed.top10_updated_at);
      expect(date.toISOString()).toBe(parsed.top10_updated_at);

      // Should end with Z (UTC timezone)
      expect(parsed.top10_updated_at).toMatch(/Z$/);
    }
  });
});
