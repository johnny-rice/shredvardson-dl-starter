---
id: TASK-20251004-database-migration-workflow
type: task
parentId: PLAN-20251004-database-migration-workflow
issue: 124
plan: PLAN-20251004-database-migration-workflow
spec: SPEC-20251004-database-migration-workflow
branch: feature/124-database-migration-workflow
source: https://github.com/Shredvardson/dl-starter/issues/124
---

# Task Breakdown: Database Migration Workflow

**Parent Plan**: [PLAN-20251004-database-migration-workflow](../plans/plan-005-database-migration-workflow.md)

**Branch**: `feature/124-database-migration-workflow`

**Estimated Effort**: 2-3 days

## Implementation Order

Following constitutional TDD order:
1. **Contracts & Interfaces** - Define validation rules and interfaces
2. **Test Foundation** - Integration → E2E → Unit tests
3. **Implementation** - Build features with tests passing
4. **Integration & Polish** - CI/CD, AI commands, refinement
5. **Documentation & Release** - Wiki docs, PR preparation

---

## Phase 1: Contracts & Interfaces (2 hours)

### Task 1.1: Define Migration Validation Contract

**Objective**: Establish what makes a migration safe

**Files to Create**:
- `scripts/types/migration-validation.ts`

**Implementation**:
```typescript
// scripts/types/migration-validation.ts
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
```

**Acceptance Criteria**:
- [ ] Types defined for all validation scenarios
- [ ] Error vs warning distinction clear
- [ ] Extensible for future validation rules

**Commands**:
```bash
# Create types file
mkdir -p scripts/types
touch scripts/types/migration-validation.ts
```

### Task 1.2: Define Seed Data Contract

**Objective**: Establish seed data interface

**Files to Create**:
- `scripts/types/seed-data.ts`

**Implementation**:
```typescript
// scripts/types/seed-data.ts
export interface SeedConfig {
  userCount?: number;
  organizationCount?: number;
  deterministic?: boolean; // For test seeds
  locale?: string;
}

export interface SeedResult {
  success: boolean;
  created: {
    users: number;
    organizations?: number;
    [entity: string]: number | undefined;
  };
  errors: string[];
  duration: number; // ms
}

export interface SeedEntity {
  id: string;
  [field: string]: any;
}
```

**Acceptance Criteria**:
- [ ] Types support both dev and test seeds
- [ ] Configurable entity counts
- [ ] Result tracking for debugging

**Commands**:
```bash
# Create types file
touch scripts/types/seed-data.ts
```

---

## Phase 2: Test Foundation (4 hours)

### Task 2.1: Create Migration Validation Test Suite

**Objective**: Tests for validation rules (contracts first!)

**Files to Create**:
- `scripts/__tests__/validate-migration.test.ts`
- `scripts/__tests__/fixtures/migrations/`

