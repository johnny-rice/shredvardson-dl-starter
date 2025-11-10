/**
 * @fileoverview Test suite for database client functionality
 * @module db/client/tests
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDatabaseClient, DatabaseClient } from './client';
import type { Database } from './types';

// Mock the Supabase SDK
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

describe('DatabaseClient', () => {
  let mockSupabaseClient: Partial<SupabaseClient<Database>>;
  let mockAuth: any;
  let mockFrom: any;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock auth
    mockAuth = {
      signIn: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    };

    // Setup mock from/query builder
    mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          then: vi.fn(),
        })),
      })),
    }));

    // Create mock Supabase client
    mockSupabaseClient = {
      auth: mockAuth,
      from: mockFrom,
      rpc: vi.fn(),
    };

    // Mock createClient to return our mock
    const { createClient } = await import('@supabase/supabase-js');
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a DatabaseClient with valid configuration', () => {
      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);
      expect(client).toBeInstanceOf(DatabaseClient);
    });

    it('should call createClient with correct parameters', async () => {
      const { createClient } = await import('@supabase/supabase-js');

      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      new DatabaseClient(config);

      expect(createClient).toHaveBeenCalledWith(config.url, config.anonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    });

    it('should disable session persistence for server-side usage', async () => {
      const { createClient } = await import('@supabase/supabase-js');

      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      new DatabaseClient(config);

      const callArgs = vi.mocked(createClient).mock.calls[0];
      expect(callArgs[2]).toMatchObject({
        auth: {
          persistSession: false,
        },
      });
    });

    it('should disable auto refresh token', async () => {
      const { createClient } = await import('@supabase/supabase-js');

      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      new DatabaseClient(config);

      const callArgs = vi.mocked(createClient).mock.calls[0];
      expect(callArgs[2]).toMatchObject({
        auth: {
          autoRefreshToken: false,
        },
      });
    });
  });

  describe('raw getter', () => {
    it('should return the raw Supabase client', () => {
      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);
      expect(client.raw).toBe(mockSupabaseClient);
    });

    it('should allow access to Supabase client methods', () => {
      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);
      client.raw.from('_health_check');

      expect(mockFrom).toHaveBeenCalledWith('_health_check');
    });
  });

  describe('auth getter', () => {
    it('should return the auth instance', () => {
      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);
      expect(client.auth).toBe(mockAuth);
    });

    it('should allow access to auth methods', () => {
      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);
      // Auth client should be accessible
      expect(client.auth).toBe(mockAuth);
    });
  });

  describe('query method', () => {
    let originalNodeEnv: string | undefined;

    beforeEach(() => {
      originalNodeEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it('should throw error in production environment', async () => {
      process.env.NODE_ENV = 'production';

      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);

      await expect(client.query('SELECT * FROM users')).rejects.toThrow(
        'DatabaseClient.query is dev-only. Do not use in production.'
      );
    });

    it('should throw error in test environment (non-development)', async () => {
      process.env.NODE_ENV = 'test';

      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);

      await expect(client.query('SELECT * FROM users')).rejects.toThrow(
        'DatabaseClient.query is dev-only. Do not use in production.'
      );
    });

    it('should call rpc with query in development environment', async () => {
      process.env.NODE_ENV = 'development';

      const mockRpc = vi.fn().mockResolvedValue({ data: [], error: null });
      mockSupabaseClient.rpc = mockRpc;

      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);
      await client.query('SELECT * FROM users', ['param1']);

      expect(mockRpc).toHaveBeenCalledWith('query', {
        sql: 'SELECT * FROM users',
        params: ['param1'],
      });
    });

    it('should use empty array as default params', async () => {
      process.env.NODE_ENV = 'development';

      const mockRpc = vi.fn().mockResolvedValue({ data: [], error: null });
      mockSupabaseClient.rpc = mockRpc;

      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);
      await client.query('SELECT * FROM users');

      expect(mockRpc).toHaveBeenCalledWith('query', {
        sql: 'SELECT * FROM users',
        params: [],
      });
    });
  });

  describe('healthCheck method', () => {
    it('should return healthy: true when database is accessible', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: null }),
      });

      mockSupabaseClient.from = vi.fn(() => ({
        select: mockSelect,
      })) as any;

      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);
      const result = await client.healthCheck();

      expect(result).toEqual({ healthy: true });
    });

    it('should return healthy: false when database returns error', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: { message: 'Connection failed' } }),
      });

      mockSupabaseClient.from = vi.fn(() => ({
        select: mockSelect,
      })) as any;

      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);
      const result = await client.healthCheck();

      expect(result).toEqual({ healthy: false });
    });

    it('should query _health_check table with correct parameters', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ error: null });
      const mockSelect = vi.fn().mockReturnValue({ limit: mockLimit });

      mockSupabaseClient.from = vi.fn(() => ({
        select: mockSelect,
      })) as any;

      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);
      await client.healthCheck();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('_health_check');
      expect(mockSelect).toHaveBeenCalledWith('id', { head: true, count: 'exact' });
      expect(mockLimit).toHaveBeenCalledWith(1);
    });

    it('should return healthy: false with error message when exception is thrown', async () => {
      mockSupabaseClient.from = vi.fn(() => {
        throw new Error('Network error');
      }) as any;

      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);
      const result = await client.healthCheck();

      expect(result).toEqual({
        healthy: false,
        error: 'Network error',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockSupabaseClient.from = vi.fn(() => {
        throw 'String error';
      }) as any;

      const config = {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
      };

      const client = new DatabaseClient(config);
      const result = await client.healthCheck();

      expect(result).toEqual({
        healthy: false,
        error: 'Unknown error',
      });
    });
  });
});

describe('createDatabaseClient', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const mockSupabaseClient = {
      auth: {},
      from: vi.fn(),
      rpc: vi.fn(),
    };

    const { createClient } = await import('@supabase/supabase-js');
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any);
  });

  it('should create and return a DatabaseClient instance', () => {
    const config = {
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key',
    };

    const client = createDatabaseClient(config);
    expect(client).toBeInstanceOf(DatabaseClient);
  });

  it('should pass configuration to DatabaseClient constructor', async () => {
    const { createClient } = await import('@supabase/supabase-js');

    const config = {
      url: 'https://custom.supabase.co',
      anonKey: 'custom-anon-key',
    };

    createDatabaseClient(config);

    expect(createClient).toHaveBeenCalledWith(config.url, config.anonKey, expect.any(Object));
  });

  it('should handle missing url in config', () => {
    const config = {
      url: '',
      anonKey: 'test-anon-key',
    };

    // Should still create client - Supabase SDK will handle validation
    const client = createDatabaseClient(config);
    expect(client).toBeInstanceOf(DatabaseClient);
  });

  it('should handle missing anonKey in config', () => {
    const config = {
      url: 'https://test.supabase.co',
      anonKey: '',
    };

    // Should still create client - Supabase SDK will handle validation
    const client = createDatabaseClient(config);
    expect(client).toBeInstanceOf(DatabaseClient);
  });
});
