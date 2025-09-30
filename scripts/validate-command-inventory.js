#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const INVENTORY_PATH = 'artifacts/command-inventory.json';

function validateCommandInventory() {
  try {
    // Load inventory
    const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));

    let hasErrors = false;

    // Validate each command entry
    for (const [commandPath, commandData] of Object.entries(inventory)) {
      if (!commandPath.startsWith('.claude/commands/') || !commandPath.endsWith('.md')) {
        continue; // Skip non-command entries
      }

      // Validate paths array
      if (commandData.paths && Array.isArray(commandData.paths)) {
        for (let i = 0; i < commandData.paths.length; i++) {
          const pathValue = commandData.paths[i];

          if (typeof pathValue !== 'string') {
            console.error(`❌ ${commandPath}.paths[${i}]: must be a string`);
            hasErrors = true;
            continue;
          }

          // Check for problematic patterns
          const problems = [];

          if (pathValue.includes('`')) {
            problems.push('contains backticks');
          }

          if (pathValue.includes('\n') || pathValue.includes('\r')) {
            problems.push('contains newlines');
          }

          if (pathValue.includes('**')) {
            problems.push('contains markdown formatting');
          }

          if (/^\s*-\s/.test(pathValue)) {
            problems.push('looks like markdown list item');
          }

          if (/^\/[a-zA-Z]/.test(pathValue)) {
            problems.push('looks like a command (starts with /)');
          }

          if (pathValue.length > 200) {
            problems.push('too long (likely prose instead of path)');
          }

          if (problems.length > 0) {
            console.error(`❌ ${commandPath}.paths[${i}]: ${problems.join(', ')}`);
            console.error(
              `    Invalid value: ${JSON.stringify(pathValue.substring(0, 100))}${pathValue.length > 100 ? '...' : ''}`
            );
            hasErrors = true;
          }
        }
      }
    }

    if (hasErrors) {
      console.error('\n💡 Paths should be clean file paths like:');
      console.error('   ✅ "docs/constitution.md"');
      console.error('   ✅ "src/app/page.tsx"');
      console.error('   ✅ []');
      console.error('\n   ❌ "`docs/constitution.md`" (no backticks)');
      console.error('   ❌ "/commands:generate" (no commands)');
      console.error('   ❌ "long prose content..." (no prose)');
      process.exit(1);
    }

    console.log('✅ Command inventory validation passed');
  } catch (error) {
    console.error('❌ Validation error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  validateCommandInventory();
}

module.exports = { validateCommandInventory };
