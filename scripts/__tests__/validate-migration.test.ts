import { describe, it, expect } from 'vitest';
import { validateMigration } from '../validate-migration';

describe('Migration Validation', () => {
  describe('Destructive Operations', () => {
    it('should error on DROP TABLE', () => {
      const sql = 'DROP TABLE users;';
      const result = validateMigration({
        sql,
        path: 'test.sql',
        timestamp: '20251004',
        name: 'test',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('DROP_TABLE');
      expect(result.errors[0].message).toContain('Destructive operation');
      expect(result.errors[0].suggestion).toBeDefined();
    });

    it('should error on DROP COLUMN', () => {
      const sql = 'ALTER TABLE users DROP COLUMN email;';
      const result = validateMigration({
        sql,
        path: 'test.sql',
        timestamp: '20251004',
        name: 'test',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('DROP_COLUMN');
    });

    it('should error on TRUNCATE', () => {
      const sql = 'TRUNCATE TABLE posts;';
      const result = validateMigration({
        sql,
        path: 'test.sql',
        timestamp: '20251004',
        name: 'test',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('TRUNCATE');
    });
  });

  describe('RLS Policy Validation', () => {
    it('should warn on CREATE TABLE without RLS', () => {
      const sql = 'CREATE TABLE posts (id uuid PRIMARY KEY);';
      const result = validateMigration({
        sql,
        path: 'test.sql',
        timestamp: '20251004',
        name: 'test',
      });

      expect(result.valid).toBe(true); // Warnings don't block
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe('MISSING_RLS');
      expect(result.warnings[0].suggestion).toContain(
        'ALTER TABLE posts ENABLE ROW LEVEL SECURITY'
      );
    });

    it('should pass when RLS is enabled', () => {
      const sql = `
        CREATE TABLE posts (id uuid PRIMARY KEY);
        ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
      `;
      const result = validateMigration({
        sql,
        path: 'test.sql',
        timestamp: '20251004',
        name: 'test',
      });

      expect(result.warnings.filter((w) => w.code === 'MISSING_RLS')).toHaveLength(0);
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
      const result = validateMigration({
        sql,
        path: 'test.sql',
        timestamp: '20251004',
        name: 'test',
      });

      expect(result.warnings.some((w) => w.code === 'MISSING_INDEX_FK')).toBe(true);
      expect(result.warnings.find((w) => w.code === 'MISSING_INDEX_FK')?.suggestion).toContain(
        'CREATE INDEX'
      );
    });

    it('should pass when foreign key has index', () => {
      const sql = `
        CREATE TABLE comments (
          id uuid PRIMARY KEY,
          post_id uuid REFERENCES posts(id)
        );
        CREATE INDEX idx_comments_post_id ON comments(post_id);
      `;
      const result = validateMigration({
        sql,
        path: 'test.sql',
        timestamp: '20251004',
        name: 'test',
      });

      expect(result.warnings.filter((w) => w.code === 'MISSING_INDEX_FK')).toHaveLength(0);
    });
  });

  describe('Type Changes', () => {
    it('should warn on ALTER COLUMN type change', () => {
      const sql = 'ALTER TABLE users ALTER COLUMN age TYPE text;';
      const result = validateMigration({
        sql,
        path: 'test.sql',
        timestamp: '20251004',
        name: 'test',
      });

      expect(result.warnings.some((w) => w.code === 'TYPE_CHANGE')).toBe(true);
      expect(result.warnings.find((w) => w.code === 'TYPE_CHANGE')?.suggestion).toContain('USING');
    });

    it('should pass when type change has USING clause', () => {
      const sql = 'ALTER TABLE users ALTER COLUMN age TYPE text USING age::text;';
      const result = validateMigration({
        sql,
        path: 'test.sql',
        timestamp: '20251004',
        name: 'test',
      });

      expect(result.warnings.filter((w) => w.code === 'TYPE_CHANGE')).toHaveLength(0);
    });
  });

  describe('Safe Operations', () => {
    it('should pass on adding column', () => {
      const sql = 'ALTER TABLE users ADD COLUMN bio text;';
      const result = validateMigration({
        sql,
        path: 'test.sql',
        timestamp: '20251004',
        name: 'test',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass on creating index', () => {
      const sql = 'CREATE INDEX idx_users_email ON users(email);';
      const result = validateMigration({
        sql,
        path: 'test.sql',
        timestamp: '20251004',
        name: 'test',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
