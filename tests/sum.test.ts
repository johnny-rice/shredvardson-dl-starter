import { describe, expect, it } from 'vitest';
import { sum } from '../apps/web/src/lib/sum';

describe('sum', () => {
  it('adds positive numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });

  it('adds negative numbers', () => {
    expect(sum(-2, -3)).toBe(-5);
  });

  it('adds with zero', () => {
    expect(sum(5, 0)).toBe(5);
  });
});
