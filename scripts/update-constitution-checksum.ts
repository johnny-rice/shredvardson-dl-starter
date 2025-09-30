import { readFileSync, writeFileSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { resolve } from 'path';
import { resolveDoc } from './utils/resolveDoc';

interface ContextMapArea {
  path: string;
  purpose: string;
  allowed: string[];
  avoid: string[];
  tags: string[];
}

interface ContextMap {
  version: number;
  areas: ContextMapArea[];
}

function hashFile(filePath: string): string | null {
  try {
    const stat = statSync(resolve(filePath));
    if (!stat.isFile()) {
      return null; // Skip directories
    }
    const content = readFileSync(filePath, 'utf8');
    return createHash('sha256').update(content).digest('hex').substring(0, 16);
  } catch (error) {
    console.warn(`Warning: Could not hash ${filePath} - ${error}`);
    return 'missing';
  }
}

function main() {
  const contextMapPath = resolve('docs/llm/context-map.json');
  const checksumPath = resolve('docs/llm/CONSTITUTION.CHECKSUM');

  // Read context map to get binding source files
  const contextMap: ContextMap = JSON.parse(readFileSync(contextMapPath, 'utf8'));

  // Additional binding sources not in context-map
  const bindingSources = [
    resolveDoc('CLAUDE.md'),
    resolveDoc('docs/llm/context-map.json'),
    resolveDoc('docs/llm/STARTER_MANIFEST.json'),
    'docs/llm/NEW_APP_KICKOFF.md',
    'docs/llm/CONTRIBUTING_LLMS.md',
    'docs/llm/QUALITY_PIPELINE.md',
    'packages/config/eslint.config.mjs',
    'packages/config/prettier.config.js',
    'packages/ui/styles/tokens.css',
    'apps/web/app.config.ts',
  ];

  // Add paths from context-map areas
  contextMap.areas.forEach((area) => {
    if (!bindingSources.includes(area.path)) {
      bindingSources.push(area.path);
    }
  });

  // Generate checksums (files only, sorted alphabetically)
  const checksums: Record<string, string> = {};
  let fileCount = 0;

  Array.from(new Set(bindingSources))
    .sort((a, b) => a.localeCompare(b, 'en'))
    .forEach((file) => {
      const hash = hashFile(resolve(file));
      if (hash && hash !== 'missing') {
        checksums[file] = hash;
        fileCount++;
      }
    });

  // Write checksum file with deterministic key ordering
  const sortedChecksums = Object.fromEntries(
    Object.entries(checksums).sort(([a], [b]) => a.localeCompare(b))
  );

  const checksumContent = {
    generated: new Date().toISOString(),
    version: '0.1.1',
    algorithm: 'sha256-trunc16',
    checksums: sortedChecksums,
  };

  writeFileSync(checksumPath, JSON.stringify(checksumContent, null, 2) + '\n');

  console.log(`✅ Constitution checksum updated: ${fileCount} files hashed`);
}

main();
