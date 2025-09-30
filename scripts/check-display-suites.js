#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories to scan for test files
const TEST_DIRS = [
  '.',
  'tests',
  'e2e',
  '__tests__',
  'apps/web/tests',
  'apps/web/e2e',
  'apps/web/__tests__',
];

let violatingFiles = [];

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and other excluded dirs
      if (!['node_modules', '.git', '.next', '.turbo', 'coverage', 'dist'].includes(entry)) {
        scanDirectory(fullPath);
      }
    } else if (/\.(test|spec)\.(t|j)sx?$/.test(entry)) {
      checkTestFile(fullPath);
    }
  }
}

function checkTestFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if file contains @display tag
    if (!content.includes('@display')) {
      return; // No @display tag, no need to check
    }

    // Simple check: if file has @display and localStorage/sessionStorage in beforeEach context
    if (
      content.includes('beforeEach') &&
      /beforeEach[\s\S]*?(?:localStorage|sessionStorage|clearAllMocks|resetModules|\.clear\(\)|\.reset\(\))/m.test(
        content
      )
    ) {
      violatingFiles.push({
        file: filePath,
        issue: 'UI display suite contains state-mutating beforeEach hooks',
      });
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

function main() {
  console.log('🔍 Checking @display suites for state mutation...');

  // Scan all test directories
  for (const dir of TEST_DIRS) {
    scanDirectory(dir);
  }

  if (violatingFiles.length > 0) {
    console.error('❌ @display suites must not mutate state in beforeEach hooks:');
    violatingFiles.forEach((violation) => {
      console.error(`   ${violation.file}: ${violation.issue}`);
    });
    console.error('\n💡 Micro-lesson: test-isolation-hooks');
    console.error('   UI display tests should not clear mocks/storage to avoid coupling');
    process.exit(1);
  }

  console.log('✅ All @display suites properly isolated');
}

if (require.main === module) {
  main();
}

module.exports = { checkTestFile, scanDirectory };
