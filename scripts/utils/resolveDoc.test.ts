import { resolveDoc, docExists } from './resolveDoc';

describe('resolveDoc', () => {
  it('resolves CLAUDE.md to docs/ai/CLAUDE.md', () => {
    expect(resolveDoc('CLAUDE.md')).toBe('docs/ai/CLAUDE.md');
  });

  it('resolves relative ./CLAUDE.md to docs/ai/CLAUDE.md', () => {
    expect(resolveDoc('./CLAUDE.md')).toBe('docs/ai/CLAUDE.md');
  });

  it('returns other paths unchanged', () => {
    expect(resolveDoc('docs/other.md')).toBe('docs/other.md');
    expect(resolveDoc('README.md')).toBe('README.md');
  });
});

describe('docExists', () => {
  it('checks existence at resolved path', () => {
    // This will depend on actual file existence - basic smoke test
    expect(typeof docExists('CLAUDE.md')).toBe('boolean');
    expect(typeof docExists('README.md')).toBe('boolean');
  });
});
