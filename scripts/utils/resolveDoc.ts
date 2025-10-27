/**
 * Resolve documentation paths - centralizes doc path resolution for future-proofing
 */

import { existsSync } from 'node:fs';

/**
 * Resolve a documentation path to its actual location
 */
export function resolveDoc(path: string): string {
  // Handle legacy CLAUDE.md references
  if (path === 'CLAUDE.md') {
    return 'docs/ai/CLAUDE.md';
  }

  // Handle relative paths that should be in docs/
  if (path.startsWith('./') && path.endsWith('.md')) {
    const relativePath = path.slice(2);
    if (relativePath === 'CLAUDE.md') {
      return 'docs/ai/CLAUDE.md';
    }
  }

  // Return path as-is for absolute and other paths
  return path;
}

/**
 * Check if a documentation file exists at the resolved path
 */
export function docExists(path: string): boolean {
  const resolved = resolveDoc(path);
  try {
    return existsSync(resolved);
  } catch {
    return false;
  }
}
