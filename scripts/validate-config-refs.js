#!/usr/bin/env node
/**
 * Validate Config References
 *
 * Validates that riskPolicyRef fields in slash command frontmatter:
 * 1. Use valid JSON Pointer syntax (#/path/to/field)
 * 2. Reference files that exist
 * 3. Point to valid paths in the referenced JSON files
 */

import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'glob';
import { parse as parseYaml } from 'yaml';

const ROOT_DIR = process.cwd();
const COMMANDS_DIR = join(ROOT_DIR, '.claude/commands');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

/**
 * Extract frontmatter from markdown file
 */
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);
  if (!match) return null;

  try {
    return parseYaml(match[1]);
  } catch (error) {
    console.warn(`Warning: Failed to parse YAML in frontmatter: ${error.message}`);
    return null;
  }
}

/**
 * Parse JSON Pointer reference (e.g., "file.json#/path/to/field")
 */
function parseJsonPointer(ref) {
  const parts = ref.split('#');
  if (parts.length !== 2) {
    return { error: 'Invalid format: must be "file.json#/path/to/field"' };
  }

  const [filePath, pointer] = parts;

  // Validate JSON Pointer syntax (must start with / or be empty)
  if (pointer && !pointer.startsWith('/')) {
    return {
      error: `Invalid JSON Pointer syntax: "${pointer}" (must start with / or be empty)`,
    };
  }

  return { filePath, pointer };
}

/**
 * Resolve JSON Pointer path in an object
 */
function resolveJsonPointer(obj, pointer) {
  if (!pointer || pointer === '/') {
    return { exists: true, value: obj };
  }

  const parts = pointer.slice(1).split('/');
  let current = obj;

  for (const part of parts) {
    // Unescape JSON Pointer special characters
    const unescaped = part.replace(/~1/g, '/').replace(/~0/g, '~');

    if (current && typeof current === 'object' && unescaped in current) {
      current = current[unescaped];
    } else {
      return { exists: false };
    }
  }

  return { exists: true, value: current };
}

/**
 * Check if a file exists
 */
async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate a single config reference
 */
async function validateReference(ref) {
  const errors = [];
  const warnings = [];

  // Parse JSON Pointer
  const parsed = parseJsonPointer(ref);
  if (parsed.error) {
    errors.push(parsed.error);
    return { errors, warnings };
  }

  const { filePath, pointer } = parsed;

  // Resolve file path relative to root
  const fullPath = join(ROOT_DIR, filePath);

  // Check if file exists
  if (!(await fileExists(fullPath))) {
    errors.push(`Referenced file does not exist: ${filePath}`);
    return { errors, warnings };
  }

  // Load and parse JSON file
  let jsonContent;
  try {
    const content = await readFile(fullPath, 'utf-8');
    jsonContent = JSON.parse(content);
  } catch (error) {
    errors.push(`Failed to parse JSON file: ${error.message}`);
    return { errors, warnings };
  }

  // Validate JSON Pointer path
  const resolution = resolveJsonPointer(jsonContent, pointer);
  if (!resolution.exists) {
    errors.push(`JSON Pointer path does not exist: ${pointer}`);
  }

  return { errors, warnings };
}

/**
 * Validate all slash command files
 */
async function validateAllCommands() {
  console.log(
    `${colors.blue}🔍 Validating config references in slash commands...${colors.reset}\n`
  );

  const commandFiles = await glob('**/*.md', { cwd: COMMANDS_DIR });
  let totalErrors = 0;
  let totalWarnings = 0;
  let filesChecked = 0;
  let filesWithIssues = 0;

  for (const file of commandFiles) {
    const fullPath = join(COMMANDS_DIR, file);
    const content = await readFile(fullPath, 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter?.riskPolicyRef) continue;

    filesChecked++;
    const { errors, warnings } = await validateReference(frontmatter.riskPolicyRef);

    if (errors.length > 0 || warnings.length > 0) {
      filesWithIssues++;
      console.log(`${colors.yellow}📄 ${file}${colors.reset}`);

      if (errors.length > 0) {
        for (const error of errors) {
          console.log(`  ${colors.red}❌ ${error}${colors.reset}`);
          totalErrors++;
        }
      }

      if (warnings.length > 0) {
        for (const warning of warnings) {
          console.log(`  ${colors.yellow}⚠️  ${warning}${colors.reset}`);
          totalWarnings++;
        }
      }

      console.log();
    }
  }

  // Summary
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(
    `${colors.blue}📊 Summary: ${filesChecked} files checked, ${filesWithIssues} with issues${colors.reset}`
  );

  if (totalErrors > 0) {
    console.log(`${colors.red}❌ ${totalErrors} error(s) found${colors.reset}`);
  }

  if (totalWarnings > 0) {
    console.log(`${colors.yellow}⚠️  ${totalWarnings} warning(s) found${colors.reset}`);
  }

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(`${colors.green}✅ All config references are valid!${colors.reset}`);
  }

  console.log();

  // Exit with error code if any errors found
  process.exit(totalErrors > 0 ? 1 : 0);
}

// Run validation
validateAllCommands().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
