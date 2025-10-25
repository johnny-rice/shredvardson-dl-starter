/**
 * Shared utilities for design system scripts
 */

import * as path from 'path';

/**
 * Sanitize component name to safe kebab-case format
 *
 * Ensures the output contains only lowercase letters, numbers, and hyphens,
 * with no path traversal characters or unsafe symbols.
 *
 * @param componentName - The component name to sanitize (e.g., "LineChart", "UserProfile")
 * @returns Safe kebab-case string (e.g., "line-chart", "user-profile")
 *
 * @example
 * ```ts
 * toKebabCase("LineChart") // "line-chart"
 * toKebabCase("My..Component") // "my-component"
 * toKebabCase("../EvilPath") // "evil-path"
 * ```
 */
export function toKebabCase(componentName: string): string {
  return componentName
    .replace(/([a-z])([A-Z])/g, '$1-$2') // PascalCase → kebab-case
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace unsafe chars with hyphen
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, ''); // Trim leading/trailing hyphens
}

/**
 * Get the canonical UI components directory path
 *
 * @returns Absolute path to packages/ui/src/components/ui
 */
export function getUiComponentsDir(): string {
  return path.join(process.cwd(), 'packages/ui/src/components/ui');
}

/**
 * Validate that a resolved path is contained within the UI components directory
 *
 * Prevents path traversal attacks by ensuring the resolved path starts with the
 * canonical UI components directory.
 *
 * @param resolvedPath - The absolute path to validate
 * @returns true if the path is safe, false otherwise
 *
 * @example
 * ```ts
 * const safe = path.resolve(getUiComponentsDir(), 'button');
 * const evil = path.resolve(getUiComponentsDir(), '../../../etc/passwd');
 *
 * isPathContained(safe)  // true
 * isPathContained(evil)  // false
 * ```
 */
export function isPathContained(resolvedPath: string): boolean {
  const uiDir = getUiComponentsDir();
  const resolvedRoot = path.resolve(uiDir);
  return resolvedPath.startsWith(resolvedRoot + path.sep) || resolvedPath === resolvedRoot;
}

/**
 * Create a safe component path with validation
 *
 * Combines sanitization and path containment checks to produce a safe directory path
 * for a new component.
 *
 * @param componentName - The component name (will be sanitized)
 * @returns Object with { kebabName, basePath } or throws error if unsafe
 * @throws Error if the resolved path escapes the UI components directory
 *
 * @example
 * ```ts
 * const { kebabName, basePath } = createSafeComponentPath('LineChart');
 * // { kebabName: 'line-chart', basePath: '/path/to/packages/ui/src/components/ui/line-chart' }
 *
 * createSafeComponentPath('../EvilPath'); // throws Error
 * ```
 */
export function createSafeComponentPath(componentName: string): { kebabName: string; basePath: string } {
  const kebabName = toKebabCase(componentName);

  if (!kebabName) {
    throw new Error(`Invalid component name: "${componentName}" resulted in empty kebab-case name`);
  }

  const uiDir = getUiComponentsDir();
  const basePath = path.join(uiDir, kebabName);
  const resolvedPath = path.resolve(basePath);

  if (!isPathContained(resolvedPath)) {
    throw new Error(`Unsafe component path: "${componentName}" resolves outside UI components directory`);
  }

  return { kebabName, basePath };
}