**Implementation**:
```typescript
// scripts/__tests__/validate-migration.test.ts
import { describe, it, expect } from 'vitest';
import { validateMigration } from '../validate-migration';

describe('Migration Validation', () => {
  describe('Destructive Operations', () => {
    it('should error on DROP TABLE', () => {
      const sql = 'DROP TABLE users;';
      const result = validateMigration({ sql, path: 'test.sql', timestamp: '20251004', name: 'test' });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('DROP_TABLE');
      expect(result.errors[0].message).toContain('Destructive operation');
      expect(result.errors[0].suggestion).toBeDefined();
    });

    it('should error on DROP COLUMN', () => {
      const sql = 'ALTER TABLE users DROP COLUMN email;';
      const result = validateMigration({ sql, path: 'test.sql', timestamp: '20251004', name: 'test' });

      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('DROP_COLUMN');
    });

    it('should error on TRUNCATE', () => {
      const sql = 'TRUNCATE TABLE posts;';
      const result = validateMigration({ sql, path: 'test.sql', timestamp: '20251004', name: 'test' });

      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('TRUNCATE');
    });
  });

  describe('RLS Policy Validation', () => {
    it('should warn on CREATE TABLE without RLS', () => {
      const sql = 'CREATE TABLE posts (id uuid PRIMARY KEY);';
      const result = validateMigration({ sql, path: 'test.sql', timestamp: '20251004', name: 'test' });

      expect(result.valid).toBe(true); // Warnings don't block
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe('MISSING_RLS');
      expect(result.warnings[0].suggestion).toContain('ALTER TABLE posts ENABLE ROW LEVEL SECURITY');
    });

    it('should pass when RLS is enabled', () => {
      const sql = `
        CREATE TABLE posts (id uuid PRIMARY KEY);
        ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
      `;
      const result = validateMigration({ sql, path: 'test.sql', timestamp: '20251004', name: 'test' });

      expect(result.warnings.filter(w => w.code === 'MISSING_RLS')).toHaveLength(0);
    });
  });

  describe('Performance Checks', () => {
    it('should warn on foreign key without index', () => {
      const sql = `
        CREATE TABLE comments (
          id uuid PRIMARY KEY,
          post_id uuid REFERENCES posts(id)
        );
      `;
      const result = validateMigration({ sql, path: 'test.sql', timestamp: '20251004', name: 'test' });

      expect(result.warnings.some(w => w.code === 'MISSING_INDEX_FK')).toBe(true);
      expect(result.warnings.find(w => w.code === 'MISSING_INDEX_FK')?.suggestion).toContain('CREATE INDEX');
    });

    it('should pass when foreign key has index', () => {
      const sql = `
        CREATE TABLE comments (
          id uuid PRIMARY KEY,
          post_id uuid REFERENCES posts(id)
        );
        CREATE INDEX idx_comments_post_id ON comments(post_id);
      `;
      const result = validateMigration({ sql, path: 'test.sql', timestamp: '20251004', name: 'test' });

      expect(result.warnings.filter(w => w.code === 'MISSING_INDEX_FK')).toHaveLength(0);
    });
  });

  describe('Type Changes', () => {
    it('should warn on ALTER COLUMN type change', () => {
      const sql = 'ALTER TABLE users ALTER COLUMN age TYPE text;';
      const result = validateMigration({ sql, path: 'test.sql', timestamp: '20251004', name: 'test' });

      expect(result.warnings.some(w => w.code === 'TYPE_CHANGE')).toBe(true);
      expect(result.warnings.find(w => w.code === 'TYPE_CHANGE')?.suggestion).toContain('USING');
    });

    it('should pass when type change has USING clause', () => {
      const sql = 'ALTER TABLE users ALTER COLUMN age TYPE text USING age::text;';
      const result = validateMigration({ sql, path: 'test.sql', timestamp: '20251004', name: 'test' });

      expect(result.warnings.filter(w => w.code === 'TYPE_CHANGE')).toHaveLength(0);
    });
  });

  describe('Safe Operations', () => {
    it('should pass on adding column', () => {
      const sql = 'ALTER TABLE users ADD COLUMN bio text;';
      const result = validateMigration({ sql, path: 'test.sql', timestamp: '20251004', name: 'test' });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass on creating index', () => {
      const sql = 'CREATE INDEX idx_users_email ON users(email);';
      const result = validateMigration({ sql, path: 'test.sql', timestamp: '20251004', name: 'test' });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
```

**Test Fixtures**:
```bash
# Create test fixtures directory
mkdir -p scripts/__tests__/fixtures/migrations

# Sample good migration
cat > scripts/__tests__/fixtures/migrations/20251004000001_create_posts.sql <<'EOF'
-- Create posts table with RLS
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);
EOF

# Sample bad migration
cat > scripts/__tests__/fixtures/migrations/20251004000002_bad_migration.sql <<'EOF'
-- Dangerous operations
DROP TABLE old_posts;
ALTER TABLE users DROP COLUMN legacy_field;
TRUNCATE TABLE logs;
EOF
```

**Acceptance Criteria**:
- [ ] All validation scenarios have tests
- [ ] Tests fail initially (no implementation yet)
- [ ] Clear test descriptions
- [ ] Test fixtures cover edge cases

**Commands**:
```bash
# Install test dependencies (if not already)
pnpm add -D vitest @vitest/ui

# Create test file
mkdir -p scripts/__tests__
touch scripts/__tests__/validate-migration.test.ts

# Run tests (should fail - no implementation yet)
pnpm vitest scripts/__tests__/validate-migration.test.ts
```

