import { ValidationError, ValidationWarning, ValidationCode } from '../types/migration-validation';

/**
 * Detects destructive SQL operations that could cause data loss.
 *
 * Scans migration SQL for dangerous operations like DROP TABLE, DROP COLUMN, and TRUNCATE.
 * Strips comments to prevent bypass attempts and uses word boundary matching to catch
 * operations anywhere in a line.
 *
 * @param sql - The SQL migration content to validate
 * @returns Array of validation errors for destructive operations found
 *
 * @example
 * ```ts
 * const errors = detectDestructiveOperations('DROP TABLE users;');
 * // Returns: [{ code: 'DROP_TABLE', message: '...', suggestion: '...' }]
 * ```
 */
export function detectDestructiveOperations(sql: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const lines = sql.split('\n');

  lines.forEach((line, index) => {
    const trimmed = line.trim().toUpperCase();
    // Remove SQL comments to prevent bypass via comments
    const withoutComments = trimmed
      .replace(/--.*$/, '')
      .replace(/\/\*.*?\*\//g, '')
      .trim();

    // Use word boundary regex to catch DROP TABLE anywhere in the line
    if (/\bDROP\s+TABLE\b/i.test(withoutComments)) {
      errors.push({
        code: ValidationCode.DROP_TABLE,
        message: 'Destructive operation: DROP TABLE will permanently delete data',
        line: index + 1,
        suggestion:
          'Consider: 1) Rename table instead, 2) Add archived_at column for soft delete, 3) Create backup first',
      });
    }

    if (/\bDROP\s+COLUMN\b/i.test(withoutComments)) {
      errors.push({
        code: ValidationCode.DROP_COLUMN,
        message: 'Destructive operation: DROP COLUMN will permanently delete data',
        line: index + 1,
        suggestion: 'Consider: 1) Rename column, 2) Migrate data first, 3) Use two-step migration',
      });
    }

    if (/\bTRUNCATE\b/i.test(withoutComments)) {
      errors.push({
        code: ValidationCode.TRUNCATE,
        message: 'Destructive operation: TRUNCATE will delete all rows',
        line: index + 1,
        suggestion: 'Use DELETE with WHERE clause if you need selective deletion',
      });
    }
  });

  return errors;
}

/**
 * Detects tables created without Row Level Security enabled.
 *
 * Scans for CREATE TABLE statements and checks if corresponding RLS enablement
 * exists. Handles quoted identifiers, schema-qualified names, and IF NOT EXISTS clauses.
 *
 * @param sql - The SQL migration content to validate
 * @returns Array of warnings for tables missing RLS policies
 *
 * @example
 * ```ts
 * const warnings = detectMissingRLS('CREATE TABLE posts (id uuid);');
 * // Returns: [{ code: 'MISSING_RLS', message: '...', suggestion: '...' }]
 * ```
 */
export function detectMissingRLS(sql: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  // Match table names: word chars OR quoted identifiers OR schema.table
  const createTableRegex =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(\w+)\.)?("[^"]+"|[\w]+)/gi;
  const rlsRegex =
    /ALTER\s+TABLE\s+(?:(\w+)\.)?("[^"]+"|[\w]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;

  const tables = new Set<string>();
  const rlsEnabled = new Set<string>();

  let match;
  while ((match = createTableRegex.exec(sql)) !== null) {
    // match[2] is the table name (with or without quotes)
    const tableName = match[2].replace(/"/g, '').toLowerCase();
    tables.add(tableName);
  }

  while ((match = rlsRegex.exec(sql)) !== null) {
    const tableName = match[2].replace(/"/g, '').toLowerCase();
    rlsEnabled.add(tableName);
  }

  tables.forEach((table) => {
    if (!rlsEnabled.has(table)) {
      warnings.push({
        code: ValidationCode.MISSING_RLS,
        message: `Table '${table}' created without Row Level Security`,
        suggestion: `Add: ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY; and CREATE POLICY statements`,
      });
    }
  });

  return warnings;
}

/**
 * Detects foreign key columns without corresponding indexes.
 *
 * Foreign keys without indexes can cause severe performance issues in PostgreSQL.
 * This function scans for REFERENCES clauses and checks for matching CREATE INDEX statements.
 *
 * @param sql - The SQL migration content to validate
 * @returns Array of warnings for foreign keys missing indexes
 *
 * @example
 * ```ts
 * const warnings = detectMissingIndexOnFK('user_id uuid REFERENCES users(id)');
 * // Returns: [{ code: 'MISSING_INDEX_FK', message: '...', suggestion: '...' }]
 * ```
 */
export function detectMissingIndexOnFK(sql: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const fkRegex = /(\w+)\s+\w+\s+REFERENCES\s+\w+\((\w+)\)/gi;
  const indexRegex = /CREATE INDEX\s+\w+\s+ON\s+\w+\((\w+)\)/gi;

  const fkColumns = new Set<string>();
  const indexedColumns = new Set<string>();

  let match;
  while ((match = fkRegex.exec(sql)) !== null) {
    fkColumns.add(match[1].toLowerCase());
  }

  while ((match = indexRegex.exec(sql)) !== null) {
    indexedColumns.add(match[1].toLowerCase());
  }

  fkColumns.forEach((column) => {
    if (!indexedColumns.has(column)) {
      warnings.push({
        code: ValidationCode.MISSING_INDEX_FK,
        message: `Foreign key column '${column}' does not have an index`,
        suggestion: `Add: CREATE INDEX idx_<table>_${column} ON <table>(${column});`,
      });
    }
  });

  return warnings;
}

/**
 * Detects column type changes without explicit conversion logic.
 *
 * ALTER COLUMN TYPE without a USING clause can fail or produce unexpected results
 * when PostgreSQL cannot automatically convert the data. This function warns about
 * type changes missing the USING clause.
 *
 * @param sql - The SQL migration content to validate
 * @returns Array of warnings for unsafe type changes
 *
 * @example
 * ```ts
 * const warnings = detectTypeChanges('ALTER TABLE users ALTER COLUMN age TYPE text');
 * // Returns: [{ code: 'TYPE_CHANGE', message: '...', suggestion: '...' }]
 * ```
 */
export function detectTypeChanges(sql: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const typeChangeRegex = /ALTER TABLE\s+\w+\s+ALTER COLUMN\s+(\w+)\s+TYPE\s+(\w+)/gi;

  let match;
  while ((match = typeChangeRegex.exec(sql)) !== null) {
    const column = match[1];
    const newType = match[2];

    // Check if USING clause is present
    const fullStatement = sql.substring(match.index, match.index + 200);
    if (!fullStatement.toUpperCase().includes('USING')) {
      warnings.push({
        code: ValidationCode.TYPE_CHANGE,
        message: `Column '${column}' type changed to '${newType}' without conversion`,
        suggestion: `Add USING clause: ALTER COLUMN ${column} TYPE ${newType} USING ${column}::${newType}`,
      });
    }
  }

  return warnings;
}
