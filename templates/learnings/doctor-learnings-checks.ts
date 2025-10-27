// Learning Loop: Doctor check functions for micro-lessons
// Extract these functions into your existing doctor script

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  fix?: string;
}

// Learning Loop: check if micro-lessons index exists and is current
function checkLearningsIndex(): CheckResult {
  const microLessonsDir = resolve('docs/micro-lessons');
  const indexFile = join(microLessonsDir, 'INDEX.md');

  if (!existsSync(microLessonsDir)) {
    return {
      name: 'Learning Index',
      status: 'pass',
      message: 'No micro-lessons directory found',
    };
  }

  // Gather lesson files (exclude template/index; case-insensitive)
  const lessonFiles: string[] = readdirSync(microLessonsDir)
    .filter((file: string) => {
      const lower = file.toLowerCase();
      return lower.endsWith('.md') && lower !== 'index.md' && lower !== 'template.md';
    })
    .map((file: string) => join(microLessonsDir, file));

  if (lessonFiles.length === 0) {
    return {
      name: 'Learning Index',
      status: 'pass',
      message: 'No micro-lessons found',
    };
  }

  if (!existsSync(indexFile)) {
    return {
      name: 'Learning Index',
      status: 'fail',
      message: `Found ${lessonFiles.length} micro-lesson(s) but no INDEX.md`,
      fix: 'Run `pnpm learn:index` to generate the index',
    };
  }

  try {
    const indexStats = statSync(indexFile);
    const indexContent = readFileSync(indexFile, 'utf8');

    // Check if index is newer than all lesson files
    const oldestAcceptableTime = Math.max(...lessonFiles.map((f) => statSync(f).mtime.getTime()));
    if (indexStats.mtime.getTime() < oldestAcceptableTime) {
      return {
        name: 'Learning Index',
        status: 'warn',
        message: 'INDEX.md is older than some lesson files',
        fix: 'Run `pnpm learn:index` to refresh the index',
      };
    }

    // Basic content validation
    if (indexContent.length < 50) {
      return {
        name: 'Learning Index',
        status: 'fail',
        message: 'INDEX.md appears empty or corrupted',
        fix: 'Run `pnpm learn:index` to regenerate the index',
      };
    }

    return {
      name: 'Learning Index',
      status: 'pass',
      message: `Learnings index present with ${lessonFiles.length} lessons`,
    };
  } catch (error) {
    return {
      name: 'Learning Index',
      status: 'fail',
      message: `Error reading INDEX.md: ${error}`,
      fix: 'Check file permissions or run `pnpm learn:index`',
    };
  }
}

// Learning Loop: guard for link drift in PR comments
function checkTop10LinkValidity(): CheckResult {
  const indexPath = resolve('docs/micro-lessons/INDEX.md');

  if (!existsSync(indexPath)) {
    return {
      name: 'Top-10 Link Validity',
      status: 'warn',
      message: 'Top-10 index file does not exist',
      fix: 'Run `pnpm learn:index` to generate the index',
    };
  }

  try {
    const content = readFileSync(indexPath, 'utf8');
    if (content.trim().length < 50) {
      return {
        name: 'Top-10 Link Validity',
        status: 'warn',
        message: 'Top-10 index appears empty or too short',
        fix: 'Run `pnpm learn:index` to regenerate the index',
      };
    }

    return {
      name: 'Top-10 Link Validity',
      status: 'pass',
      message: 'Top-10 index file exists and is accessible',
    };
  } catch (error) {
    return {
      name: 'Top-10 Link Validity',
      status: 'warn',
      message: `Cannot read Top-10 index: ${error}`,
      fix: 'Check file permissions or regenerate with `pnpm learn:index`',
    };
  }
}

// Learning Loop: retention rule for unused micro-lessons
function checkMicroLessonRetention(): CheckResult {
  const microLessonsDir = resolve('docs/micro-lessons');

  if (!existsSync(microLessonsDir)) {
    return {
      name: 'Micro-Lesson Retention',
      status: 'pass',
      message: 'No micro-lessons directory found',
    };
  }

  try {
    const lessonFiles = readdirSync(microLessonsDir)
      .filter(
        (file) =>
          file.endsWith('.md') && file !== 'INDEX.md' && !file.toLowerCase().includes('template')
      )
      .map((file) => join(microLessonsDir, file));

    const staleFiles: string[] = [];
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    for (const filePath of lessonFiles) {
      try {
        const content = readFileSync(filePath, 'utf8');
        const stats = statSync(filePath);

        const lastModified = stats.mtime.getTime();
        const usedByMatch = content.match(/UsedBy:\s*(\d+)/);
        const usedBy = usedByMatch ? parseInt(usedByMatch[1], 10) : 0;

        if (lastModified < ninetyDaysAgo && usedBy === 0) {
          const fileName = require('node:path').basename(filePath);
          staleFiles.push(fileName);
        }
      } catch {
        // Skip files that can't be read
      }
    }

    if (staleFiles.length > 0) {
      return {
        name: 'Micro-Lesson Retention',
        status: 'warn',
        message: `${staleFiles.length} lessons untouched for 90+ days with 0 usage: ${staleFiles.join(', ')}`,
        fix: 'Consider archiving: rename to archive/*.md or remove if truly obsolete',
      };
    }

    return {
      name: 'Micro-Lesson Retention',
      status: 'pass',
      message: 'All micro-lessons are recent or actively used',
    };
  } catch (error) {
    return {
      name: 'Micro-Lesson Retention',
      status: 'warn',
      message: `Error checking retention: ${error}`,
    };
  }
}

// Learning Loop: generate machine-readable JSON metrics for log scraping
function generateLearningStatsJSON(): string {
  try {
    const microLessonsDir = resolve('docs/micro-lessons');

    let totalLessons = 0;
    if (existsSync(microLessonsDir)) {
      const files = readdirSync(microLessonsDir).filter(
        (file) =>
          file.endsWith('.md') && file !== 'INDEX.md' && !file.toLowerCase().includes('template')
      );
      totalLessons = files.length;
    }

    const indexFile = join(microLessonsDir, 'INDEX.md');
    let indexUpdatedISO = null;
    if (existsSync(indexFile)) {
      const stats = statSync(indexFile);
      indexUpdatedISO = stats.mtime.toISOString();
    }

    let displayViolations = 0;
    try {
      execSync('node scripts/check-display-suites.js', { stdio: 'pipe' });
    } catch {
      displayViolations = 1;
    }

    const stats = {
      micro_lessons_total: totalLessons,
      top10_updated_at: indexUpdatedISO,
      display_guard_violations_last_7d: displayViolations,
    };

    return `LEARNINGS_STATS=${JSON.stringify(stats)}`;
  } catch (_error) {
    const fallbackStats = {
      micro_lessons_total: 0,
      top10_updated_at: null,
      display_guard_violations_last_7d: 0,
    };
    return `LEARNINGS_STATS=${JSON.stringify(fallbackStats)}`;
  }
}

export {
  checkLearningsIndex,
  checkTop10LinkValidity,
  checkMicroLessonRetention,
  generateLearningStatsJSON,
  type CheckResult,
};
