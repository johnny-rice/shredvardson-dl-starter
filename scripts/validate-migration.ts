import fs from 'fs';
import path from 'path';
import { ValidationResult, MigrationFile } from './types/migration-validation';
import {
  detectDestructiveOperations,
  detectMissingRLS,
  detectMissingIndexOnFK,
  detectTypeChanges
} from './validators';

/**
 * Validates a single database migration file for safety and best practices.
 *
 * Performs comprehensive validation including:
 * - Destructive operation detection (DROP, TRUNCATE)
 * - Row Level Security (RLS) policy checks
 * - Foreign key index validation
 * - Type change safety verification
 *
 * @param file - Migration file object containing path, timestamp, name, and SQL content
 * @returns Validation result with errors (blocking) and warnings (non-blocking)
 *
 * @example
 * ```ts
 * const result = validateMigration({
 *   sql: 'DROP TABLE users;',
 *   path: 'migration.sql',
 *   timestamp: '20251004',
 *   name: 'test'
 * });
 * console.log(result.valid); // false
 * console.log(result.errors); // [{ code: 'DROP_TABLE', ... }]
 * ```
 */
export function validateMigration(file: MigrationFile): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check destructive operations (errors)
  const destructive = detectDestructiveOperations(file.sql);
  result.errors.push(...destructive);

  // Check missing RLS (warning)
  const missingRLS = detectMissingRLS(file.sql);
  result.warnings.push(...missingRLS);

  // Check missing indexes on foreign keys (warning)
  const missingIndexes = detectMissingIndexOnFK(file.sql);
  result.warnings.push(...missingIndexes);

  // Check type changes without conversion (warning)
  const typeChanges = detectTypeChanges(file.sql);
  result.warnings.push(...typeChanges);

  result.valid = result.errors.length === 0;

  return result;
}

/**
 * Validates all migration files in the supabase/migrations directory.
 *
 * Scans the migrations directory, validates each .sql file, and reports results.
 * Exits with code 1 if any validation errors are found (blocking issues).
 * Warnings do not block but are reported for review.
 *
 * @throws Process exits with code 1 if validation errors found
 *
 * @example
 * ```bash
 * # CLI usage
 * pnpm db:validate
 * ```
 */
export async function validateAllMigrations(): Promise<void> {
  const migrationsDir = path.join(process.cwd(), 'supabase/migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log('✓ No migrations directory found (okay for new projects)');
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('✓ No migration files found');
    return;
  }

  console.log(`Validating ${files.length} migration files...\n`);

  let hasErrors = false;

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);

    let sql: string;
    try {
      sql = fs.readFileSync(filePath, 'utf-8');
    } catch (error: any) {
      console.log(`❌ ${file}`);
      console.log(`   ERROR: Unable to read file - ${error.message}`);
      hasErrors = true;
      continue;
    }

    const [timestamp, ...nameParts] = file.replace('.sql', '').split('_');

    const migration: MigrationFile = {
      path: filePath,
      timestamp,
      name: nameParts.join('_'),
      sql,
    };

    const result = validateMigration(migration);

    if (result.errors.length > 0) {
      console.log(`❌ ${file}`);
      result.errors.forEach(error => {
        console.log(`   ERROR [${error.code}]: ${error.message}`);
        if (error.suggestion) {
          console.log(`   → ${error.suggestion}`);
        }
      });
      hasErrors = true;
    } else if (result.warnings.length > 0) {
      console.log(`⚠️  ${file}`);
      result.warnings.forEach(warning => {
        console.log(`   WARN [${warning.code}]: ${warning.message}`);
        if (warning.suggestion) {
          console.log(`   → ${warning.suggestion}`);
        }
      });
    } else {
      console.log(`✓ ${file}`);
    }
  }

  console.log();

  if (hasErrors) {
    console.error('❌ Validation failed with errors');
    process.exit(1);
  } else {
    console.log('✅ All migrations passed validation');
  }
}

// CLI entry point
if (require.main === module) {
  validateAllMigrations().catch(console.error);
}
