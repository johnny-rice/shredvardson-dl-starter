#!/usr/bin/env node

/**
 * Clean Examples Script
 *
 * Removes example workflow artifacts when creating a new project from the template.
 * This script is intended to be run by users who want to start with a clean slate.
 *
 * Usage: pnpm tsx scripts/clean-examples.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

function sanitizeHeaderContent(content) {
  let prev;
  do {
    prev = content;
    content = content
      // Remove analytics imports/usages
      .replace(/import { useTrackClick } from '\.\/AnalyticsProvider';\n?/g, '')
      .replace(/const trackHelpClick = useTrackClick\('header-help'\);\n\s*/g, '')
      .replace(/const trackAnalyticsClick = useTrackClick\('header-analytics'\);\n\s*/g, '')
      // Remove any React onClick attribute safely (generic)
      .replace(/onClick=\{[^}]*\}/g, '')
      // Remove data-analytics attrs
      .replace(/data-analytics="header-help"\s*/g, '')
      // Remove Analytics link blocks entirely
      .replace(/\s*<Link[^>]*Analytics[^>]*>[\s\S]*?<\/Link>/g, '')
      // Normalize whitespace at tag boundaries
      .replace(/\s+>/g, '>')
      .replace(/>\s+</g, '><');
  } while (content !== prev);
  return content;
}

async function cleanExamples() {
  console.log('🧹 Cleaning example workflow artifacts...\n');

  const itemsToRemove = [
    'examples/',
    'apps/web/src/lib/analytics.ts',
    'apps/web/src/components/AnalyticsProvider.tsx',
    'apps/web/src/components/AnalyticsChart.tsx',
    'apps/web/src/types/test-env.d.ts',
    'apps/web/tests/analytics.spec.ts',
    'packages/types/src/analytics.ts',
  ];

  for (const item of itemsToRemove) {
    const fullPath = path.join(projectRoot, item);

    try {
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        await fs.rm(fullPath, { recursive: true, force: true });
        console.log(`✅ Removed directory: ${item}`);
      } else {
        await fs.unlink(fullPath);
        console.log(`✅ Removed file: ${item}`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.log(`⚠️  Could not remove ${item}: ${error.message}`);
      }
    }
  }

  // Clean up analytics import from types index
  const typesIndexPath = path.join(projectRoot, 'packages/types/index.ts');
  try {
    const content = await fs.readFile(typesIndexPath, 'utf-8');
    const cleanedContent = content.replace(/export \* from '\.\/src\/analytics';\n?/g, '');
    await fs.writeFile(typesIndexPath, cleanedContent);
    console.log('✅ Cleaned analytics export from types/index.ts');
  } catch (error) {
    console.log(`⚠️  Could not clean types index: ${error.message}`);
  }

  // Update Header.tsx to remove analytics imports and tracking
  const headerPath = path.join(projectRoot, 'apps/web/src/components/Header.tsx');
  try {
    const content = await fs.readFile(headerPath, 'utf-8');
    const cleanedContent = sanitizeHeaderContent(content);

    await fs.writeFile(headerPath, cleanedContent);
    console.log('✅ Cleaned Header.tsx analytics code');
  } catch (error) {
    console.log(`⚠️  Could not clean Header.tsx: ${error.message}`);
  }

  // Remove analytics page
  const analyticsPagePath = path.join(projectRoot, 'apps/web/src/app/(app)/dashboard/analytics');
  try {
    await fs.rm(analyticsPagePath, { recursive: true, force: true });
    console.log('✅ Removed analytics dashboard page');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.log(`⚠️  Could not remove analytics page: ${error.message}`);
    }
  }

  // Update layout to remove AnalyticsProvider
  const layoutPath = path.join(projectRoot, 'apps/web/src/app/(app)/layout.tsx');
  try {
    const content = await fs.readFile(layoutPath, 'utf-8');
    const cleanedContent = content
      .replace(/import { AnalyticsProvider } from '@\/components\/AnalyticsProvider';\n?/g, '')
      .replace(/\s*<AnalyticsProvider>\n?/g, '')
      .replace(/\s*<\/AnalyticsProvider>\n?/g, '');

    await fs.writeFile(layoutPath, cleanedContent);
    console.log('✅ Cleaned layout.tsx analytics provider');
  } catch (error) {
    console.log(`⚠️  Could not clean layout.tsx: ${error.message}`);
  }

  // Clean env.example
  const envExamplePath = path.join(projectRoot, '.env.example');
  try {
    const content = await fs.readFile(envExamplePath, 'utf-8');
    const cleanedContent = content
      .replace(/# Analytics example feature.*\n?/g, '')
      .replace(/NEXT_PUBLIC_ENABLE_ANALYTICS=false\n?/g, '');

    await fs.writeFile(envExamplePath, cleanedContent);
    console.log('✅ Cleaned .env.example analytics flag');
  } catch (error) {
    console.log(`⚠️  Could not clean .env.example: ${error.message}`);
  }

  console.log('\n🎉 Example cleanup complete!');
  console.log('Your starter template is now clean and ready for development.');
  console.log('\nNext steps:');
  console.log('1. Review docs/ai/CLAUDE.md for development workflows');
  console.log('2. Run `pnpm tsx scripts/starter-doctor.ts` to verify setup');
  console.log('3. Start developing with `/dev:plan-feature` for simple changes');
  console.log('4. Use `/specify` → `/plan` → `/tasks` for complex features');
}

cleanExamples().catch(console.error);
