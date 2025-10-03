import { describe, it, expect } from 'vitest';
import { sum } from '@/lib/sum';

describe('sum function', () => {
  it('adds two positive numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });

  it('adds negative numbers', () => {
    expect(sum(-2, -3)).toBe(-5);
  });

  it('adds positive and negative numbers', () => {
    expect(sum(5, -3)).toBe(2);
  });

  it('adds zero', () => {
    expect(sum(0, 5)).toBe(5);
    expect(sum(5, 0)).toBe(5);
  });
});
