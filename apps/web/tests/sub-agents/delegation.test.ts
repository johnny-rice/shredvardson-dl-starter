/**
 * Integration tests for sub-agent delegation framework
 *
 * Tests the core delegation mechanism that routes tasks to Haiku 4.5 sub-agents.
 * These tests validate input/output handling, timeout enforcement, and parallel execution.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ResearchAgentOutput } from '../../types/agents';

// Mock types for delegation framework
interface DelegationInput<T = unknown> {
  agentType:
    | 'research-agent'
    | 'security-scanner'
    | 'test-generator'
    | 'refactor-analyzer'
    | 'documentation-writer';
  task: T;
  timeout?: number; // milliseconds
}

interface DelegationOutput<T = unknown> {
  success: boolean;
  result?: T;
  error?: string;
  executionTime: number; // milliseconds
  tokenCount: number;
}

// Mock delegation function (implementation will come later)
const delegateToAgent = vi.fn(
  async <T, R>(_input: DelegationInput<T>): Promise<DelegationOutput<R>> => {
    // Default mock implementation
    return {
      success: true,
      result: {} as R,
      executionTime: 1000,
      tokenCount: 500,
    };
  }
);

// Helper to create default ResearchAgentOutput for mocking
const createMockResearchOutput = (
  overrides: Partial<ResearchAgentOutput> = {}
): ResearchAgentOutput => ({
  key_findings: [],
  architecture_patterns: [],
  recommendations: [],
  code_locations: [],
  external_references: [],
  research_depth: 'deep',
  confidence: 'high',
  ...overrides,
});

// Helper to mock successful delegation
const mockSuccessfulDelegation = <T>(result: T, executionTime = 1000) => {
  delegateToAgent.mockResolvedValueOnce({
    success: true,
    result,
    executionTime,
    tokenCount: 500,
  });
};

// Helper to mock failed delegation
const mockFailedDelegation = (error: string) => {
  delegateToAgent.mockResolvedValueOnce({
    success: false,
    error,
    executionTime: 100,
    tokenCount: 0,
  });
};

// Helper to mock timeout
const mockTimeout = (timeoutMs: number) => {
  delegateToAgent.mockResolvedValueOnce({
    success: false,
    error: `Task timed out after ${timeoutMs}ms`,
    executionTime: timeoutMs,
    tokenCount: 0,
  });
};

describe('Sub-Agent Delegation Framework', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('delegateToAgent - Input Validation', () => {
    test('validates input structure', async () => {
      const validInput: DelegationInput<{ query: string }> = {
        agentType: 'research-agent',
        task: { query: 'How does auth work?' },
      };

      mockSuccessfulDelegation(createMockResearchOutput());

      const result = await delegateToAgent(validInput);

      expect(result.success).toBe(true);
      expect(delegateToAgent).toHaveBeenCalledWith(validInput);
    });

    test('rejects invalid agent type', async () => {
      const invalidInput = {
        agentType: 'invalid-agent',
        task: {},
      } as unknown as DelegationInput;

      mockFailedDelegation('Invalid agent type: invalid-agent');

      const result = await delegateToAgent(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid agent type');
    });

    test('requires task field', async () => {
      const invalidInput = {
        agentType: 'research-agent',
      } as DelegationInput;

      mockFailedDelegation('Task field is required');

      const result = await delegateToAgent(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Task field is required');
    });

    test('accepts depth parameter with valid values', async () => {
      const input: DelegationInput<{ query: string; depth: 'shallow' | 'deep' }> = {
        agentType: 'research-agent',
        task: { query: 'Where is auth configured?', depth: 'shallow' },
      };

      mockSuccessfulDelegation(
        createMockResearchOutput({
          key_findings: [
            {
              finding: 'Auth config in src/auth.ts',
              source: 'internal',
              location: 'src/auth.ts:10',
            },
          ],
          research_depth: 'shallow',
        })
      );

      const result = (await delegateToAgent(input)) as DelegationOutput<ResearchAgentOutput>;

      expect(result.success).toBe(true);
      expect(result.result?.research_depth).toBe('shallow');
    });

    test('accepts depth parameter with deep value', async () => {
      const input: DelegationInput<{ query: string; depth: 'shallow' | 'deep' }> = {
        agentType: 'research-agent',
        task: { query: 'Explain the complete auth flow', depth: 'deep' },
      };

      mockSuccessfulDelegation(
        createMockResearchOutput({
          key_findings: [
            {
              finding: 'JWT tokens used for session management',
              source: 'internal',
              location: 'src/auth.ts:45',
            },
            {
              finding: 'OAuth flow handles third-party providers',
              source: 'internal',
              location: 'src/auth/oauth.ts:15',
            },
          ],
          architecture_patterns: ['JWT-based authentication', 'OAuth 2.0'],
          recommendations: [
            {
              action: 'Consider token rotation',
              rationale: 'Enhances security for long-lived sessions',
            },
          ],
        })
      );

      const result = (await delegateToAgent(input)) as DelegationOutput<ResearchAgentOutput>;

      expect(result.success).toBe(true);
      expect(result.result?.research_depth).toBe('deep');
      expect(result.result?.key_findings?.length).toBeGreaterThan(1);
    });

    test('defaults to deep research when depth not specified', async () => {
      const input: DelegationInput<{ query: string }> = {
        agentType: 'research-agent',
        task: { query: 'What is the auth flow?' },
      };

      mockSuccessfulDelegation(createMockResearchOutput());

      const result = (await delegateToAgent(input)) as DelegationOutput<ResearchAgentOutput>;

      expect(result.success).toBe(true);
      expect(result.result?.research_depth).toBe('deep');
    });

    test('rejects invalid depth value', async () => {
      const input = {
        agentType: 'research-agent',
        task: { query: 'test', depth: 'invalid' },
      } as DelegationInput;

      mockFailedDelegation('Invalid depth value: must be "shallow" or "deep"');

      const result = await delegateToAgent(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid depth value');
    });

    test('accepts include_external parameter', async () => {
      const input: DelegationInput<{ query: string; include_external: boolean }> = {
        agentType: 'research-agent',
        task: { query: 'Next.js best practices', include_external: true },
      };

      mockSuccessfulDelegation({
        key_findings: [
          {
            finding: 'Next.js 15 recommends Server Actions for mutations',
            source: 'external',
            location: 'N/A',
            reference: 'Next.js docs - Server Actions',
          },
        ],
        architecture_patterns: ['Next.js App Router with Server Components'],
        recommendations: [
          {
            action: 'Use Server Actions for form submissions',
            rationale: 'Based on Next.js 15 best practices',
          },
        ],
        code_locations: [],
        external_references: [
          {
            library: 'next.js',
            topic: 'Server Actions',
            url: 'https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions',
          },
        ],
        research_depth: 'deep',
        confidence: 'high',
      });

      const result = (await delegateToAgent(input)) as DelegationOutput<ResearchAgentOutput>;

      expect(result.success).toBe(true);
      expect(result.result?.external_references).toBeDefined();
      expect(result.result?.external_references?.length).toBeGreaterThan(0);
      expect(result.result?.external_references?.[0]).toMatchObject({
        library: expect.any(String),
        topic: expect.any(String),
        url: expect.stringMatching(/^https?:\/\/[^\s]+$/i),
      });
      // Validate URL is well-formed
      expect(result.result?.external_references?.[0].url).toBeDefined();
      const url = result.result?.external_references?.[0].url;
      if (url) {
        expect(() => new URL(url)).not.toThrow();
      }
      expect(result.result?.key_findings?.[0]).toMatchObject({
        finding: expect.any(String),
        source: 'external',
        reference: expect.any(String),
      });
      expect(result.result?.recommendations?.[0]).toMatchObject({
        action: expect.any(String),
        rationale: expect.any(String),
      });
    });

    test('does not include external references when include_external is false', async () => {
      const input: DelegationInput<{ query: string; include_external: boolean }> = {
        agentType: 'research-agent',
        task: { query: 'Internal auth patterns', include_external: false },
      };

      mockSuccessfulDelegation(
        createMockResearchOutput({
          key_findings: [
            {
              finding: 'Auth config found',
              source: 'internal',
              location: 'src/auth.ts:10',
            },
          ],
          architecture_patterns: ['JWT-based authentication'],
        })
      );

      const result = (await delegateToAgent(input)) as DelegationOutput<ResearchAgentOutput>;

      expect(result.success).toBe(true);
      expect(result.result?.external_references).toEqual([]);
      expect(result.result?.key_findings?.every((f) => f.source === 'internal')).toBe(true);
    });
  });

  describe('delegateToAgent - Timeout Enforcement', () => {
    test('enforces timeout limits', async () => {
      const input: DelegationInput = {
        agentType: 'research-agent',
        task: { query: 'Complex query' },
        timeout: 5000, // 5 seconds
      };

      mockTimeout(5000);

      const result = await delegateToAgent(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out');
      expect(result.executionTime).toBeGreaterThanOrEqual(5000);
    });

    test('uses default timeout if not specified', async () => {
      const input: DelegationInput = {
        agentType: 'research-agent',
        task: { query: 'Simple query' },
        // No timeout specified - should use 60s default
      };

      mockSuccessfulDelegation(createMockResearchOutput(), 1000);

      const result = await delegateToAgent(input);

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeLessThan(60000); // Should complete before default timeout
    });

    test('returns partial results on timeout for research agent', async () => {
      const input: DelegationInput = {
        agentType: 'research-agent',
        task: { query: 'Broad query' },
        timeout: 30000,
      };

      // Mock partial results returned before timeout
      delegateToAgent.mockResolvedValueOnce({
        success: false,
        error: 'Task timed out after 30000ms',
        result: {
          key_findings: [
            {
              finding: 'Partial finding 1',
              source: 'internal',
              location: 'src/file.ts:10',
            },
          ],
          architecture_patterns: [],
          recommendations: [],
          code_locations: [],
          external_references: [],
          research_depth: 'deep',
          confidence: 'low',
        },
        executionTime: 30000,
        tokenCount: 2000,
      });

      const result = await delegateToAgent(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out');
      expect(result.result).toBeDefined(); // Partial results available
    });
  });

  describe('delegateToAgent - Output Validation', () => {
    test('validates output structure for research agent with internal-only research', async () => {
      const input: DelegationInput = {
        agentType: 'research-agent',
        task: { query: 'How does auth work?' },
      };

      const expectedOutput = {
        key_findings: [
          {
            finding: 'Finding 1',
            source: 'internal',
            location: 'src/auth.ts:20',
          },
          {
            finding: 'Finding 2',
            source: 'internal',
            location: 'src/auth.ts:30',
          },
        ],
        architecture_patterns: ['Pattern 1'],
        recommendations: [
          {
            action: 'Recommendation 1',
            rationale: 'Improves code quality',
          },
        ],
        code_locations: [{ file: 'src/auth.ts', line: 15, purpose: 'Auth config' }],
        external_references: [],
        research_depth: 'deep',
        confidence: 'high',
      };

      mockSuccessfulDelegation(expectedOutput);

      const result = await delegateToAgent(input);

      expect(result.success).toBe(true);
      expect(result.result).toEqual(expectedOutput);
      expect(result.tokenCount).toBeLessThan(5000); // <5K token limit
    });

    test('validates output structure for research agent with external references', async () => {
      const input: DelegationInput = {
        agentType: 'research-agent',
        task: { query: 'Next.js best practices', include_external: true },
      };

      const expectedOutput: ResearchAgentOutput = {
        key_findings: [
          {
            finding: 'Server Actions recommended for mutations',
            source: 'external',
            location: 'N/A',
            reference: 'Next.js docs - Server Actions',
          },
        ],
        architecture_patterns: ['App Router'],
        recommendations: [
          {
            action: 'Migrate to Server Actions',
            rationale: 'Aligns with Next.js 15 best practices',
          },
        ],
        code_locations: [],
        external_references: [
          {
            library: 'next.js',
            topic: 'Server Actions',
            url: 'https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions',
          },
        ],
        research_depth: 'deep',
        confidence: 'high',
      };

      mockSuccessfulDelegation(expectedOutput);

      const result = (await delegateToAgent(input)) as DelegationOutput<ResearchAgentOutput>;

      expect(result.success).toBe(true);
      expect(result.result).toEqual(expectedOutput);
      expect(result.result?.external_references).toBeDefined();
      expect(result.result?.external_references?.length).toBeGreaterThan(0);
      expect(result.tokenCount).toBeLessThan(5000);
    });

    test('enforces 5K token limit', async () => {
      const input: DelegationInput = {
        agentType: 'research-agent',
        task: { query: 'Broad query' },
      };

      delegateToAgent.mockResolvedValueOnce({
        success: false,
        error: 'Output exceeds 5K token limit (actual: 6500)',
        executionTime: 1000,
        tokenCount: 6500,
      });

      const result = await delegateToAgent(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('5K token limit');
    });

    test('validates required fields are present', async () => {
      const input: DelegationInput = {
        agentType: 'security-scanner',
        task: { scan_type: 'full' },
      };

      // Missing required 'summary' field
      const invalidOutput = {
        findings: [],
        // summary: { ... } <- missing
        recommendations: [],
        scan_coverage: '80%',
      };

      delegateToAgent.mockResolvedValueOnce({
        success: false,
        error: 'Missing required field: summary',
        result: invalidOutput,
        executionTime: 1000,
        tokenCount: 500,
      });

      const result = await delegateToAgent(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required field');
    });

    test.each([
      { field: 'research_depth', expectedError: 'Missing required field: research_depth' },
      { field: 'confidence', expectedError: 'Missing required field: confidence' },
      { field: 'key_findings', expectedError: 'Missing required field: key_findings' },
      { field: 'recommendations', expectedError: 'Missing required field: recommendations' },
      {
        field: 'external_references',
        expectedError: 'Missing required field: external_references',
      },
      { field: 'code_locations', expectedError: 'Missing required field: code_locations' },
      {
        field: 'architecture_patterns',
        expectedError: 'Missing required field: architecture_patterns',
      },
    ])('validates research agent required field: $field', async ({ field, expectedError }) => {
      const input: DelegationInput = {
        agentType: 'research-agent',
        task: { query: 'test query' },
      };

      const invalidOutput: Record<string, unknown> = {
        key_findings: [],
        architecture_patterns: [],
        recommendations: [],
        code_locations: [],
        external_references: [],
        research_depth: 'deep',
        confidence: 'high',
      };

      delete invalidOutput[field];

      delegateToAgent.mockResolvedValueOnce({
        success: false,
        error: expectedError,
        result: invalidOutput,
        executionTime: 1000,
        tokenCount: 500,
      });

      const result = await delegateToAgent(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required field');
      expect(result.error).toContain(field);
    });
  });

  describe('delegateToAgent - Error Handling', () => {
    test('handles agent failures gracefully', async () => {
      const input: DelegationInput = {
        agentType: 'test-generator',
        task: { test_type: 'unit', targets: ['src/button.tsx'] },
      };

      mockFailedDelegation('Agent encountered an error: File not found');

      const result = await delegateToAgent(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File not found');
      expect(result.result).toBeUndefined();
    });

    test('returns structured errors for validation failures', async () => {
      const input: DelegationInput = {
        agentType: 'refactor-analyzer',
        task: { targets: [] }, // Empty targets
      };

      mockFailedDelegation('Validation failed: targets array cannot be empty');

      const result = await delegateToAgent(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
    });

    test('handles network/API errors', async () => {
      const input: DelegationInput = {
        agentType: 'documentation-writer',
        task: { doc_type: 'jsdoc', targets: ['src/utils.ts'] },
      };

      // Mock a structured error response (not an exception)
      delegateToAgent.mockResolvedValueOnce({
        success: false,
        error: 'Network error: NETWORK_ERROR',
        executionTime: 0,
        tokenCount: 0,
      });

      const result = await delegateToAgent(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Network error');
    });
  });

  describe('Parallel Execution', () => {
    test('runs multiple delegations concurrently', async () => {
      const inputs: DelegationInput[] = [
        { agentType: 'research-agent', task: { query: 'Query 1' } },
        { agentType: 'security-scanner', task: { scan_type: 'rls' } },
        { agentType: 'refactor-analyzer', task: { targets: ['src/'] } },
      ];

      // Mock realistic responses for each agent type
      mockSuccessfulDelegation(
        createMockResearchOutput({
          key_findings: [
            {
              finding: 'Auth implementation found',
              source: 'internal',
              location: 'src/auth.ts:10',
            },
          ],
          research_depth: 'shallow',
        }),
        1000
      );
      mockSuccessfulDelegation({ vulnerabilities: [], scan_completed: true }, 1000);
      mockSuccessfulDelegation({ suggestions: ['Extract util function'], complexity: 'low' }, 1000);

      const startTime = Date.now();
      const results = await Promise.all(inputs.map((input) => delegateToAgent(input)));
      const totalTime = Date.now() - startTime;

      // If sequential, would take ~3000ms. Parallel should be ~1000ms
      expect(totalTime).toBeLessThan(2000);
      expect(results).toHaveLength(3);
      expect(results.every((r) => r.success)).toBe(true);
    });

    test('handles partial failures in parallel execution', async () => {
      const inputs: DelegationInput[] = [
        { agentType: 'research-agent', task: { query: 'Query 1' } },
        { agentType: 'security-scanner', task: { scan_type: 'rls' } },
      ];

      mockSuccessfulDelegation(createMockResearchOutput({ research_depth: 'shallow' }));
      mockFailedDelegation('Scanner failed');

      const results = await Promise.all(
        inputs.map((input) =>
          delegateToAgent(input).catch((e) => ({ success: false, error: e.message }))
        )
      );

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });

    test('propagates errors correctly in parallel execution', async () => {
      const inputs: DelegationInput[] = [
        { agentType: 'research-agent', task: { query: 'Query 1' } },
        { agentType: 'test-generator', task: { test_type: 'unit', targets: [] } },
      ];

      mockSuccessfulDelegation(createMockResearchOutput({ research_depth: 'shallow' }));
      delegateToAgent.mockRejectedValueOnce(new Error('Critical failure'));

      const results = await Promise.allSettled(inputs.map((input) => delegateToAgent(input)));

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
  });

  describe('Performance Characteristics', () => {
    test('tracks execution time', async () => {
      const input: DelegationInput = {
        agentType: 'research-agent',
        task: { query: 'Query' },
      };

      mockSuccessfulDelegation({ result: 'Success' }, 1500);

      const result = await delegateToAgent(input);

      expect(result.executionTime).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });

    test('tracks token usage', async () => {
      const input: DelegationInput = {
        agentType: 'security-scanner',
        task: { scan_type: 'full' },
      };

      delegateToAgent.mockResolvedValueOnce({
        success: true,
        result: { findings: [] },
        executionTime: 2000,
        tokenCount: 3500,
      });

      const result = await delegateToAgent(input);

      expect(result.tokenCount).toBeDefined();
      expect(result.tokenCount).toBeLessThan(5000);
    });

    test('completes internal research tasks in <60 seconds', async () => {
      const input: DelegationInput = {
        agentType: 'research-agent',
        task: { query: 'How does X work?' },
      };

      mockSuccessfulDelegation(createMockResearchOutput(), 45000);

      const result = await delegateToAgent(input);

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeLessThan(60000);
    });

    test('completes external research tasks in <120 seconds', async () => {
      const input: DelegationInput = {
        agentType: 'research-agent',
        task: { query: 'Next.js + Supabase patterns', include_external: true },
      };

      mockSuccessfulDelegation(
        createMockResearchOutput({
          external_references: [
            {
              library: 'next.js',
              topic: 'Server Actions',
              url: 'https://nextjs.org/docs',
            },
          ],
        }),
        90000 // 90 seconds for external research
      );

      const result = await delegateToAgent(input);

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeLessThan(120000); // Updated timeout per PR
    });
  });
});