### Task 2.2: Create Seed Data Test Suite

**Objective**: Tests for seed data generation

**Files to Create**:
- `scripts/__tests__/seed-dev.test.ts`
- `scripts/__tests__/seed-test.test.ts`

**Implementation**:
```typescript
// scripts/__tests__/seed-dev.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { seedDev } from '../seed-dev';
import { createClient } from '@supabase/supabase-js';

describe('Development Seed Data', () => {
  let supabase: any;

  beforeEach(async () => {
    // Use test database
    supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Clean database
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  });

  it('should create specified number of users', async () => {
    const result = await seedDev({ userCount: 10 });

    expect(result.success).toBe(true);
    expect(result.created.users).toBe(10);
    expect(result.errors).toHaveLength(0);
  });

  it('should create realistic user data', async () => {
    await seedDev({ userCount: 5 });

    const { data: users } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    expect(users).toHaveLength(5);

    users.forEach((user: any) => {
      expect(user.email).toMatch(/^[\w\.-]+@[\w\.-]+\.\w+$/);
      expect(user.name).toBeTruthy();
      expect(user.created_at).toBeTruthy();
    });
  });

  it('should generate unique data', async () => {
    await seedDev({ userCount: 20 });

    const { data: users } = await supabase
      .from('users')
      .select('email')
      .limit(20);

    const emails = users.map((u: any) => u.email);
    const uniqueEmails = new Set(emails);

    expect(uniqueEmails.size).toBe(20);
  });

  it('should respect RLS policies', async () => {
    // Seed should use service role key, not user key
    const result = await seedDev({ userCount: 5 });
    expect(result.success).toBe(true);
  });

  it('should report duration', async () => {
    const result = await seedDev({ userCount: 10 });

    expect(result.duration).toBeGreaterThan(0);
    expect(result.duration).toBeLessThan(10000); // <10s for 10 users
  });
});

// scripts/__tests__/seed-test.test.ts
describe('Test Seed Data', () => {
  it('should create deterministic data', async () => {
    const result1 = await seedTest({ deterministic: true });
    const result2 = await seedTest({ deterministic: true });

    const { data: users1 } = await supabase.from('users').select('*').order('id');

    // Reset
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await seedTest({ deterministic: true });

    const { data: users2 } = await supabase.from('users').select('*').order('id');

    expect(users1).toEqual(users2);
  });

  it('should use known IDs for testing', async () => {
    await seedTest();

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', 'test-user-1')
      .single();

    expect(user).toBeTruthy();
    expect(user.email).toBe('test1@example.com');
  });
});
```

**Acceptance Criteria**:
- [ ] Tests verify data quality (realistic, unique)
- [ ] Tests verify RLS compatibility
- [ ] Tests verify deterministic mode
- [ ] Tests initially fail

**Commands**:
```bash
# Create test files
touch scripts/__tests__/seed-dev.test.ts
touch scripts/__tests__/seed-test.test.ts

# Run tests
pnpm vitest scripts/__tests__/seed-dev.test.ts
```

### Task 2.3: Create E2E Migration Workflow Test

**Objective**: End-to-end validation of migration lifecycle

**Files to Create**:
- `apps/web/tests/e2e/migration-workflow.spec.ts`

**Implementation**:
```typescript
// apps/web/tests/e2e/migration-workflow.spec.ts
import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('Migration Workflow', () => {
  test('local migration workflow', async () => {
    // Create test migration
    const timestamp = Date.now();
    const migrationPath = `supabase/migrations/${timestamp}_test_table.sql`;

    await execAsync(`cat > ${migrationPath} <<'EOF'
