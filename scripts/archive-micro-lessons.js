#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const MICRO_LESSONS_DIR = path.join(__dirname, '..', 'docs', 'micro-lessons');
const ARCHIVE_DIR = path.join(MICRO_LESSONS_DIR, 'archive');

function archiveOldLessons(olderThanDays = 90, unusedOnly = true) {
  if (!fs.existsSync(MICRO_LESSONS_DIR)) {
    console.log('No micro-lessons directory found');
    return;
  }

  const files = fs
    .readdirSync(MICRO_LESSONS_DIR)
    .filter(
      (file) =>
        file.endsWith('.md') && file !== 'INDEX.md' && !file.toLowerCase().includes('template')
    )
    .map((file) => path.join(MICRO_LESSONS_DIR, file));

  const cutoffDate = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
  const toArchive = [];

  for (const filePath of files) {
    try {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');

      const lastModified = stats.mtime.getTime();
      const usedByMatch = content.match(/UsedBy:\s*(\d+)/);
      const usedBy = usedByMatch ? parseInt(usedByMatch[1]) : 0;

      const isOld = lastModified < cutoffDate;
      const isUnused = usedBy === 0;

      if (isOld && (!unusedOnly || isUnused)) {
        toArchive.push({
          file: path.basename(filePath),
          path: filePath,
          usedBy,
          daysSince: Math.floor((Date.now() - lastModified) / (1000 * 60 * 60 * 24)),
        });
      }
    } catch {
      // Skip files that can't be read
    }
  }

  if (toArchive.length === 0) {
    console.log(
      `No lessons found older than ${olderThanDays} days${unusedOnly ? ' with 0 usage' : ''}`
    );
    return;
  }

  console.log(`Found ${toArchive.length} lessons to archive:`);
  toArchive.forEach((item) => {
    console.log(`  - ${item.file} (${item.daysSince} days old, ${item.usedBy} uses)`);
  });

  // Create archive directory
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });

  // Move files
  for (const item of toArchive) {
    const archivePath = path.join(ARCHIVE_DIR, item.file);
    fs.renameSync(item.path, archivePath);
    console.log(`📦 Archived: ${item.file}`);
  }

  console.log(`✅ Archived ${toArchive.length} micro-lessons to archive/`);
  console.log('💡 Run `pnpm learn:index` to refresh the index');
}

// CLI interface
const args = process.argv.slice(2);
const olderThanIndex = args.indexOf('--older-than');
const unusedFlag = args.includes('--unused');

const olderThanDays = olderThanIndex >= 0 ? parseInt(args[olderThanIndex + 1]) : 90;

if (require.main === module) {
  archiveOldLessons(olderThanDays, unusedFlag);
}

module.exports = { archiveOldLessons };
