#!/usr/bin/env tsx
/**
 * Documentation Sync Checker
 *
 * Analyzes git changes and identifies documentation gaps.
 * Used by /git:prepare-pr to suggest documentation updates.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface DocGap {
  type: 'slash-command' | 'script' | 'env-var' | 'api-route' | 'config';
  item: string;
  suggestedDoc: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

function getGitDiff(): string {
  try {
    return execSync('git diff --cached --name-only', { encoding: 'utf-8' });
  } catch {
    // Fall back to unstaged changes if no staged files
    try {
      return execSync('git diff --name-only', { encoding: 'utf-8' });
    } catch {
      return '';
    }
  }
}

function getFileContent(path: string): string {
  try {
    const fullPath = resolve(process.cwd(), path);
    if (existsSync(fullPath)) {
      return readFileSync(fullPath, 'utf-8');
    }
  } catch {}
  return '';
}

function checkSlashCommands(changedFiles: string[]): DocGap[] {
  const gaps: DocGap[] = [];
  const commandFiles = changedFiles.filter(f => f.startsWith('.claude/commands/') && f.endsWith('.md'));

  if (commandFiles.length === 0) return gaps;

  const claudeDoc = getFileContent('docs/ai/CLAUDE.md');

  for (const cmdFile of commandFiles) {
    // Extract command name from file path
    const match = cmdFile.match(/\.claude\/commands\/([^/]+)\/([^/]+)\.md$/);
    if (!match) continue;

    const [, category, name] = match;
    const commandRef = `/${category}:${name}`;

    // Check if CLAUDE.md references this command
    if (!claudeDoc.includes(commandRef)) {
      gaps.push({
        type: 'slash-command',
        item: commandRef,
        suggestedDoc: 'docs/ai/CLAUDE.md',
        priority: 'high',
        reason: `New slash command ${commandRef} not referenced in CLAUDE.md`
      });
    }
  }

  return gaps;
}

function checkPackageScripts(changedFiles: string[]): DocGap[] {
  const gaps: DocGap[] = [];

  if (!changedFiles.includes('package.json')) return gaps;

  try {
    const gitDiff = execSync('git diff --cached package.json', { encoding: 'utf-8' });

    // Look for new script additions (lines starting with + in scripts section)
    const scriptAdditions = gitDiff.match(/^\+\s+"([^"]+)":\s+"[^"]+"/gm);
    if (!scriptAdditions) return gaps;

    const readme = getFileContent('README.md');

    for (const addition of scriptAdditions) {
      const scriptName = addition.match(/"([^"]+)":/)?.[1];
      if (!scriptName) continue;

      // Skip if already documented
      if (readme.includes(scriptName)) continue;

      gaps.push({
        type: 'script',
        item: `pnpm ${scriptName}`,
        suggestedDoc: 'README.md',
        priority: 'medium',
        reason: `New package script "${scriptName}" not documented in README`
      });
    }
  } catch {}

  return gaps;
}

function checkEnvVariables(changedFiles: string[]): DocGap[] {
  const gaps: DocGap[] = [];
  const relevantFiles = changedFiles.filter(f =>
    f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx')
  );

  if (relevantFiles.length === 0) return gaps;

  const envDoc = getFileContent('docs/setup/ENVIRONMENT.md') || getFileContent('README.md');
  const seenVars = new Set<string>();

  for (const file of relevantFiles) {
    try {
      const diff = execSync(`git diff --cached ${file}`, { encoding: 'utf-8' });

      // Look for new env var usage: process.env.SOMETHING
      const envVarMatches = diff.matchAll(/^\+.*process\.env\.([A-Z_][A-Z0-9_]*)/gm);

      for (const match of envVarMatches) {
        const varName = match[1];
        if (seenVars.has(varName)) continue;
        seenVars.add(varName);

        // Skip common/standard vars
        if (['NODE_ENV', 'PATH', 'HOME'].includes(varName)) continue;

        // Check if documented
        if (!envDoc.includes(varName)) {
          gaps.push({
            type: 'env-var',
            item: varName,
            suggestedDoc: existsSync('docs/setup/ENVIRONMENT.md') ? 'docs/setup/ENVIRONMENT.md' : 'README.md',
            priority: 'high',
            reason: `New environment variable ${varName} not documented`
          });
        }
      }
    } catch {}
  }

  return gaps;
}

function checkApiRoutes(changedFiles: string[]): DocGap[] {
  const gaps: DocGap[] = [];
  const routeFiles = changedFiles.filter(f =>
    f.includes('/api/') && (f.includes('route.ts') || f.includes('route.js'))
  );

  if (routeFiles.length === 0) return gaps;

  const apiDoc = getFileContent('docs/api/README.md') || getFileContent('README.md');

  for (const routeFile of routeFiles) {
    // Extract route path from file structure
    const routeMatch = routeFile.match(/\/api\/(.+)\/route\.[jt]sx?$/);
    if (!routeMatch) continue;

    const routePath = `/api/${routeMatch[1]}`;

    // Check if API route is documented
    if (!apiDoc.includes(routePath)) {
      gaps.push({
        type: 'api-route',
        item: routePath,
        suggestedDoc: existsSync('docs/api/README.md') ? 'docs/api/README.md' : 'README.md',
        priority: 'medium',
        reason: `New API route ${routePath} not documented`
      });
    }
  }

  return gaps;
}

function formatOutput(gaps: DocGap[]): void {
  if (gaps.length === 0) {
    console.log('✅ No documentation gaps detected');
    return;
  }

  console.log('\n📝 Documentation update suggestions:\n');

  // Group by priority
  const high = gaps.filter(g => g.priority === 'high');
  const medium = gaps.filter(g => g.priority === 'medium');
  const low = gaps.filter(g => g.priority === 'low');

  const printGaps = (gaps: DocGap[], emoji: string) => {
    for (const gap of gaps) {
      console.log(`${emoji} ${gap.reason}`);
      console.log(`   → Update: ${gap.suggestedDoc}`);
      console.log('');
    }
  };

  if (high.length > 0) {
    console.log('🔴 High Priority:');
    printGaps(high, '  •');
  }

  if (medium.length > 0) {
    console.log('🟡 Medium Priority:');
    printGaps(medium, '  •');
  }

  if (low.length > 0) {
    console.log('🟢 Low Priority:');
    printGaps(low, '  •');
  }

  console.log('💡 Tip: These are suggestions, not blockers. Review and update as needed.\n');
}

function main(): void {
  const diffOutput = getGitDiff();
  if (!diffOutput.trim()) {
    console.log('No changes detected');
    process.exit(0);
  }

  const changedFiles = diffOutput.trim().split('\n');

  const allGaps: DocGap[] = [
    ...checkSlashCommands(changedFiles),
    ...checkPackageScripts(changedFiles),
    ...checkEnvVariables(changedFiles),
    ...checkApiRoutes(changedFiles)
  ];

  formatOutput(allGaps);

  // Exit with 0 (non-blocking check)
  process.exit(0);
}

main();