CREATE TABLE test_workflow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
);
ALTER TABLE test_workflow ENABLE ROW LEVEL SECURITY;
EOF`);

    // Validate migration
    const { stdout: validateOutput } = await execAsync('pnpm db:validate');
    expect(validateOutput).toContain('✓ Validation passed');

    // Apply migration
    await execAsync('supabase db reset');

    // Verify table exists
    const { stdout: tables } = await execAsync(
      `supabase db dump --db-url=${process.env.SUPABASE_DB_URL} --schema-only | grep test_workflow`
    );
    expect(tables).toContain('CREATE TABLE test_workflow');

    // Cleanup
    await execAsync(`rm ${migrationPath}`);
  });

  test('validation catches dangerous migration', async () => {
    const timestamp = Date.now();
    const migrationPath = `supabase/migrations/${timestamp}_dangerous.sql`;

    await execAsync(`cat > ${migrationPath} <<'EOF'
DROP TABLE users;
EOF`);

    // Validation should fail
    try {
      await execAsync('pnpm db:validate');
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.stdout || error.stderr).toContain('DROP_TABLE');
    }

    // Cleanup
    await execAsync(`rm ${migrationPath}`);
  });
});
```

**Acceptance Criteria**:
- [ ] Tests full local workflow
- [ ] Tests validation blocking
- [ ] Tests can be run in CI

---

## Phase 3: Implementation (8 hours)

### Task 3.1: Implement Migration Validation Script

**Objective**: Build validation logic to make tests pass

**Files to Create**:
- `scripts/validate-migration.ts`
- `scripts/validators/index.ts`

**Implementation**:
```typescript
// scripts/validate-migration.ts
import fs from 'fs';
import path from 'path';
import { ValidationResult, MigrationFile, ValidationCode } from './types/migration-validation';
import {
  detectDestructiveOperations,
  detectMissingRLS,
  detectMissingIndexOnFK,
  detectTypeChanges
} from './validators';

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
    const sql = fs.readFileSync(filePath, 'utf-8');
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
```

```typescript
// scripts/validators/index.ts
import { ValidationError, ValidationWarning, ValidationCode } from '../types/migration-validation';

export function detectDestructiveOperations(sql: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const lines = sql.split('\n');

  lines.forEach((line, index) => {
    const trimmed = line.trim().toUpperCase();

    if (trimmed.startsWith('DROP TABLE')) {
      errors.push({
        code: ValidationCode.DROP_TABLE,
        message: 'Destructive operation: DROP TABLE will permanently delete data',
        line: index + 1,
        suggestion: 'Consider: 1) Rename table instead, 2) Add archived_at column for soft delete, 3) Create backup first',
      });
    }

    if (trimmed.includes('DROP COLUMN')) {
      errors.push({
        code: ValidationCode.DROP_COLUMN,
        message: 'Destructive operation: DROP COLUMN will permanently delete data',
        line: index + 1,
        suggestion: 'Consider: 1) Rename column, 2) Migrate data first, 3) Use two-step migration',
      });
    }

    if (trimmed.startsWith('TRUNCATE')) {
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

export function detectMissingRLS(sql: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const createTableRegex = /CREATE TABLE\s+(\w+)/gi;
  const rlsRegex = /ALTER TABLE\s+(\w+)\s+ENABLE ROW LEVEL SECURITY/gi;

  const tables = new Set<string>();
  const rlsEnabled = new Set<string>();

  let match;
  while ((match = createTableRegex.exec(sql)) !== null) {
    tables.add(match[1].toLowerCase());
  }

  while ((match = rlsRegex.exec(sql)) !== null) {
    rlsEnabled.add(match[1].toLowerCase());
  }

  tables.forEach(table => {
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

  fkColumns.forEach(column => {
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
```

**Acceptance Criteria**:
- [ ] All validation tests pass
- [ ] CLI works: `pnpm db:validate`
- [ ] Clear, actionable error messages
- [ ] Suggestion for every error/warning

**Commands**:
```bash
# Create implementation files
mkdir -p scripts/validators
touch scripts/validate-migration.ts
touch scripts/validators/index.ts

# Add to package.json
npm pkg set scripts.db:validate="tsx scripts/validate-migration.ts"

# Run tests - should pass now
pnpm vitest scripts/__tests__/validate-migration.test.ts

# Test CLI
pnpm db:validate
```

### Task 3.2: Implement Seed Data Scripts

**Objective**: Build seed data generators

**Files to Create**:
- `scripts/seed-dev.ts`
- `scripts/seed-test.ts`
- `supabase/seed.sql`

