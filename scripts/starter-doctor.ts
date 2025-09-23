import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { resolve, join, dirname, relative, sep, basename } from 'path';
import { execSync } from 'child_process';
import { resolveDoc } from './utils/resolveDoc';
import { TraceabilityValidator } from './validate-traceability';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  fix?: string;
}

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
      message: 'No micro-lessons to index',
    };
  }
  
  if (!existsSync(indexFile)) {
    return {
      name: 'Learning Index',
      status: 'fail',
      message: `Found ${lessonFiles.length} micro-lessons but INDEX.md is missing`,
      fix: 'Run: pnpm learn:index to refresh Top-10',
    };
  }
  
  try {
    // Fail if INDEX.md appears older than any lesson (allow 1s skew)
    const newestLessonMtime = Math.max(...lessonFiles.map((f) => statSync(f).mtimeMs));
    const indexMtime = statSync(indexFile).mtimeMs;
    if (indexMtime + 1000 < newestLessonMtime) {
      return {
        name: 'Learning Index',
        status: 'fail',
        message: 'INDEX.md is stale (older than one or more micro-lessons)',
        fix: 'Run: pnpm learn:index to refresh Top-10',
      };
    }

    const indexContent = readFileSync(indexFile, 'utf8');
    const trimmed = indexContent.trim();
    if (trimmed.length < 50) {
      return {
        name: 'Learning Index',
        status: 'fail', 
        message: 'INDEX.md exists but appears empty or incomplete',
        fix: 'Run: pnpm learn:index to refresh Top-10',
      };
    }
    // Soft check: expected heading present
    const hasHeading = /top-10/i.test(indexContent) || /learning index/i.test(indexContent);
    if (!hasHeading) {
      return {
        name: 'Learning Index',
        status: 'warn',
        message: 'INDEX.md missing expected Top-10 heading/marker',
        fix: 'Run: pnpm learn:index to refresh Top-10',
      };
    }
  } catch {
    return {
      name: 'Learning Index',
      status: 'fail',
      message: 'INDEX.md exists but cannot be read',
      fix: 'Run: pnpm learn:index to refresh Top-10',
    };
  }
  
  return {
    name: 'Learning Index',
    status: 'pass',
    message: `Learnings index present with ${lessonFiles.length} lessons`,
  };
}

