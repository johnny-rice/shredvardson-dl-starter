#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const MICRO_LESSONS_DIR = path.join(__dirname, '..', 'docs', 'micro-lessons');
const INDEX_FILE = path.join(MICRO_LESSONS_DIR, 'INDEX.md');

function getMicroLessons() {
  if (!fs.existsSync(MICRO_LESSONS_DIR)) {
    // Create directory if it doesn't exist and return empty array
    fs.mkdirSync(MICRO_LESSONS_DIR, { recursive: true });
    return [];
  }

  const files = fs
    .readdirSync(MICRO_LESSONS_DIR)
    .filter((file) => {
      // Exclude index, templates, and any files starting with underscore
      return (
        file.endsWith('.md') &&
        file !== 'INDEX.md' &&
        !file.toLowerCase().includes('template') &&
        !file.startsWith('_')
      );
    })
    .map((file) => {
      try {
        const filePath = path.join(MICRO_LESSONS_DIR, file);
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        const titleMatch = content.match(/^# (.+)/m);
        const title = titleMatch ? titleMatch[1] : file.replace(/\.md$/i, '');
        const tagsMatch = content.match(/^\s*\*\*Tags[:.]\*\*\s*(.+)$/im);
        const tags = tagsMatch ? tagsMatch[1].trim() : '';

        // Extract UsedBy and Severity for heat scoring
        const usedByMatch = content.match(/^\s*\*\*UsedBy[:.]\*\*\s*(\d+)/im);
        const usedBy = usedByMatch ? parseInt(usedByMatch[1]) : 0;

        const severityMatch = content.match(/^\s*\*\*Severity[:.]\*\*\s*(low|medium|high)/im);
        const severity = severityMatch ? severityMatch[1].toLowerCase() : 'low';

        return {
          file,
          title,
          tags,
          mtime: stats.mtime,
          relativePath: `micro-lessons/${file}`,
          usedBy,
          severity,
        };
      } catch {
        return null; // skip unreadable files
      }
    })
    .filter(Boolean);

  // Check if we have enough data points to flip to "heat" sorting
  const totalUsageEvents = files.reduce((sum, f) => sum + f.usedBy, 0);
  const useHeatSorting = totalUsageEvents >= 8;

  files.sort((a, b) => {
    if (useHeatSorting) {
      // Heat scoring: recency + reuse + severity
      const severityWeight = { low: 1, medium: 2, high: 3 };
      const daysSinceA = Math.floor((Date.now() - a.mtime.getTime()) / (1000 * 60 * 60 * 24));
      const daysSinceB = Math.floor((Date.now() - b.mtime.getTime()) / (1000 * 60 * 60 * 24));

      // Recency score (higher for recent, decays over 30 days)
      const recencyA = Math.max(0, 30 - daysSinceA);
      const recencyB = Math.max(0, 30 - daysSinceB);

      // Heat score = recency + usage + severity boost
      const heatA = recencyA + a.usedBy * 5 + severityWeight[a.severity] * 2;
      const heatB = recencyB + b.usedBy * 5 + severityWeight[b.severity] * 2;

      const heatDiff = heatB - heatA;
      if (heatDiff !== 0) return heatDiff;
    } else {
      // Simple recency sort until we have enough data
      const timeDiff = b.mtime - a.mtime;
      if (timeDiff !== 0) return timeDiff;
    }

    // Tie-breaker: filename
    return a.file.localeCompare(b.file);
  });

  return {
    lessons: files.slice(0, 10),
    useHeatSorting,
    totalUsageEvents,
  };
}

function generateIndex(lessons, useHeatSorting = false, totalUsageEvents = 0) {
  let content = '# Top-10 Learning Index\n\n';
  content +=
    '_Generated automatically. Run `pnpm learn:index` to update. Do not edit by hand._\n\n';

  // Add sorting mode indicator
  if (useHeatSorting) {
    content += `_🔥 Heat ranking active (${totalUsageEvents} usage events) — sorted by recency + reuse + severity_\n\n`;
  } else {
    content += `_📅 Recency ranking (${totalUsageEvents}/8 usage events needed for heat ranking)_\n\n`;
  }

  if (lessons.length === 0) {
    content += 'No micro-lessons yet. Add your first learning using the template below.\n\n';
  } else {
    lessons.forEach((lesson, index) => {
      content += `${index + 1}. **[${lesson.title}](${encodeURI(lesson.file)})**`;
      if (lesson.tags) {
        content += ` \`${lesson.tags}\``;
      }
      // Show usage count when heat ranking is active
      if (useHeatSorting && lesson.usedBy > 0) {
        content += ` (${lesson.usedBy}×)`;
      }
      content += '\n';
    });
    content += '\n';
  }

  content += '---\n\n';
  content += '**Template:** [template.md](template.md)\n\n';
  content += '**Guidelines:**\n';
  content += '- Micro-lessons should be ≤90 seconds to read\n';
  content += '- Promote to Recipe when pattern repeats ≥2× or has high blast radius\n';
  content +=
    '- Keep agent context lean by linking to this index instead of inlining large blocks\n';

  return content;
}

function main() {
  try {
    const result = getMicroLessons();

    // Handle both old and new return formats for backwards compatibility
    const lessons = Array.isArray(result) ? result : result.lessons;
    const useHeatSorting = result.useHeatSorting || false;
    const totalUsageEvents = result.totalUsageEvents || 0;

    const indexContent = generateIndex(lessons, useHeatSorting, totalUsageEvents);

    fs.mkdirSync(MICRO_LESSONS_DIR, { recursive: true });
    fs.writeFileSync(INDEX_FILE, indexContent);

    const sortingMode = useHeatSorting ? '🔥 heat ranking' : '📅 recency ranking';
    console.log(`✅ Generated learnings index with ${lessons.length} entries (${sortingMode})`);
    console.log(`📄 Index file: ${path.relative(process.cwd(), INDEX_FILE)}`);

    if (useHeatSorting) {
      console.log(`🔥 Heat ranking active with ${totalUsageEvents} usage events`);
    } else {
      console.log(`📅 Using recency ranking (${totalUsageEvents}/8 usage events for heat ranking)`);
    }

    if (lessons.length > 0) {
      console.log('\n📚 Top learnings:');
      lessons.slice(0, 3).forEach((lesson, i) => {
        const usage = lesson.usedBy > 0 ? ` (${lesson.usedBy}×)` : '';
        console.log(`   ${i + 1}. ${lesson.title}${usage}`);
      });
    }
  } catch (error) {
    console.error('❌ Error generating learnings index:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getMicroLessons, generateIndex };