**Implementation**:
```typescript
// scripts/seed-dev.ts
import { faker } from '@faker-js/faker';
import { createClient } from '@supabase/supabase-js';
import { SeedConfig, SeedResult } from './types/seed-data';

export async function seedDev(config: SeedConfig = {}): Promise<SeedResult> {
  const startTime = Date.now();
  const result: SeedResult = {
    success: false,
    created: { users: 0 },
    errors: [],
    duration: 0,
  };

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { userCount = 50, locale = 'en' } = config;
    faker.setDefaultRefDate(new Date());
    faker.locale = locale;

    console.log(`🌱 Seeding development data (${userCount} users)...\n`);

    // Generate users
    const users = [];
    for (let i = 0; i < userCount; i++) {
      users.push({
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        bio: faker.lorem.paragraph(),
        avatar_url: faker.image.avatar(),
        created_at: faker.date.past({ years: 2 }).toISOString(),
      });
    }

    // Insert users
    const { data: insertedUsers, error: userError } = await supabase
      .from('users')
      .insert(users)
      .select();

    if (userError) {
      result.errors.push(`Users: ${userError.message}`);
    } else {
      result.created.users = insertedUsers?.length || 0;
      console.log(`✓ Created ${result.created.users} users`);
    }

    // TODO: Add more entities as schema grows
    // - Organizations
    // - Posts
    // - etc.

    result.success = result.errors.length === 0;
    result.duration = Date.now() - startTime;

    console.log(`\n✅ Seeding complete in ${result.duration}ms`);

    return result;

  } catch (error: any) {
    result.errors.push(error.message);
    result.duration = Date.now() - startTime;

    console.error(`\n❌ Seeding failed: ${error.message}`);

    return result;
  }
}

// CLI entry point
if (require.main === module) {
  seedDev({
    userCount: parseInt(process.env.USER_COUNT || '50'),
    locale: process.env.LOCALE || 'en',
  }).catch(console.error);
}
```

```typescript
// scripts/seed-test.ts
import { createClient } from '@supabase/supabase-js';
import { SeedConfig, SeedResult } from './types/seed-data';

export async function seedTest(config: SeedConfig = {}): Promise<SeedResult> {
  const startTime = Date.now();
  const result: SeedResult = {
    success: false,
    created: { users: 0 },
    errors: [],
    duration: 0,
  };

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('🧪 Seeding test data...\n');

    // Deterministic test data with known IDs
    const testUsers = [
      {
        id: 'test-user-1',
        email: 'test1@example.com',
        name: 'Test User 1',
        bio: 'Test bio 1',
      },
      {
        id: 'test-user-2',
        email: 'test2@example.com',
        name: 'Test User 2',
        bio: 'Test bio 2',
      },
      {
        id: 'test-user-admin',
        email: 'admin@example.com',
        name: 'Test Admin',
        bio: 'Admin user for testing',
      },
    ];

    const { data: insertedUsers, error: userError } = await supabase
      .from('users')
      .insert(testUsers)
      .select();

    if (userError) {
      result.errors.push(`Users: ${userError.message}`);
    } else {
      result.created.users = insertedUsers?.length || 0;
      console.log(`✓ Created ${result.created.users} test users`);
    }

    result.success = result.errors.length === 0;
    result.duration = Date.now() - startTime;

    console.log(`\n✅ Test seeding complete in ${result.duration}ms`);

    return result;

  } catch (error: any) {
    result.errors.push(error.message);
    result.duration = Date.now() - startTime;

    console.error(`\n❌ Test seeding failed: ${error.message}`);

    return result;
  }
}

// CLI entry point
if (require.main === module) {
  seedTest().catch(console.error);
}
```

```sql
-- supabase/seed.sql
-- Base seed for auth and system setup
-- This runs before synthetic seeds

-- Insert system user (for system-generated content)
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system@example.com',
  '{"name": "System"}'
)
ON CONFLICT (id) DO NOTHING;
```

**Acceptance Criteria**:
- [ ] Dev seed creates realistic data
- [ ] Test seed creates deterministic data
- [ ] All seed tests pass
- [ ] Scripts log progress
- [ ] Error handling works

