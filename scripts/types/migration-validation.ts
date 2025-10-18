export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  line?: number;
  suggestion?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  line?: number;
  suggestion?: string;
}

export enum ValidationCode {
  // Errors (blocking)
  DROP_TABLE = 'DROP_TABLE',
  DROP_COLUMN = 'DROP_COLUMN',
  TRUNCATE = 'TRUNCATE',

  // Warnings (non-blocking)
  MISSING_RLS = 'MISSING_RLS',
  TYPE_CHANGE = 'TYPE_CHANGE',
  MISSING_INDEX_FK = 'MISSING_INDEX_FK',
  MISSING_ROLLBACK = 'MISSING_ROLLBACK',
}

export interface MigrationFile {
  path: string;
  timestamp: string;
  name: string;
  sql: string;
}
