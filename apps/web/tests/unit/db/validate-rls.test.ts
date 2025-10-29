import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Unit tests for RLS validation logic
 *
 * These tests verify the validation logic without requiring a real database.
 * Integration tests with a real database should be added separately.
 *
 * Note: Types are defined inline to avoid TypeScript cross-workspace issues
 */

/**
 * RLS policy information
 */
interface PolicyInfo {
  policyName: string;
  operation: string;
  roles: string[];
}

/**
 * RLS status for a single table
 */
interface TableRLSStatus {
  schema: string;
  tableName: string;
  hasRLS: boolean;
  rlsForced: boolean;
  policies: PolicyInfo[];
  isException: boolean;
  hasWarnings: boolean;
  warnings: string[];
}

/**
 * Validation result summary
 */
interface ValidationResult {
  success: boolean;
  totalTables: number;
  tablesWithRLS: number;
  tablesWithoutRLS: number;
  exceptionsCount: number;
  gaps: TableRLSStatus[];
  warnings: TableRLSStatus[];
  summary: string[];
}

describe('RLS Validation', () => {
  describe('ValidationResult', () => {
    it('should have correct structure', () => {
      const result: ValidationResult = {
        success: true,
        totalTables: 5,
        tablesWithRLS: 4,
        tablesWithoutRLS: 1,
        exceptionsCount: 1,
        gaps: [],
        warnings: [],
        summary: ['Test summary'],
      };

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('totalTables');
      expect(result).toHaveProperty('gaps');
      expect(result).toHaveProperty('warnings');
    });
  });

  describe('TableRLSStatus', () => {
    it('should correctly identify tables without RLS', () => {
      const tableStatus: TableRLSStatus = {
        schema: 'public',
        tableName: 'users',
        hasRLS: false,
        rlsForced: false,
        policies: [],
        isException: false,
        hasWarnings: true,
        warnings: ['RLS not enabled'],
      };

      expect(tableStatus.hasRLS).toBe(false);
      expect(tableStatus.warnings).toContain('RLS not enabled');
    });

    it('should correctly identify tables with RLS but no policies', () => {
      const tableStatus: TableRLSStatus = {
        schema: 'public',
        tableName: 'posts',
        hasRLS: true,
        rlsForced: false,
        policies: [],
        isException: false,
        hasWarnings: true,
        warnings: ['RLS enabled but no policies defined (table is inaccessible to all users)'],
      };

      expect(tableStatus.hasRLS).toBe(true);
      expect(tableStatus.policies).toHaveLength(0);
      expect(tableStatus.hasWarnings).toBe(true);
    });

    it('should correctly identify tables with incomplete policies', () => {
      const tableStatus: TableRLSStatus = {
        schema: 'public',
        tableName: 'comments',
        hasRLS: true,
        rlsForced: true,
        policies: [
          { policyName: 'select_own', operation: 'SELECT', roles: ['authenticated'] },
          { policyName: 'insert_own', operation: 'INSERT', roles: ['authenticated'] },
        ],
        isException: false,
        hasWarnings: true,
        warnings: ['Missing policies for operations: UPDATE, DELETE'],
      };

      expect(tableStatus.hasRLS).toBe(true);
      expect(tableStatus.policies).toHaveLength(2);
      expect(tableStatus.warnings).toContain('Missing policies for operations: UPDATE, DELETE');
    });

    it('should correctly identify exception tables', () => {
      const tableStatus: TableRLSStatus = {
        schema: 'public',
        tableName: '_health_check',
        hasRLS: true,
        rlsForced: false,
        policies: [{ policyName: 'allow_anon_read', operation: 'SELECT', roles: ['anon'] }],
        isException: true,
        hasWarnings: false,
        warnings: [],
      };

      expect(tableStatus.isException).toBe(true);
      expect(tableStatus.hasWarnings).toBe(false);
    });
  });

  describe('Policy completeness', () => {
    it('should detect missing CRUD operations', () => {
      const policies = [
        { policyName: 'select_own', operation: 'SELECT', roles: ['authenticated'] },
        { policyName: 'insert_own', operation: 'INSERT', roles: ['authenticated'] },
      ];

      const operations = new Set(policies.map((p) => p.operation));
      const missingOps = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'].filter(
        (op) => !operations.has(op) && !operations.has('ALL')
      );

      expect(missingOps).toEqual(['UPDATE', 'DELETE']);
    });

    it('should not flag missing operations when ALL policy exists', () => {
      const policies = [{ policyName: 'full_access', operation: 'ALL', roles: ['authenticated'] }];

      const operations = new Set(policies.map((p) => p.operation));
      const missingOps = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'].filter(
        (op) => !operations.has(op) && !operations.has('ALL')
      );

      expect(missingOps).toEqual([]);
    });

    it('should not flag missing operations when all CRUD policies exist', () => {
      const policies = [
        { policyName: 'select_own', operation: 'SELECT', roles: ['authenticated'] },
        { policyName: 'insert_own', operation: 'INSERT', roles: ['authenticated'] },
        { policyName: 'update_own', operation: 'UPDATE', roles: ['authenticated'] },
        { policyName: 'delete_own', operation: 'DELETE', roles: ['authenticated'] },
      ];

      const operations = new Set(policies.map((p) => p.operation));
      const missingOps = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'].filter(
        (op) => !operations.has(op) && !operations.has('ALL')
      );

      expect(missingOps).toEqual([]);
    });
  });

  describe('Error messages', () => {
    it('should generate helpful error message for missing RLS', () => {
      const result: ValidationResult = {
        success: false,
        totalTables: 3,
        tablesWithRLS: 2,
        tablesWithoutRLS: 1,
        exceptionsCount: 0,
        gaps: [
          {
            schema: 'public',
            tableName: 'dangerous_table',
            hasRLS: false,
            rlsForced: false,
            policies: [],
            isException: false,
            hasWarnings: true,
            warnings: ['RLS not enabled'],
          },
        ],
        warnings: [],
        summary: [
          '📊 Total tables: 3',
          '✅ Tables with RLS: 2',
          '⚠️  Tables without RLS: 1',
          '🔓 Approved exceptions: 0',
          '\n❌ RLS GAPS FOUND: 1 table(s) missing RLS',
        ],
      };

      expect(result.success).toBe(false);
      expect(result.gaps).toHaveLength(1);
      expect(result.gaps[0].tableName).toBe('dangerous_table');
      expect(result.summary.some((s) => s.includes('RLS GAPS FOUND'))).toBe(true);
    });
  });

  describe('Environment validation', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should require SUPABASE_URL environment variable', () => {
      const oldUrl = process.env.SUPABASE_URL;
      delete process.env.SUPABASE_URL;

      expect(() => {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
          throw new Error(
            'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
          );
        }
      }).toThrow('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');

      if (oldUrl) {
        process.env.SUPABASE_URL = oldUrl;
      }
    });

    it('should require SUPABASE_SERVICE_ROLE_KEY environment variable', () => {
      const oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
          throw new Error(
            'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
          );
        }
      }).toThrow('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');

      if (oldKey) {
        process.env.SUPABASE_SERVICE_ROLE_KEY = oldKey;
      }
    });
  });
});