**Commands**:
```bash
# Install dependency
pnpm add -D @faker-js/faker

# Create files
touch scripts/seed-dev.ts
touch scripts/seed-test.ts
touch supabase/seed.sql

# Add scripts to package.json
npm pkg set scripts.db:seed:dev="tsx scripts/seed-dev.ts"
npm pkg set scripts.db:seed:test="tsx scripts/seed-test.ts"
npm pkg set scripts.db:reset="supabase db reset && pnpm db:seed:dev"

# Run tests
pnpm vitest scripts/__tests__/seed-dev.test.ts

# Test manually
pnpm db:seed:dev
```

---

## Phase 4: Integration & Polish (4 hours)

### Task 4.1: Create GitHub Actions Workflows

**Objective**: CI/CD pipeline for migrations

**Files to Create**:
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`

**Implementation**:
```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]
  pull_request:
    branches: [develop]

jobs:
  validate-migrations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Validate migrations
        run: pnpm db:validate

  deploy-staging:
    needs: validate-migrations
    if: github.event_name == 'push'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link to Staging Project
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_STAGING_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Run Migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Migrations deployed to staging successfully!'
            })
```

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  validate-migrations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Validate migrations
        run: pnpm db:validate

  deploy-production:
    needs: validate-migrations
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://your-production-url.com

    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link to Production Project
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PRODUCTION_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Run Migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Notify Success
        run: |
          echo "✅ Production deployment complete"
          echo "Migrations applied successfully"
```

**Acceptance Criteria**:
- [ ] Workflows run on correct branches
- [ ] Validation blocks deployment
- [ ] Production requires approval
- [ ] Clear status reporting

**Commands**:
```bash
# Create workflow files
mkdir -p .github/workflows
touch .github/workflows/deploy-staging.yml
touch .github/workflows/deploy-production.yml

# Configure GitHub secrets (manual step):
# - SUPABASE_ACCESS_TOKEN
# - SUPABASE_STAGING_PROJECT_ID
# - SUPABASE_PRODUCTION_PROJECT_ID

# Configure production environment protection:
# Settings → Environments → production → Required reviewers
```

### Task 4.2: Create AI Command Guardrails

**Objective**: Safe AI-assisted migration workflows

**Files to Create**:
- `.claude/commands/db-create-migration.md`
- `.claude/commands/db-validate-migration.md`
- `.claude/commands/db-seed-dev.md`

**Implementation**:
```markdown
<!-- .claude/commands/db-create-migration.md -->
---
name: db-create-migration
description: Create a new database migration with safety checks
requiresHITL: true
riskPolicyRef: docs/constitution.md#database-safety
---

# Create Database Migration

**IMPORTANT SAFETY RULES**:
- ❌ NEVER apply migrations directly to any environment
- ✅ ALWAYS create migration file for human review
- ✅ ALWAYS run validation after creation
- ✅ ALWAYS document intent in migration header
- ✅ ALWAYS ask for confirmation before proceeding

## Process

1. **Gather Requirements**
   - Ask user: What schema change is needed?
   - Ask user: What is the purpose of this change?
   - Ask user: Are there any dependencies?

2. **Generate Migration File**
   - Create timestamp: `date +%Y%m%d%H%M%S`
   - Create filename: `{timestamp}_{description}.sql`
   - Add header with:
     ```sql
     -- Migration: {description}
     -- Purpose: {user explanation}
     -- Dependencies: {any required migrations}
     -- Created: {date}
     ```

3. **Write SQL**
   - Generate SQL based on requirements
   - Include RLS policies for new tables
   - Include indexes for foreign keys
   - Use safe patterns from docs/wiki/schema-patterns.md

4. **Validate Migration**
   - Run: `pnpm db:validate`
   - Show validation results to user
   - If errors: Explain and suggest fixes
   - If warnings: Explain risks and alternatives

5. **Review with User**
   - Show generated migration file
   - Show validation results
   - Ask: "Does this look correct?"
   - Wait for user confirmation

6. **Next Steps**
   - Suggest: Test locally with `supabase db reset`
   - Suggest: Commit to version control
   - Suggest: Create PR for review

## Example Usage

User: "Add a posts table with title and content"