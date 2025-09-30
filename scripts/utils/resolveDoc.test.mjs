import { resolveDoc, docExists } from './resolveDoc.mjs';

// Simple test runner
function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    process.exit(1);
  }
}

test('resolves CLAUDE.md to docs/ai/CLAUDE.md', () => {
  const result = resolveDoc('CLAUDE.md');
  if (result !== 'docs/ai/CLAUDE.md') {
    throw new Error(`Expected docs/ai/CLAUDE.md, got ${result}`);
  }
});

test('resolves relative ./CLAUDE.md to docs/ai/CLAUDE.md', () => {
  const result = resolveDoc('./CLAUDE.md');
  if (result !== 'docs/ai/CLAUDE.md') {
    throw new Error(`Expected docs/ai/CLAUDE.md, got ${result}`);
  }
});

test('returns other paths unchanged', () => {
  const result1 = resolveDoc('docs/other.md');
  const result2 = resolveDoc('README.md');

  if (result1 !== 'docs/other.md') {
    throw new Error(`Expected docs/other.md, got ${result1}`);
  }

  if (result2 !== 'README.md') {
    throw new Error(`Expected README.md, got ${result2}`);
  }
});

test('docExists returns boolean', () => {
  const result1 = docExists('CLAUDE.md');
  const result2 = docExists('README.md');

  if (typeof result1 !== 'boolean') {
    throw new Error(`Expected boolean, got ${typeof result1}`);
  }

  if (typeof result2 !== 'boolean') {
    throw new Error(`Expected boolean, got ${typeof result2}`);
  }
});

console.log('All tests completed successfully');