function checkClaudeMdLeanness(): CheckResult {
  const claudeMdPath = resolve(resolveDoc('CLAUDE.md'));
  
  if (!existsSync(claudeMdPath)) {
    return {
      name: 'CLAUDE.md Leanness',
      status: 'pass',
      message: 'No CLAUDE.md found',
    };
  }
  
  try {
    const content = readFileSync(claudeMdPath, 'utf8');
    const lines = content.split('\n');
    const lineCount = lines.length;
    
    // Check line count (≤180 lines)
    if (lineCount > 180) {
      return {
        name: 'CLAUDE.md Leanness',
        status: 'fail',
        message: `CLAUDE.md is ${lineCount} lines (limit: 180). Keep CLAUDE.md slim; link Top-10 only.`,
        fix: 'Move large content to docs/ and link from CLAUDE.md instead',
      };
    }
    
    // Check for micro-lessons index reference (allow relative paths and anchors)
    const top10Link = /(?:\[[^\]]*\]\()?\s*(?:\.{0,2}\/)?docs\/micro-lessons\/INDEX\.md(?:#[^)]+)?\)?/i;
    if (!top10Link.test(content)) {
      return {
        name: 'CLAUDE.md Leanness',
        status: 'fail',
        message: 'CLAUDE.md must link to docs/micro-lessons/INDEX.md (relative link accepted) for agent context',
        fix: 'Add reference to micro-lessons Top-10 index in Learning Loop section',
      };
    }
    
    return {
      name: 'CLAUDE.md Leanness',
      status: 'pass',
      message: `CLAUDE.md is appropriately lean (${lineCount}/180 lines) with Top-10 link`,
    };
  } catch {
    return {
      name: 'CLAUDE.md Leanness',
      status: 'fail',
      message: 'CLAUDE.md exists but cannot be read',
      fix: 'Check file permissions and encoding',
    };
  }
}

function checkDisplaySuites(): CheckResult {
  try {
    // Run the display suites check script
    execSync('node scripts/check-display-suites.js', { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    return {
      name: 'Display Suites',
      status: 'pass',
      message: 'All @display suites properly isolated',
    };
  } catch (error: any) {
    const output = error.stdout || error.message || 'Unknown error';
    return {
      name: 'Display Suites',
      status: 'fail',
      message: '@display suites violate state isolation rules',
      fix: 'Remove state-mutating beforeEach hooks from UI display tests',
    };
  }
}

function checkPlaceholders(): CheckResult {
  // Build pattern from parts to avoid triggering self-detection
  const placeholderPattern = new RegExp(['{{', '[A-Z_]+', '}}'].join(''), 'g');
  const filesToCheck: string[] = [];

  function scanDirectory(dir: string) {
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        // Skip excluded directories and this file
        if (
          ['node_modules', '.git', '.next', '.turbo', 'coverage', 'dist', 'artifacts'].includes(entry) ||
          (fullPath.startsWith(resolve('docs/wiki'))) ||
          fullPath.endsWith('scripts/starter-doctor.ts')
        ) {
          continue;
        }

        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (
          stat.isFile() &&
          ['.md', '.json', '.ts', '.tsx', '.js', '.jsx'].some((ext) => entry.endsWith(ext))
        ) {
          filesToCheck.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }

  scanDirectory(process.cwd());

  const filesWithPlaceholders: string[] = [];
  for (const file of filesToCheck) {
    try {
      const content = readFileSync(file, 'utf8');
      if (placeholderPattern.test(content)) {
        filesWithPlaceholders.push(file);
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  if (filesWithPlaceholders.length > 0) {
    return {
      name: 'Placeholder Check',
      status: 'fail',
      message: `Found ${filesWithPlaceholders.length} files with unreplaced placeholders: ${filesWithPlaceholders.slice(0, 3).join(', ')}${filesWithPlaceholders.length > 3 ? '...' : ''}`,
      fix: `Run the new-app bootstrap script or manually replace ${'{' + '{PLACEHOLDER}' + '}'} values`,
    };
  }

  return {
    name: 'Placeholder Check',
    status: 'pass',
    message: 'No unreplaced placeholders found',
  };
}

function checkPRD(): CheckResult {
  const prdPath = resolve('docs/product/PRD.md');

  if (!existsSync(prdPath)) {
    return {
      name: 'PRD Check',
      status: 'warn',
      message: 'No PRD found at docs/product/PRD.md',
      fix: 'Create docs/product/PRD.md with your MVP scope and acceptance criteria',
    };
  }

  const content = readFileSync(prdPath, 'utf8');
  const templateHashes = [
    // Add template hash here if we create a PRD template
  ];

  // Basic content check - ensure it's not just a placeholder
  if (content.length < 200 || content.includes('TODO') || content.includes('{{')) {
    return {
      name: 'PRD Check',
      status: 'warn',
      message: 'PRD appears to be incomplete or contains template placeholders',
      fix: 'Fill out docs/product/PRD.md with your MVP scope, acceptance criteria, and anti-goals',
    };
  }

  return {
    name: 'PRD Check',
    status: 'pass',
    message: 'PRD exists and appears complete',
  };
}

function checkEnvironment(): CheckResult {
  // First validate environment schema
  try {
    require('../apps/web/src/lib/env').env;
  } catch (error: any) {
    return {
      name: 'Environment Check',
      status: 'fail',
      message: `Environment validation failed: ${error.message}`,
      fix: 'Check .env.local values against schema in apps/web/src/lib/env.ts',
    };
  }

  const examplePath = resolve('.env.example');
  const envPath = resolve('.env.local');

  if (!existsSync(examplePath)) {
    return {
      name: 'Environment Check',
      status: 'pass',
      message: 'No .env.example found (optional check)',
    };
  }

  if (!existsSync(envPath)) {
    return {
      name: 'Environment Check',
      status: 'warn',
      message: 'Found .env.example but no .env.local file',
      fix: 'Copy .env.example to .env.local and fill in your values',
    };
  }

  try {
    const exampleContent = readFileSync(examplePath, 'utf8');
    const envContent = readFileSync(envPath, 'utf8');

    const exampleKeys =
      exampleContent.match(/^[A-Z_]+=.*/gm)?.map((line) => line.split('=')[0]) || [];
    const envKeys = envContent.match(/^[A-Z_]+=.*/gm)?.map((line) => line.split('=')[0]) || [];

    const missingKeys = exampleKeys.filter((key) => !envKeys.includes(key));

    if (missingKeys.length > 0) {
      return {
        name: 'Environment Check',
        status: 'warn',
        message: `Missing environment variables: ${missingKeys.join(', ')}`,
        fix: 'Add missing keys to .env.local or update Vercel Environment Variables',
      };
    }
  } catch (error) {
    return {
      name: 'Environment Check',
      status: 'warn',
      message: 'Could not parse environment files',
      fix: 'Check .env.example and .env.local syntax',
    };
  }

  return {
    name: 'Environment Check',
    status: 'pass',
    message: 'Environment configuration looks good',
  };
}

function checkConstitutionIntegrity(): CheckResult {
  const checksumPath = resolve('docs/llm/CONSTITUTION.CHECKSUM');
  const contextMapPath = resolve('docs/llm/context-map.json');
  
  // Check if this is an infrastructure change (based on file detection)
  const isInfraChange = process.env.IS_INFRA_CHANGE === 'true';

  if (!existsSync(checksumPath)) {
    return {
      name: 'Constitution Integrity',
      status: isInfraChange ? 'warn' : 'fail',
      message: 'Constitution checksum file missing' + (isInfraChange ? ' (advisory for infra changes)' : ''),
      fix: 'Run: pnpm tsx scripts/update-constitution-checksum.ts',
    };
  }

  if (!existsSync(contextMapPath)) {
    return {
      name: 'Constitution Integrity',
      status: isInfraChange ? 'warn' : 'fail',
      message: 'Context map file missing' + (isInfraChange ? ' (advisory for infra changes)' : ''),
      fix: 'Restore docs/llm/context-map.json from template',
    };
  }

  try {
    // Run checksum update and see if it changes (ignoring timestamp)
    const originalContent = readFileSync(checksumPath, 'utf8');
    const originalChecksums = JSON.parse(originalContent);

    execSync('pnpm tsx scripts/update-constitution-checksum.ts', { stdio: 'pipe' });

    const newContent = readFileSync(checksumPath, 'utf8');
    const newChecksums = JSON.parse(newContent);

    // Compare only the checksums, not the timestamp
    if (JSON.stringify(originalChecksums.checksums) !== JSON.stringify(newChecksums.checksums)) {
      return {
        name: 'Constitution Integrity',
        status: 'fail',
        message: 'Constitution checksum is stale - binding sources have changed',
        fix: 'Checksum has been updated. Review changes and commit the updated CONSTITUTION.CHECKSUM',
      };
    }
  } catch (error) {
    return {
      name: 'Constitution Integrity',
      status: 'fail',
      message: 'Failed to verify constitution checksum',
      fix: 'Check that scripts/update-constitution-checksum.ts exists and runs correctly',
    };
  }

  return {
    name: 'Constitution Integrity',
    status: 'pass',
    message: 'Constitution checksum is current',
  };
}

function checkDependencies(): CheckResult {
  const packageJsonPath = resolve('package.json');

  if (!existsSync(packageJsonPath)) {
    return {
      name: 'Dependencies Check',
      status: 'fail',
      message: 'No package.json found',
      fix: 'Ensure you are in the project root directory',
    };
  }

  if (!existsSync(resolve('node_modules'))) {
    return {
      name: 'Dependencies Check',
      status: 'fail',
      message: 'Dependencies not installed',
      fix: 'Run: pnpm i',
    };
  }

  return {
    name: 'Dependencies Check',
    status: 'pass',
    message: 'Dependencies are installed',
  };
}

function printResults(results: CheckResult[]) {
  console.log('🏥 Starter Doctor Results\n');

  const failed = results.filter((r) => r.status === 'fail');
  const warnings = results.filter((r) => r.status === 'warn');
  const passed = results.filter((r) => r.status === 'pass');

  // Print all results
  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️ ' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.fix) {
      console.log(`   💡 Fix: ${result.fix}`);
    }
    console.log();
  });

  // Summary
  console.log('📊 Summary:');
  console.log(`   ✅ Passed: ${passed.length}`);
  console.log(`   ⚠️  Warnings: ${warnings.length}`);
  console.log(`   ❌ Failed: ${failed.length}`);
  console.log();

  // Learnings Loop: output machine-readable JSON metrics for log scraping
  console.log(generateLearningStatsJSON());
  console.log();

  if (failed.length > 0) {
    console.log('🚨 Fix all failures before continuing development.');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('⚠️  Address warnings for best experience.');
    process.exit(0);
  } else {
    console.log('🎉 All checks passed! Ready for development.');
    process.exit(0);
  }
}

function checkNewAppImports(): CheckResult[] {
  const results: CheckResult[] = [];
  const appsDir = resolve('apps');

  if (!existsSync(appsDir)) {
    return results;
  }

  const apps = readdirSync(appsDir)
    .filter((entry: string) => {
      const appPath = join(appsDir, entry);
      return statSync(appPath).isDirectory() && entry !== 'web';
    });

  for (const appName of apps) {
    const globalsCssPath = join(appsDir, appName, 'src/app/globals.css');
    const nextConfigPath = join(appsDir, appName, 'next.config.ts');
    const packageJsonPath = join(appsDir, appName, 'package.json');

    // Check for relative tokens import
    if (existsSync(globalsCssPath)) {
      try {
        const content = readFileSync(globalsCssPath, 'utf8');
        if (content.includes('../../styles/tokens.css')) {
          results.push({
            name: `${appName} Globals Import`,
            status: 'fail',
            message: 'Uses relative path to tokens.css instead of package import',
            fix: `Update ${globalsCssPath} to use: @import '@ui/components/styles/tokens.css';`,
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    // Check for turbopack in next.config.ts
    if (existsSync(nextConfigPath)) {
      try {
        const content = readFileSync(nextConfigPath, 'utf8');
        if (content.includes('turbopack: true')) {
          results.push({
            name: `${appName} Next Config`,
            status: 'fail',
            message: 'Contains experimental.turbopack which should be removed',
            fix: `Remove experimental.turbopack from ${nextConfigPath}`,
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    // Check if app is in lockfile
    try {
      const lockfilePath = resolve('pnpm-lock.yaml');
      if (existsSync(lockfilePath)) {
        const lockfileContent = readFileSync(lockfilePath, 'utf8');
        if (!lockfileContent.includes(`apps/${appName}`)) {
          results.push({
            name: `${appName} Lockfile`,
            status: 'fail',
            message: 'App not found in pnpm-lock.yaml',
            fix: 'Run: pnpm i',
          });
        }
      }
    } catch (error) {
      // Skip if lockfile can't be read
    }

    // Check dependency versions vs apps/web
    if (existsSync(packageJsonPath)) {
      try {
        const appPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const webPackageJsonPath = resolve('apps/web/package.json');

        if (existsSync(webPackageJsonPath)) {
          const webPackageJson = JSON.parse(readFileSync(webPackageJsonPath, 'utf8'));
          const coreKeys = ['next', 'react', 'react-dom', 'tailwindcss', 'typescript'];
          const mismatches: string[] = [];

          for (const key of coreKeys) {
            const appVersion =
              appPackageJson.dependencies?.[key] || appPackageJson.devDependencies?.[key];
            const webVersion =
              webPackageJson.dependencies?.[key] || webPackageJson.devDependencies?.[key];

            if (appVersion && webVersion && appVersion !== webVersion) {
              mismatches.push(`${key}: ${appVersion} vs ${webVersion}`);
            }
          }

          if (mismatches.length > 0) {
            results.push({
              name: `${appName} Dependencies`,
              status: 'warn',
              message: `Core dependency mismatches: ${mismatches.join(', ')}`,
              fix: `Consider updating ${packageJsonPath} to match apps/web versions`,
            });
          }
        }
      } catch (error) {
        // Skip if package.json can't be parsed
      }
    }
  }

  return results;
}

// Learnings Loop: generate both human-readable and machine-readable metrics
function generateLearningMetrics(): string {
  let metrics = '';
  
  try {
    const microLessonsDir = resolve('docs/micro-lessons');
    
    // Count total micro-lessons
    let totalLessons = 0;
    if (existsSync(microLessonsDir)) {
      const files = readdirSync(microLessonsDir).filter(file => 
        file.endsWith('.md') && 
        file !== 'INDEX.md' && 
        !file.toLowerCase().includes('template')
      );
      totalLessons = files.length;
    }
    
    // Get Top-10 index last updated timestamp
    const indexFile = join(microLessonsDir, 'INDEX.md');
    let indexUpdated = 'never';
    let indexUpdatedISO = null;
    if (existsSync(indexFile)) {
      const stats = statSync(indexFile);
      indexUpdated = stats.mtime.toISOString().split('T')[0]; // YYYY-MM-DD format
      indexUpdatedISO = stats.mtime.toISOString(); // Full ISO-8601 UTC format
    }
    
    // Simple display guard violation check (current state only)
    let displayViolations = 0;
    try {
      execSync('node scripts/check-display-suites.js', { stdio: 'pipe' });
    } catch {
      displayViolations = 1; // If script fails, likely has violations
    }
    
    metrics += '## 📚 Learning Loop Metrics\n\n';
    metrics += `- **Micro-lessons total:** ${totalLessons}\n`;
    metrics += `- **Top-10 updated:** ${indexUpdated}\n`;
    metrics += `- **Display guard violations:** ${displayViolations}\n\n`;
    
    // Learnings Loop: add staleness warning if index is old
    if (totalLessons > 0 && indexUpdatedISO) {
      const indexAge = Date.now() - new Date(indexUpdatedISO).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (indexAge > twentyFourHours) {
        metrics += '⚠️ *Learnings index may be stale. Run: pnpm learn:index*\n\n';
      }
    }
    
    if (totalLessons === 0) {
      metrics += '💡 *No micro-lessons yet. Add your first learning when you discover a reusable pattern.*\n\n';
    } else if (indexUpdated === 'never') {
      metrics += '⚠️ *Run `pnpm learn:index` to generate the Top-10.*\n\n';
    }
    
  } catch (error) {
    metrics += '## 📚 Learning Loop Metrics\n\n';
    metrics += `❌ *Error gathering metrics: ${error}*\n\n`;
  }
  
  return metrics;
}

// Learnings Loop: generate machine-readable JSON metrics for log scraping
function generateLearningStatsJSON(): string {
  try {
    const microLessonsDir = resolve('docs/micro-lessons');
    
    // Count total micro-lessons
    let totalLessons = 0;
    if (existsSync(microLessonsDir)) {
      const files = readdirSync(microLessonsDir).filter(file => 
        file.endsWith('.md') && 
        file !== 'INDEX.md' && 
        !file.toLowerCase().includes('template')
      );
      totalLessons = files.length;
    }
    
    // Get Top-10 index last updated timestamp in ISO-8601 UTC
    const indexFile = join(microLessonsDir, 'INDEX.md');
    let indexUpdatedISO = null;
    if (existsSync(indexFile)) {
      const stats = statSync(indexFile);
      indexUpdatedISO = stats.mtime.toISOString(); // Already in UTC with Z suffix
    }
    
    // Simple display guard violation check (current state only)
    let displayViolations = 0;
    try {
      execSync('node scripts/check-display-suites.js', { stdio: 'pipe' });
    } catch {
      displayViolations = 1; // If script fails, likely has violations
    }
    
    const stats = {
      micro_lessons_total: totalLessons,
      top10_updated_at: indexUpdatedISO,
      display_guard_violations_last_7d: displayViolations
    };
    
    return `LEARNINGS_STATS=${JSON.stringify(stats)}`;
  } catch (error) {
    // Don't fail on metrics - return a safe fallback
    const fallbackStats = {
      micro_lessons_total: 0,
      top10_updated_at: null,
      display_guard_violations_last_7d: 0
    };
    return `LEARNINGS_STATS=${JSON.stringify(fallbackStats)}`;
  }
}

function generateReportMarkdown(results: CheckResult[]): string {
  const failed = results.filter((r) => r.status === 'fail');
  const warnings = results.filter((r) => r.status === 'warn');
  const passed = results.filter((r) => r.status === 'pass');
  
  const categories = new Map<string, { fails: CheckResult[], warns: CheckResult[] }>();
  
  // Categorize results
  results.forEach(result => {
    if (!categories.has(result.name)) {
      categories.set(result.name, { fails: [], warns: [] });
    }
    const cat = categories.get(result.name)!;
    if (result.status === 'fail') cat.fails.push(result);
    if (result.status === 'warn') cat.warns.push(result);
  });

  // Load allowlist for transparency
  const allowlist = loadDoctorAllowlist();

  let report = '';
  
  report += '# 🏥 Starter Doctor Report\n\n';
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Status:** ${failed.length > 0 ? '❌ FAILED' : warnings.length > 0 ? '⚠️ WARNINGS' : '✅ PASSED'}\n\n`;
  
  // Executive Summary
  report += '## 📊 Summary\n\n';
  report += `- ✅ **Passed:** ${passed.length}\n`;
  report += `- ⚠️ **Warnings:** ${warnings.length}\n`;
  report += `- ❌ **Failed:** ${failed.length}\n\n`;
  
  if (failed.length === 0 && warnings.length === 0) {
    report += '🎉 **All checks passed! Repository is ready for development.**\n\n';
  }
  
  // Learning Loop Metrics
  report += generateLearningMetrics();
  
  // Category Breakdown
  if (categories.size > 0) {
    report += '## 📋 Issues by Category\n\n';
    
    for (const [category, issues] of categories) {
      const totalIssues = issues.fails.length + issues.warns.length;
      if (totalIssues === 0) continue;
      
      const icon = issues.fails.length > 0 ? '❌' : '⚠️';
      report += `### ${icon} ${category}\n\n`;
      report += `- Failures: ${issues.fails.length}\n`;
      report += `- Warnings: ${issues.warns.length}\n\n`;
      
      // Show top issues with quick fixes
      const allIssues = [...issues.fails, ...issues.warns].slice(0, 5);
      for (const issue of allIssues) {
        const statusIcon = issue.status === 'fail' ? '❌' : '⚠️';
        report += `${statusIcon} **${issue.message}**\n`;
        if (issue.fix) {
          report += `   💡 *Fix: ${issue.fix}*\n`;
        }
        report += '\n';
      }
      
      if (issues.fails.length + issues.warns.length > 5) {
        report += `*... and ${issues.fails.length + issues.warns.length - 5} more issues*\n\n`;
      }
    }
  }
  
  // Allowlist Transparency
  if (Object.keys(allowlist).length > 0) {
    report += '## 🔇 Allowlisted Items\n\n';
    report += '*The following items are intentionally ignored:*\n\n';
    
    if (allowlist.missingScripts?.length) {
      report += '**Scripts:**\n';
      allowlist.missingScripts.forEach(script => {
        report += `- \`${script}\`\n`;
      });
      report += '\n';
    }
    
    if (allowlist.missingPaths?.length) {
      report += '**Paths:**\n';
      allowlist.missingPaths.forEach(path => {
        report += `- \`${path}\`\n`;
      });
      report += '\n';
    }
    
    if (allowlist.missingAnchors?.length) {
      report += '**Anchors:**\n';
      allowlist.missingAnchors.forEach(anchor => {
        report += `- \`${anchor}\`\n`;
      });
      report += '\n';
    }
  }
  
  // How to Reproduce
  report += '## 🔧 How to Reproduce Locally\n\n';
  report += '```bash\n';
  report += 'pnpm install\n';
  report += 'pnpm run doctor\n';
  report += '```\n\n';
  
  if (failed.length > 0) {
    report += '## 🛠️ Remediation Steps\n\n';
    report += '1. Address each ❌ failure listed above\n';
    report += '2. Run `pnpm run doctor` locally to verify fixes\n';
    report += '3. Commit fixes and push to re-trigger CI\n';
    report += '4. Add items to `.doctor-allowlist.json` only if they are intentional\n\n';
  }
  
  // Footer
  report += '---\n\n';
  report += '*Generated by [Starter Doctor](../scripts/starter-doctor.ts)*\n';
  
  return report;
}

function generateCommandInventory(): any {
  const inventory = {
    generated: new Date().toISOString(),
    packages: {} as Record<string, { scripts: Record<string, string>, dir: string }>,
    commandDocs: {} as Record<string, { scripts: string[], paths: string[], anchors: string[] }>,
    orphanedDocs: [] as string[],
    turboTasks: {} as Record<string, any>
  };
  
  // Package scripts inventory
  const workspacePackages = loadWorkspacePackages();
  for (const pkg of workspacePackages) {
    const key = pkg.name || pkg.dir;
    inventory.packages[key] = {
      scripts: pkg.scripts,
      dir: pkg.dir
    };
  }
  
  // Turbo pipeline
  inventory.turboTasks = loadTurboPipeline();
  
  // Command docs analysis
  const commandsDir = resolve('.claude/commands');
  if (existsSync(commandsDir)) {
    function analyzeCommandFile(filePath: string) {
      try {
        const content = readFileSync(filePath, 'utf8');
        const relativePath = relative(process.cwd(), filePath).split(sep).join('/');
        
        const scripts: string[] = [];
        const paths: string[] = [];
        const anchors: string[] = [];
        
        // Extract scripts (simplified)
        const scriptMatches = content.match(/`(?:pnpm|npm|turbo)[^`]+`/g) || [];
        scripts.push(...scriptMatches);
        
        // Extract paths - only clean file paths and globs
        const pathMatches = content.match(/`[^`]*(?:apps|packages|scripts|docs)[^`]*`/g) || [];
        const cleanPaths = pathMatches
          .map(match => {
            // Remove backticks
            let path = match.replace(/`/g, '');
            
            // Skip if it looks like a command (starts with /)
            if (path.startsWith('/')) {
              return null;
            }
            
            // Skip if it contains newlines or markdown formatting
            if (path.includes('\n') || path.includes('**') || path.includes(' - ')) {
              return null;
            }
            
            // Extract just the path part if it's mixed with prose
            const pathRegex = /(?:^|\s)((?:apps|packages|scripts|docs|src|\.)[\/\w.-]*[\/\w.-]+)(?:\s|$)/;
            const pathMatch = path.match(pathRegex);
            if (pathMatch) {
              return pathMatch[1].trim();
            }
            
            // If it's a clean simple path, use it
            if (/^[a-zA-Z0-9\/._-]+$/.test(path.trim()) && path.length < 100) {
              return path.trim();
            }
            
            return null;
          })
          .filter(path => path !== null && path.length > 0)
          .filter((path, index, array) => array.indexOf(path) === index); // deduplicate
        
        paths.push(...cleanPaths);
        
        // Extract links with anchors
        const anchorMatches = content.match(/\[[^\]]+\]\([^)]+#[^)]+\)/g) || [];
        anchors.push(...anchorMatches);
        
        inventory.commandDocs[relativePath] = { scripts, paths, anchors };
      } catch {
        // Skip files that can't be read
      }
    }
    
    function scanDir(dir: string) {
      try {
        const entries = readdirSync(dir);
        for (const entry of entries) {
          const fullPath = join(dir, entry);
          if (statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
          } else if (entry.endsWith('.md')) {
            analyzeCommandFile(fullPath);
          }
        }
      } catch {
        // Skip directories that can't be read
      }
    }
    
    scanDir(commandsDir);
  }
  
  return inventory;
}

function loadDoctorAllowlist(): any {
  const allowlistPath = resolve('.doctor-allowlist.json');
  if (!existsSync(allowlistPath)) return {};
  
  try {
    return JSON.parse(readFileSync(allowlistPath, 'utf8'));
  } catch {
    return {};
  }
}

function loadWorkspacePackages(): any[] {
  // Simplified version for inventory - reuse the logic from checkCommandDocs
  const candidates = [
    ...safeListDirs('apps').map(d => `apps/${d}`),
    ...safeListDirs('packages').map(d => `packages/${d}`),
  ];
  const out: any[] = [];
  
  for (const dir of candidates) {
    const pj = join(dir, 'package.json');
    if (existsSync(pj)) {
      try {
        const json = JSON.parse(readFileSync(pj, 'utf8'));
        out.push({ name: json.name, dir, scripts: json.scripts ?? {} });
      } catch {
        // Skip malformed package.json files
      }
    }
  }
  
  // Include root
  if (existsSync('package.json')) {
    try {
      const root = JSON.parse(readFileSync('package.json', 'utf8'));
      out.push({ name: root.name, dir: '.', scripts: root.scripts ?? {} });
    } catch {
      // Skip malformed root package.json
    }
  }
  
  return out;
}

function loadTurboPipeline(): Record<string, any> {
  try {
    const turboPath = resolve('turbo.json');
    if (!existsSync(turboPath)) return {};
    
    const turbo = JSON.parse(readFileSync(turboPath, 'utf8'));
    return turbo.pipeline ?? {};
  } catch {
    return {};
  }
}

function safeListDirs(dir: string): string[] {
  try {
    return readdirSync(dir).filter((entry: string) => {
      return statSync(join(dir, entry)).isDirectory();
    });
  } catch {
    return [];
  }
}

// Learnings Loop: guard for link drift in PR comments
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
    // Check if the file is readable and has content
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

// Learnings Loop: retention rule for unused micro-lessons
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
      .filter(file => file.endsWith('.md') && file !== 'INDEX.md' && !file.toLowerCase().includes('template'))
      .map(file => join(microLessonsDir, file));
    
    const staleFiles: string[] = [];
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    
    for (const filePath of lessonFiles) {
      try {
        const content = readFileSync(filePath, 'utf8');
        const stats = statSync(filePath);
        
        // Check if file hasn't been modified in 90 days
        const lastModified = stats.mtime.getTime();
        
        // Check if UsedBy is 0 or missing
        const usedByMatch = content.match(/UsedBy:\s*(\d+)/);
        const usedBy = usedByMatch ? parseInt(usedByMatch[1]) : 0;
        
        if (lastModified < ninetyDaysAgo && usedBy === 0) {
          const fileName = basename(filePath);
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

function checkCommandDocs(): CheckResult[] {
  const commandsDir = '.claude/commands';
  
  if (!existsSync(commandsDir)) {
    return [{
      name: 'Command Documentation',
      status: 'warn',
      message: 'No .claude/commands directory found'
    }];
  }

  const results: CheckResult[] = [];
  
  try {
    function scanCommandDir(dir: string): string[] {
      const entries = readdirSync(dir);
      const commands: string[] = [];
      
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          commands.push(...scanCommandDir(fullPath));
        } else if (entry.endsWith('.md')) {
          commands.push(fullPath);
        }
      }
      
      return commands;
    }

    const commandFiles = scanCommandDir(commandsDir);
    
    results.push({
      name: 'Slash Commands',
      status: commandFiles.length > 0 ? 'pass' : 'warn',
      message: `Found ${commandFiles.length} slash command(s): ${commandFiles.map(f => f.replace(commandsDir + '/', '')).join(', ')}`
    });

    // Check if commands are referenced in CLAUDE.md
    const claudePath = resolve(resolveDoc('CLAUDE.md'));
    if (existsSync(claudePath)) {
      const claudeContent = readFileSync(claudePath, 'utf8');
      const referencedCommands = commandFiles.filter(cmd => {
        const rel = relative(process.cwd(), cmd).split(sep).join('/');
        const noPrefix = rel.replace(/^\.?claude\/commands\//, '').replace(/^\.claude\/commands\//, '');
        const candidates = [
          rel,
          `(${rel})`,
          `.claude/commands/${noPrefix}`,
          `(.claude/commands/${noPrefix})`,
          noPrefix,
          `(${noPrefix})`
        ];
        return candidates.some(token => claudeContent.includes(token));
      });
      
      results.push({
        name: 'Commands in CLAUDE.md',
        status: referencedCommands.length === commandFiles.length ? 'pass' : 'warn',
        message: `${referencedCommands.length}/${commandFiles.length} commands referenced in CLAUDE.md`,
        fix: commandFiles.length > referencedCommands.length ? 'Add missing command references to CLAUDE.md' : undefined
      });
    }

  } catch (error) {
    results.push({
      name: 'Command Documentation Scan',
      status: 'fail',
      message: `Error scanning commands: ${error}`
    });
  }
  
  return results;
}

function checkEnvExampleSafety(): CheckResult {
  const examplePath = resolve('.env.example');
  if (!existsSync(examplePath)) {
    return {
      name: 'Env Example Safety',
      status: 'pass',
      message: 'No .env.example to check',
    };
  }

  try {
    const content = readFileSync(examplePath, 'utf8');
    const suspiciousKeys: string[] = [];
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z][A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!m) continue;
      const key = m[1];
      const rawVal = m[2].trim().replace(/^"(.*)"$/, '$1');
      if (!rawVal || rawVal.startsWith('#')) continue;
      if (/\bsk_live_[A-Za-z0-9]{24,}\b/.test(rawVal)) suspiciousKeys.push(key);
      if (/\bpk_live_[A-Za-z0-9]{24,}\b/.test(rawVal)) suspiciousKeys.push(key);
      if (/^[A-Za-z0-9+/]{40,}={0,2}$/.test(rawVal)) suspiciousKeys.push(key); // base64-like
    }
    if (suspiciousKeys.length) {
      return {
        name: 'Env Example Safety',
        status: 'fail',
        message: `Found potential real secrets for keys: ${suspiciousKeys.slice(0, 5).join(', ')}`,
        fix: 'Remove real secrets from .env.example - use empty values or placeholders only',
      };
    }
  } catch (error) {
    return {
      name: 'Env Example Safety',
      status: 'warn',
      message: 'Could not read .env.example for safety check',
    };
  }

  return {
    name: 'Env Example Safety',
    status: 'pass',
    message: '.env.example contains no real secrets',
  };
}

function checkRestrictedPaths(): CheckResult {
  // Only run this check in CI or if explicitly requested
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const isBotBranch = process.env.GITHUB_HEAD_REF?.startsWith('bots/claude/');
  
  if (!isCI || !isBotBranch) {
    return {
      name: 'Restricted Paths',
      status: 'pass',
      message: 'Check skipped (not a bot branch in CI)',
    };
  }

  try {
    // Run the restricted paths check script
    execSync('bash scripts/check-restricted-paths.sh', { 
      stdio: 'pipe',
      env: { ...process.env }
    });
    
    return {
      name: 'Restricted Paths',
      status: 'pass',
      message: '🤖 Bot branch respects path restrictions',
    };
  } catch (error: any) {
    const details =
      (error?.stderr?.toString?.() || error?.stdout?.toString?.() || '')
        .split('\n')
        .slice(-5)
        .join(' ')
        .trim();
    return {
      name: 'Restricted Paths',
      status: 'fail',
      message: details
        ? `Bot branch violated restricted path policy: ${details}`
        : 'Bot branch violated restricted path policy',
      fix: 'Bots cannot modify .github/workflows/**, scripts/release/**, or .env* files',
    };
  }
}

function checkAILabelHygiene(): CheckResult {
  // Only run in CI with artifacts directory
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const isBotBranch = process.env.GITHUB_HEAD_REF?.startsWith('bots/claude/');
  
  if (!isCI || !existsSync('artifacts')) {
    return {
      name: 'AI Label Hygiene',
      status: 'pass',
      message: 'Check skipped (no artifacts directory)',
    };
  }

  // For non-bot branches, this is always advisory
  if (!isBotBranch) {
    return {
      name: 'AI Label Hygiene',
      status: 'pass',
      message: 'Non-bot branch - AI label hygiene is advisory only',
    };
  }

  try {
    // Check if AI artifacts exist
    const hasAIReview = existsSync('artifacts/doctor-report.md') && 
                       readFileSync('artifacts/doctor-report.md', 'utf8').includes('🤖 AI Review');
    const hasSecurityReview = existsSync('artifacts/doctor-report.md') && 
                             readFileSync('artifacts/doctor-report.md', 'utf8').includes('🛡️ AI Security Review');
    
    if (!hasAIReview && !hasSecurityReview) {
      return {
        name: 'AI Label Hygiene',
        status: 'pass',
        message: 'No AI artifacts found, label check not applicable',
      };
    }

    // For bot branches, require proper labels
    const missingLabels = [];
    if (hasAIReview) missingLabels.push('ai-review:advisory');
    if (hasSecurityReview) missingLabels.push('ai-security:advisory');

    return {
      name: 'AI Label Hygiene',
      status: 'warn',
      message: `🤖 Bot branch AI artifacts detected - verify PR has labels: ${missingLabels.join(', ')}`,
      fix: 'Ensure workflows apply correct labels when AI reviews complete',
    };
  } catch (error: any) {
    return {
      name: 'AI Label Hygiene',
      status: 'warn',
      message: 'Could not verify AI label hygiene',
      fix: 'Check that AI review workflows apply proper labels',
    };
  }
}

function checkReferences(): CheckResult[] {
  const results: CheckResult[] = [];
  
  // Check recipe files referenced in CLAUDE.md
  const recipeFiles = [
    'docs/recipes/auth.md',
    'docs/recipes/db.md', 
    'docs/recipes/env-setup.md',
    'docs/recipes/stripe.md',
    'docs/recipes/shadcn.md'
  ];
  
  const missingRecipes = recipeFiles.filter(file => !existsSync(file));
  
  results.push({
    name: 'Recipe Documentation',
    status: missingRecipes.length === 0 ? 'pass' : 'fail',
    message: missingRecipes.length === 0 
      ? 'All recipe files exist'
      : `Missing recipe files: ${missingRecipes.join(', ')}`,
    fix: missingRecipes.length > 0 ? 'Create missing recipe files' : undefined
  });
  
  // Check other referenced files
  const otherFiles = ['CONTRIBUTING.md', 'RELEASING.md', 'SECURITY.md'];
  const missingOther = otherFiles.filter(file => !existsSync(file));
  
  results.push({
    name: 'Reference Documentation', 
    status: missingOther.length === 0 ? 'pass' : 'fail',
    message: missingOther.length === 0
      ? 'All reference files exist'
      : `Missing reference files: ${missingOther.join(', ')}`,
    fix: missingOther.length > 0 ? 'Create missing reference files' : undefined
  });
  
  return results;
}

// Phase 2 validation functions

function checkArtifactsDirectory(): CheckResult {
  const artifactsPath = resolve('artifacts');
  
  if (!existsSync(artifactsPath)) {
    return {
      name: 'Artifacts Directory',
      status: 'fail',
      message: 'artifacts/ directory missing',
      fix: 'Create artifacts/ directory and add to .gitignore'
    };
  }
  
  try {
    // Check if artifacts/ is in .gitignore
    const gitignorePath = resolve('.gitignore');
    let gitignoreContent = '';
    if (existsSync(gitignorePath)) {
      gitignoreContent = readFileSync(gitignorePath, 'utf8');
      const hasArtifactsIgnore = gitignoreContent
        .split(/\r?\n/)
        .some(l => /^\s*\/?artifacts(?:\/|\*|\s|$)/.test(l.trim()));
      if (!hasArtifactsIgnore) {
        return {
          name: 'Artifacts Directory',
          status: 'fail',
          message: 'artifacts/ not ignored by .gitignore',
          fix: 'Add "artifacts/" (or equivalent) to .gitignore'
        };
      }
      
      // Ensure .keep is allowed through ignore
      if (!gitignoreContent.split(/\r?\n/).some(l => /^\s*!artifacts\/\.keep\s*$/.test(l))) {
        return {
          name: 'Artifacts Directory',
          status: 'fail',
          message: 'artifacts/.keep not allowlisted in .gitignore',
          fix: 'Add "!artifacts/.keep" below "artifacts/" in .gitignore'
        };
      }
    }

    // Ensure artifacts/.keep exists
    const keepPath = join(artifactsPath, '.keep');
    if (!existsSync(keepPath)) {
      return {
        name: 'Artifacts Directory',
        status: 'warn',
        message: 'artifacts/.keep is missing',
        fix: 'Create an empty artifacts/.keep file (tracked)'
      };
    }
    
    // Check for tracked files (except .keep)
    let trackedFiles: string[] = [];
    try {
      // Only attempt when inside a git work tree
      const inGit = execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe', encoding: 'utf8' }).trim() === 'true';
      if (inGit) {
        const out: Buffer = execSync('git ls-files -z -- artifacts', { stdio: 'pipe' }) as unknown as Buffer;
        trackedFiles = out.toString('utf8').split('\0').filter(p => p && p !== 'artifacts/.keep');
      }
    } catch {
      // ignore – we'll fallback to filesystem check
    }
    if (trackedFiles.length === 0) {
      // Fallback: if not in git, treat any files besides .keep as advisory
      try {
        const files = readdirSync(artifactsPath).filter(f => f !== '.keep');
        if (files.length > 0) {
          trackedFiles = files;
        }
      } catch {
        // ignore
      }
    }
    
    if (trackedFiles.length > 0) {
      return {
        name: 'Artifacts Directory',
        status: 'warn',
        message: `artifacts/ has ${trackedFiles.length} file(s) besides .keep`,
        fix: 'Keep artifacts untracked; remove committed files or add to .gitignore'
      };
    }
    
    return {
      name: 'Artifacts Directory',
      status: 'pass',
      message: 'artifacts/ properly configured and empty'
    };
    
  } catch (error) {
    return {
      name: 'Artifacts Directory',
      status: 'fail',
      message: `Cannot check artifacts/: ${error}`
    };
  }
}

function checkRootDocLimits(): CheckResult {
  const allowedLongDocs = [
    'README.md',
    'CONTRIBUTING.md',
    'SECURITY.md',
    'RELEASING.md',
    'CODE_OF_CONDUCT.md',
    'CHANGELOG.md',
    'GOVERNANCE.md'
  ];
  const maxLines = 80;
  
  try {
    const files = readdirSync('.').filter(f => f.endsWith('.md'));
    const violations: string[] = [];
    
    for (const file of files) {
      if (allowedLongDocs.includes(file)) continue;
      
      const content = readFileSync(file, 'utf8');
      const lineCount = content.split('\n').length;
      
      if (lineCount > maxLines) {
        violations.push(`${file} (${lineCount} lines)`);
      }
    }
    
    if (violations.length > 0) {
      return {
        name: 'Root Doc Limits',
        status: 'fail',
        message: `Root docs exceed ${maxLines} lines: ${violations.join(', ')}`,
        fix: 'Move large content to docs/ and link from root'
      };
    }
    
    return {
      name: 'Root Doc Limits',
      status: 'pass',
      message: `Root docs appropriately sized (<${maxLines} lines)`
    };
    
  } catch (error) {
    return {
      name: 'Root Doc Limits',
      status: 'fail',
      message: `Cannot check root docs: ${error}`
    };
  }
}

function checkDocsPresence(): CheckResult {
  const requiredDocs = ['docs/INDEX.md', 'docs/ai/INDEX.md'];
  const missing: string[] = [];
  
  for (const doc of requiredDocs) {
    if (!existsSync(resolve(doc))) {
      missing.push(doc);
    }
  }
  
  if (missing.length > 0) {
    return {
      name: 'Docs Presence',
      status: 'fail',
      message: `Missing required docs: ${missing.join(', ')}`,
      fix: 'Create missing navigation index files'
    };
  }
  
  return {
    name: 'Docs Presence',
    status: 'pass',
    message: 'Required navigation docs present'
  };
}

function checkDocsHeaders(): CheckResult {
  try {
    const docsPath = resolve('docs');
    if (!existsSync(docsPath)) {
      return {
        name: 'Docs Headers',
        status: 'pass',
        message: 'No docs directory found'
      };
    }
    
    const docFiles: string[] = [];
    
    // Find all .md files in docs/
    function findMdFiles(dir: string) {
      const files = readdirSync(dir);
      for (const file of files) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip generated wiki subtree (cross-platform)
          if (fullPath.startsWith(resolve('docs/wiki'))) continue;
          findMdFiles(fullPath);
        } else if (file.endsWith('.md')) {
          // Skip agent file (cross-platform)
          if (fullPath === resolve('docs/ai/CLAUDE.md')) continue;
          docFiles.push(fullPath);
        }
      }
    }
    
    findMdFiles(docsPath);
    
    const violations: string[] = [];
    
    for (const file of docFiles) {
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      // Support YAML front-matter when checking H1
      let start = 0;
      if (lines[0]?.trim() === '---') {
        const end = lines.indexOf('---', 1);
        start = end > 0 ? end + 1 : 0;
      }
      while (start < lines.length && lines[start].trim() === '') start++;
      // Check for H1 at first content line
      if (!lines[start]?.startsWith('# ')) {
        violations.push(`${file}: missing H1 header`);
        continue;
      }
      
      // Check for summary (3–5 lines after H1)
      const summaryLines = lines.slice(start + 1, start + 6).filter(l => l.trim());
      if (summaryLines.length < 3) {
        violations.push(`${file}: missing 3-5 line summary after H1`);
      }
      
      // Check for "When to use" line
      if (!content.toLowerCase().includes('when to use')) {
        violations.push(`${file}: missing "When to use" guidance`);
      }
    }
    
    if (violations.length > 0) {
      return {
        name: 'Docs Headers',
        status: 'warn',
        message: `${violations.length} docs missing standard headers`,
        fix: 'Add H1, summary, and "When to use" sections to docs'
      };
    }
    
    return {
      name: 'Docs Headers',
      status: 'pass',
      message: `${docFiles.length} docs follow header standard`
    };
    
  } catch (error) {
    return {
      name: 'Docs Headers',
      status: 'fail',
      message: `Cannot check docs headers: ${error}`
    };
  }
}

function checkPromptStructure(): CheckResult[] {
  const results: CheckResult[] = [];
  
  try {
    const promptsPath = resolve('packages/ai/prompts');
    if (!existsSync(promptsPath)) {
      return [{
        name: 'Prompt Structure',
        status: 'pass',
        message: 'No prompts directory found'
      }];
    }
    
    // Check directory structure
    const requiredDirs = ['system', 'task', 'tools'];
    const missingDirs: string[] = [];
    
    for (const dir of requiredDirs) {
      if (!existsSync(join(promptsPath, dir))) {
        missingDirs.push(dir);
      }
    }
    
    if (missingDirs.length > 0) {
      results.push({
        name: 'Prompt Structure',
        status: 'fail',
        message: `Missing prompt directories: ${missingDirs.join(', ')}`,
        fix: 'Create prompts/system/, prompts/task/, and prompts/tools/ directories'
      });
    }
    
    // Check for loose .md files in root
    const rootFiles = readdirSync(promptsPath).filter(f => f.endsWith('.md') && f !== 'README.md');
    if (rootFiles.length > 0) {
      results.push({
        name: 'Prompt Structure',
        status: 'fail',
        message: `Loose prompt files in root: ${rootFiles.join(', ')}`,
        fix: 'Move prompt files to system/, task/, or tools/ subdirectories'
      });
    }
    
    // Check prompt headers
    const promptFiles: string[] = [];
    
    function findPromptFiles(dir: string) {
      try {
        const files = readdirSync(dir);
        for (const file of files) {
          const fullPath = join(dir, file);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            findPromptFiles(fullPath);
          } else if (file.endsWith('.md') && file !== 'README.md') {
            promptFiles.push(fullPath);
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
      }
    }
    
    findPromptFiles(promptsPath);
    
    const headerViolations: string[] = [];
    
    for (const file of promptFiles) {
      try {
        const content = readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        // Check for required header format
        const hasIntent = content.includes('**Intent:**');
        const hasInputs = content.includes('**Inputs:**');
        const hasOutput = content.includes('**Expected Output:**');
        const hasRisks = content.includes('**Risks/Guardrails:**');
        
        if (!hasIntent || !hasInputs || !hasOutput || !hasRisks) {
          headerViolations.push(file.replace(promptsPath + '/', ''));
        }
      } catch (error) {
        headerViolations.push(file.replace(promptsPath + '/', '') + ' (unreadable)');
      }
    }
    
    if (headerViolations.length > 0) {
      results.push({
        name: 'Prompt Headers',
        status: 'warn',
        message: `${headerViolations.length} prompts missing standard headers`,
        fix: 'Add Intent, Inputs, Expected Output, and Risks/Guardrails to prompt headers'
      });
    } else if (promptFiles.length > 0) {
      results.push({
        name: 'Prompt Headers',
        status: 'pass',
        message: `${promptFiles.length} prompts follow header standard`
      });
    }
    
    if (results.length === 0) {
      results.push({
        name: 'Prompt Structure',
        status: 'pass',
        message: 'Prompt structure correctly organized'
      });
    }
    
  } catch (error) {
    results.push({
      name: 'Prompt Structure',
      status: 'fail',
      message: `Cannot check prompt structure: ${error}`
    });
  }
  
  return results;
}

function checkDocLinks(): CheckResult[] {
  const results: CheckResult[] = [];
  
  try {
    const docsPath = resolve('docs');
    if (!existsSync(docsPath)) {
      return [{
        name: 'Doc Links',
        status: 'pass',
        message: 'No docs directory found'
      }];
    }
    
    const docFiles: string[] = [];
    
    function findMdFiles(dir: string) {
      try {
        const files = readdirSync(dir);
        for (const file of files) {
          const fullPath = join(dir, file);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            if (fullPath.startsWith(resolve('docs/wiki'))) continue;
            findMdFiles(fullPath);
          } else if (file.endsWith('.md')) {
            docFiles.push(fullPath);
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
      }
    }
    
    findMdFiles(docsPath);
    
    const brokenLinks: string[] = [];
    
    for (const file of docFiles) {
      try {
        const content = readFileSync(file, 'utf8');
        
        // Simple regex to find relative markdown links like [text](./path.md) or [text](path.md)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        
        while ((match = linkRegex.exec(content)) !== null) {
          const linkPath = match[2];
          
          // Strip anchors and query params for file existence check
          const cleanPath = linkPath.split('#')[0].split('?')[0];
          
          // Only check relative links to .md files
          if (cleanPath.endsWith('.md') && !linkPath.startsWith('http')) {
            let absolutePath;
            
            if (cleanPath.startsWith('./')) {
              absolutePath = resolve(dirname(file), cleanPath.slice(2));
            } else if (cleanPath.startsWith('/docs/')) {
              // Root-absolute docs path (e.g., /docs/foo.md)
              absolutePath = resolve(cleanPath.slice(1));
            } else if (!cleanPath.startsWith('/')) {
              absolutePath = resolve(dirname(file), cleanPath);
            } else {
              continue; // Skip absolute paths
            }
            
            if (!existsSync(absolutePath)) {
              brokenLinks.push(`${relative(process.cwd(), file).split(sep).join('/')}: ${linkPath}`);
            }
          }
        }
      } catch (error) {
        // File can't be read
      }
    }
    
    if (brokenLinks.length > 0) {
      results.push({
        name: 'Doc Links',
        status: 'warn',
        message: `${brokenLinks.length} broken relative links found`,
        fix: 'Fix or remove broken markdown links'
      });
    } else {
      results.push({
        name: 'Doc Links',
        status: 'pass',
        message: `${docFiles.length} docs checked, all relative links valid`
      });
    }
    
  } catch (error) {
    results.push({
      name: 'Doc Links',
      status: 'fail',
      message: `Cannot check doc links: ${error}`
    });
  }
  
  return results;
}

function checkTraceability(): CheckResult {
  try {
    const validator = new TraceabilityValidator();
    const result = validator.validateTraceability();
    
    if (!result.valid) {
      return {
        name: 'Traceability Validation',
        status: 'fail',
        message: `${result.errors.length} traceability errors found`,
        fix: 'Run: pnpm tsx scripts/validate-traceability.ts to see details'
      };
    }
    
    return {
      name: 'Traceability Validation',
      status: 'pass',
      message: 'All traceability chains are valid'
    };
  } catch (error) {
    return {
      name: 'Traceability Validation',
      status: 'warn',
      message: `Could not validate traceability: ${error instanceof Error ? error.message : String(error)}`,
      fix: 'Check if specs/, plans/, tasks/ directories exist'
    };
  }
}

function checkWikiPRDSync(): CheckResult {
  const sourcePRD = resolve('docs/product/PRD.md');
  const wikiPRD = resolve('docs/wiki/WIKI-PRD.md');
  
  if (!existsSync(sourcePRD)) {
    return {
      name: 'WIKI-PRD Sync',
      status: 'pass',
      message: 'No source PRD found (docs/product/PRD.md)',
    };
  }
  
  if (!existsSync(wikiPRD)) {
    return {
      name: 'WIKI-PRD Sync',
      status: 'fail',
      message: 'WIKI-PRD.md is missing but PRD.md exists',
      fix: 'Run: pnpm wiki:generate to sync PRD to WIKI-PRD',
    };
  }
  
  try {
    const sourceContent = readFileSync(sourcePRD, 'utf8');
    const wikiContent = readFileSync(wikiPRD, 'utf8');
    
    // Remove the generation footer before comparing
    const cleanWikiContent = wikiContent.replace(/\n\n---\n\*Copied from docs\/product\/PRD\.md[\s\S]*$/, '');
    
    if (sourceContent.trim() !== cleanWikiContent.trim()) {
      return {
        name: 'WIKI-PRD Sync',
        status: 'fail', 
        message: 'WIKI-PRD.md is out of sync with docs/product/PRD.md',
        fix: 'Run: pnpm wiki:generate to sync changes',
      };
    }
    
    return {
      name: 'WIKI-PRD Sync',
      status: 'pass',
      message: 'WIKI-PRD.md is in sync with source PRD',
    };
  } catch (error) {
    return {
      name: 'WIKI-PRD Sync',
      status: 'fail',
      message: `Cannot compare PRD files: ${error}`,
      fix: 'Check file permissions and run: pnpm wiki:generate',
    };
  }
}

function checkForOverrideLabel(): boolean {
  try {
    // Prefer GitHub event payload (no external deps)
    const evPath = process.env.GITHUB_EVENT_PATH;
    const eventName = process.env.GITHUB_EVENT_NAME;
    if (evPath && existsSync(evPath) && (eventName === 'pull_request' || eventName === 'pull_request_target')) {
      const eventData = JSON.parse(readFileSync(evPath, 'utf8'));
      const labels = (eventData.pull_request?.labels ?? []).map((l: any) => (l.name || '').toLowerCase());
      return labels.includes('override:adr');
    }
    
    // Fallback to gh CLI if available
    const prNumber = process.env.GITHUB_PR_NUMBER ||
      (process.env.GITHUB_REF?.match(/refs\/pull\/(\d+)\/merge/)?.[1] ?? '');
    if (!prNumber) return false;
    
    const env = { ...process.env, GH_TOKEN: process.env.GH_TOKEN || process.env.GITHUB_TOKEN };
    const labelsJson = execSync(`gh pr view ${prNumber} --json labels`, { 
      encoding: 'utf8', 
      stdio: 'pipe', 
      env 
    });
    const labels = JSON.parse(labelsJson).labels || [];
    return labels.some((label: any) => (label.name || '').toLowerCase() === 'override:adr');
  } catch (error) {
    return false;
  }
}

function checkForADRReference(): boolean {
  try {
    // Prefer GitHub event payload (no external deps)
    const evPath = process.env.GITHUB_EVENT_PATH;
    const eventName = process.env.GITHUB_EVENT_NAME;
    if (evPath && existsSync(evPath) && (eventName === 'pull_request' || eventName === 'pull_request_target')) {
      const eventData = JSON.parse(readFileSync(evPath, 'utf8'));
      const prBody = eventData.pull_request?.body || '';
      const adrPattern = /\bADR-\d+\b/i;
      return adrPattern.test(prBody);
    }
    
    // Fallback to gh CLI if available
    let prNumber = process.env.GITHUB_PR_NUMBER ||
      (process.env.GITHUB_REF?.match(/refs\/pull\/(\d+)\/merge/)?.[1] ?? '');
    if (!prNumber) return false;
    
    const env = { ...process.env, GH_TOKEN: process.env.GH_TOKEN || process.env.GITHUB_TOKEN };
    const prJson = execSync(`gh pr view ${prNumber} --json body`, { 
      encoding: 'utf8', 
      stdio: 'pipe', 
      env 
    });
    const prBody = JSON.parse(prJson).body || '';
    const adrPattern = /\bADR-\d+\b/i;
    return adrPattern.test(prBody);
  } catch (error) {
    return false;
  }
}

function checkADRCompliance(): CheckResult {
  // Only run this check in CI for PR validation
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const eventName = process.env.GITHUB_EVENT_NAME;
  const isPR = eventName === 'pull_request' || eventName === 'pull_request_target';
  
  if (!isCI || !isPR) {
    return {
      name: 'ADR Compliance',
      status: 'pass',
      message: 'Check skipped (not a PR in CI)',
    };
  }
  
  try {
    // Check if PR modifies trigger paths that require ADRs
    const triggerPaths = [
      'packages/ai/prompts/**',
      'scripts/**', 
      '.github/workflows/**',
      'docs/wiki/**'
    ];
    
    // Get list of changed files from git using robust PR base detection
    const baseRef = process.env.GITHUB_BASE_REF || 'origin/main';
    let changedFiles: string[] = [];
    
    try {
      // Find merge-base to diff against
      const base = execSync(`git merge-base ${baseRef} HEAD`, {stdio:'pipe', encoding:'utf8'}).trim();
      changedFiles = execSync(`git diff --name-only ${base}...HEAD`, {
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim().split('\n').filter(f => f.length > 0);
    } catch (error) {
      // Fallback to HEAD~1 if merge-base fails
      changedFiles = execSync('git diff --name-only HEAD~1', { 
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim().split('\n').filter(f => f.length > 0);
    }
    
    // Check if any changed files match trigger patterns
    const triggeredPaths = changedFiles.filter(file => 
      triggerPaths.some(pattern => {
        // Simple glob matching
        if (pattern.endsWith('**')) {
          return file.startsWith(pattern.slice(0, -2));
        }
        return file === pattern;
      })
    );
    
    if (triggeredPaths.length === 0) {
      return {
        name: 'ADR Compliance',
        status: 'pass',
        message: 'No files requiring ADR documentation were changed',
      };
    }
    
    // Check for override label first
    const hasOverride = checkForOverrideLabel();
    if (hasOverride) {
      return {
        name: 'ADR Compliance',
        status: 'warn',
        message: `PR modifies ${triggeredPaths.length} files requiring ADR documentation (override:adr label detected)`,
        fix: 'Override label used - ensure ADR is added post-merge if needed',
      };
    }

    // Check if PR body contains ADR reference
    const hasADRReference = checkForADRReference();
    if (!hasADRReference) {
      return {
        name: 'ADR Compliance',
        status: 'fail',
        message: `PR modifies ${triggeredPaths.length} files requiring ADR documentation but no ADR reference found`,
        fix: 'Add ADR reference (ADR-XXX) to PR description or use override:adr label for emergencies',
      };
    }

    return {
      name: 'ADR Compliance',
      status: 'pass',
      message: 'ADR reference found for governance changes',
    };
    
  } catch (error) {
    return {
      name: 'ADR Compliance',
      status: 'warn',
      message: 'Could not check ADR compliance',
      fix: 'Manual review: ensure architectural changes have corresponding ADRs',
    };
  }
}

function main() {
  const args = process.argv.slice(2);
  const isReportMode = args.includes('--report');
  const reportPath = args[args.indexOf('--report') + 1];
  
  const checks: CheckResult[] = [
    checkDependencies(),
    checkPlaceholders(),
    checkPRD(),
    checkEnvironment(),
    checkConstitutionIntegrity(),
    checkLearningsIndex(),
    checkClaudeMdLeanness(),
    checkTop10LinkValidity(),
    checkMicroLessonRetention(),
    checkDisplaySuites(),
    ...checkNewAppImports(),
    ...checkCommandDocs(),
    ...checkReferences(),
    checkEnvExampleSafety(),
    checkRestrictedPaths(),
    checkAILabelHygiene(),
    // Phase 2 checks
    checkArtifactsDirectory(),
    checkRootDocLimits(),
    checkDocsPresence(),
    checkDocsHeaders(),
    ...checkPromptStructure(),
    ...checkDocLinks(),
    checkTraceability(),
    // Phase 5 governance checks
    checkWikiPRDSync(),
    checkADRCompliance(),
  ];

  if (isReportMode && reportPath) {
    // Generate markdown report
    const reportMarkdown = generateReportMarkdown(checks);
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, reportMarkdown, 'utf8');
    console.log(`📄 Report written to: ${reportPath}`);
    
    // Generate command inventory JSON
    const inventoryPath = reportPath.replace('.md', '.json').replace('doctor-report', 'command-inventory');
    const inventory = generateCommandInventory();
    mkdirSync(dirname(inventoryPath), { recursive: true });
    writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2), 'utf8');
    console.log(`📋 Command inventory written to: ${inventoryPath}`);
    
    // Print first 10 failures inline for CI
    const failed = checks.filter((r) => r.status === 'fail');
    if (failed.length > 0) {
      console.log(`\n❌ ${failed.length} failures detected:`);
      failed.slice(0, 10).forEach((result, i) => {
        console.log(`${i + 1}. ${result.name}: ${result.message}`);
        if (result.fix) {
          console.log(`   💡 ${result.fix}`);
        }
      });
      
      if (failed.length > 10) {
        console.log(`   ... and ${failed.length - 10} more (see full report)`);
      }
      
      process.exit(1);
    }
    
    const warnings = checks.filter((r) => r.status === 'warn');
    if (warnings.length > 0) {
      console.log(`\n⚠️ ${warnings.length} warnings detected (see report for details)`);
    }
    
    console.log('✅ Doctor check completed');
    process.exit(0);
  } else {
    printResults(checks);
  }
}

main();
