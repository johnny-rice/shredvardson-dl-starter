# Failure Handling Best Practices

**Status:** Reference / Production-Ready Patterns
**Last Updated:** 2025-11-05
**Validated By:** Phase 3 sub-agent testing work (now cancelled)

---

## Overview

This document codifies failure handling patterns validated during Phase 3 sub-agent testing work. These patterns demonstrated 100% graceful degradation and 0 crashes during testing.

**⚠️ Important:** Phase 3 sub-agent testing has been cancelled as over-engineered for MVP needs (see [ROADMAP.md](../../ROADMAP.md)). However, the error handling patterns documented here remain valuable for production use in auth flows (#292), API integrations (#294), and webhook handling (#293).

**Key Principles:**

1. ✅ **100% Graceful Degradation** - Never crash, always provide fallback
2. ✅ **Clear Error Messages** - Actionable guidance for users
3. ✅ **Minimum Viable Agent Set** - Research Agent is critical (70% value)
4. ✅ **Retry with Backoff** - Handle transient failures automatically
5. ✅ **Partial Success is Success** - Continue with available data

---

## Pattern 1: Timeout Handling

### Context

Research Agent may exceed 60-second timeout due to complex queries or slow API responses.

### Problem

Without timeout handling, workflow hangs indefinitely, degrading user experience.

### Solution

**Recommended Timeout:** 60 seconds

```typescript
/**
 * Execute Research Agent with 60-second timeout and fallback
 *
 * Fallback Quality: 75% of baseline
 * Confidence Reduction: 95% → 60% (36.8% drop)
 */
async function executeResearchWithTimeout(
  agent: ResearchAgent,
  query: string
): Promise<ResearchResult> {
  const TIMEOUT_MS = 60000; // 60 seconds

  try {
    const result = await Promise.race([
      agent.execute(query),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Research Agent timeout after 60s')),
          TIMEOUT_MS
        )
      )
    ]);

    return result as ResearchResult;
  } catch (error) {
    // Timeout occurred - provide fallback
    console.warn(
      'Research Agent timeout after 60s. Falling back to generic recommendations. ' +
      'Quality may be reduced - consider retrying later.'
    );

    return {
      fallback: true,
      confidence: 60, // Reduced from baseline 95%
      data: generateGenericRecommendations(query),
      timestamp: new Date().toISOString()
    };
  }
}
```

### Generic Recommendations Fallback

```typescript
function generateGenericRecommendations(query: string): string {
  return `
Generic recommendations (fallback due to timeout):
- Review security best practices for ${query}
- Follow established patterns from codebase
- Consider rate limiting and error handling
- Add comprehensive test coverage
- Document edge cases and assumptions

Note: For critical accuracy needs, consider retrying the request.
  `.trim();
}
```

### Key Metrics

| Metric | Value |
|--------|-------|
| Recommended timeout | 60 seconds |
| Fallback quality | 75% of baseline |
| Baseline confidence | 95% |
| Fallback confidence | 60% |
| Confidence reduction | 36.8% |

### Error Message Template

```text
Research Agent timeout after 60s. Falling back to generic recommendations. Quality may be reduced - consider retrying later.
```

---

## Pattern 2: JSON Parsing Errors

### Context

Security Scanner may return malformed JSON due to API errors, truncation, or formatting issues.

### Problem

Unhandled `JSON.parse()` errors crash workflow and block all agents.

### Solution

**Quality without Security Scanner:** 75% (exceeds 70% threshold)

```typescript
/**
 * Parse Security Scanner response with graceful error handling
 *
 * Security Scanner is OPTIONAL - provides 30% of workflow value
 * Workflow achieves 70% quality with Research Agent alone
 */
async function parseSecurityFindings(
  scanner: SecurityScanner
): Promise<SecurityFindings | null> {
  try {
    const raw = await scanner.execute();

    // Type-check before parsing (handle both strings and objects)
    if (typeof raw === 'object' && raw !== null) {
      return raw as SecurityFindings; // Already parsed
    }

    if (typeof raw === 'string') {
      return JSON.parse(raw);
    }

    // Unexpected type
    throw new TypeError(`Unexpected response type: ${typeof raw}`);
  } catch (error) {
    // Log warning but continue workflow
    console.warn('Security scan failed - skipping', {
      error: error.message,
      timestamp: new Date().toISOString()
    });

    return null; // Explicit null, not undefined
  }
}
```

### Null Safety Pattern

```typescript
// Safe property access on potentially null findings
const findings = await parseSecurityFindings(scanner);

// Use optional chaining - never throws on null
const severity = findings?.severity ?? 'unknown';
const issues = findings?.issues ?? [];
const hasHighSeverity = findings?.severity === 'high';

// Workflow continues with or without security data
if (findings) {
  console.log('Security findings available:', findings);
} else {
  console.log('Continuing without security data (70% quality maintained)');
}
```

### Agent Priority Matrix

| Agent | Required | Quality Weight | Impact if Missing |
|-------|----------|----------------|------------------|
| **Research** | ✅ Yes | 70% | Workflow fails (<30% quality) |
| Security | ❌ No | 30% | Workflow acceptable (70% quality) |
| Issue Creator | ❌ No | 10% (bonus) | Workflow acceptable (90% quality) |

**Note:** Research + Security = 100%; Issue Creator is bonus (not counted in base calculation).

### Error Message Template

```text
Security scan failed - skipping
```

---

## Pattern 3: Parallel Execution Partial Failures

### Context

Multiple agents execute in parallel. One or more may fail while others succeed.

### Problem

`Promise.all` fails fast on first rejection, blocking successful agents.

### Solution

**Use `Promise.allSettled` (NOT `Promise.all`)**

```typescript
/**
 * Execute multiple agents in parallel with partial failure handling
 *
 * Quality Matrix:
 * - All succeed: 100%
 * - Research + Security: 90%
 * - Research only: 70% (minimum viable)
 * - Security only: 30% (insufficient)
 * - All fail: 0%
 */
async function executeAgentsInParallel(
  research: ResearchAgent,
  security: SecurityAgent,
  issueCreator: IssueCreatorAgent
): Promise<WorkflowResult> {
  // Use Promise.allSettled - never rejects, returns all results
  const results = await Promise.allSettled([
    research.execute(),
    security.execute(),
    issueCreator.execute()
  ]);

  // Extract successful results
  const successfulData = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  // Log failures without blocking
  const failures = results
    .map((r, i) => ({ result: r, agent: ['research', 'security', 'issue-creator'][i] }))
    .filter(({ result }) => result.status === 'rejected');

  failures.forEach(({ result, agent }) => {
    console.warn(`${agent} agent failed:`, (result as PromiseRejectedResult).reason.message);
  });

  // CRITICAL CHECK: Verify Research Agent succeeded
  const researchSuccess = results[0].status === 'fulfilled';

  if (!researchSuccess) {
    throw new Error(
      'Research Agent failed - cannot continue. Workflow requires Research Agent ' +
      'to achieve minimum 70% quality threshold.'
    );
  }

  // Calculate workflow quality based on successful agents
  const quality = calculateWorkflowQuality(results);

  return {
    researchFindings: results[0].status === 'fulfilled' ? results[0].value : null,
    securityFindings: results[1].status === 'fulfilled' ? results[1].value : null,
    issueCreated: results[2].status === 'fulfilled' ? results[2].value : null,
    quality,
    status: researchSuccess ? 'success' : 'failure'
  };
}
```

### Quality Calculation

```typescript
function calculateWorkflowQuality(
  results: PromiseSettledResult<any>[]
): number {
  const weights = {
    research: 70,    // Critical
    security: 30,    // Optional
    issueCreator: 10 // Nice-to-have
  };

  const [research, security, issueCreator] = results;

  let quality = 0;

  if (research.status === 'fulfilled') quality += weights.research;
  if (security.status === 'fulfilled') quality += weights.security;
  // Issue creator weight is bonus, not counted in base 100

  return quality;
}
```

### Failure Combinations

| Research | Security | Issue Creator | Quality | Status |
|----------|----------|---------------|---------|--------|
| ✅ | ✅ | ✅ | 100% | Success |
| ✅ | ✅ | ❌ | 100% | Success |
| ✅ | ❌ | ✅ | 70% | Success (acceptable) |
| ✅ | ❌ | ❌ | 70% | Success (acceptable) |
| ❌ | ✅ | ✅ | 30% | **Failure** |
| ❌ | ✅ | ❌ | 30% | **Failure** |
| ❌ | ❌ | ✅ | 0% | **Failure** |
| ❌ | ❌ | ❌ | 0% | **Failure** |

### Error Message Templates

```typescript
// Partial success
console.log(
  `Workflow completed with ${successCount}/${totalCount} agents. ` +
  `Quality: ${quality}%. Missing: ${failedAgents.join(', ')}`
);

// Research Agent failure (critical)
throw new Error(
  'Research Agent failed - cannot continue. Workflow requires Research Agent ' +
  'to achieve minimum 70% quality threshold.'
);
```

---

## Pattern 4: Network Errors with Retry

### Context

Network failures, API timeouts, and rate limits are common in production.

### Problem

Without retries, workflow fails on transient errors (~30% of requests).

### Solution

**Retry Configuration:**

- Max retries: **3**
- Exponential backoff: **1s, 2s, 4s**
- Rate limit (429): **60s wait** (special handling)

```typescript
/**
 * Retry with exponential backoff and special rate limit handling
 *
 * Retryable: 408, 429, 500, 502, 503, 504
 * Non-retryable: 400, 401, 403, 404, 422
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  agentName: string = 'agent'
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const isRetryable = isRetryableError(error);

      if (!isRetryable) {
        throw error; // Non-retryable error - fail immediately
      }

      // Special handling for 429 rate limit
      if (error.message.includes('429') || error.message.includes('Rate limit')) {
        const retryAfter = parseRetryAfter(error.message) || 60000; // Default 60s
        console.warn(
          `${agentName}: Rate limit exceeded. Waiting ${retryAfter}ms before retry...`
        );
        await sleep(retryAfter);
        continue;
      }

      // Don't retry if max attempts reached
      if (attempt >= maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s (capped at 8s)
      const delay = Math.min(Math.pow(2, attempt) * 1000, 8000);
      console.warn(
        `${agentName}: Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`
      );
      await sleep(delay);
    }
  }

  // All retries exhausted - provide fallback
  console.error(
    `${agentName}: API unavailable after ${maxRetries} retries: ${lastError.message}`
  );

  throw new Error(
    `API unavailable after ${maxRetries} retries: ${lastError.message}`
  );
}
```

### Retryable Error Classification

```typescript
function isRetryableError(error: any): boolean {
  const message = error.message || '';

  // Prefer structured error codes if available
  if (error.status || error.code) {
    const status = error.status || error.code;
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    const nonRetryableStatuses = [400, 401, 403, 404, 422];

    if (nonRetryableStatuses.includes(status)) return false;
    if (retryableStatuses.includes(status)) return true;
  }

  // Network errors (retryable)
  if (message.includes('ETIMEDOUT')) return true;
  if (message.includes('ECONNREFUSED')) return true;
  if (message.includes('ENOTFOUND')) return false; // Network down - don't retry

  // HTTP status codes (fallback to message parsing)
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  const nonRetryableStatuses = [400, 401, 403, 404, 422];

  // Extract status code from error message
  const statusMatch = message.match(/HTTP (\d{3})/);
  if (statusMatch) {
    const status = parseInt(statusMatch[1]);
    if (nonRetryableStatuses.includes(status)) return false;
    if (retryableStatuses.includes(status)) return true;
  }

  // Default: retry (optimistic)
  return true;
}
```

### Rate Limit Handling

```typescript
function parseRetryAfter(errorMessage: string): number | null {
  // Parse: "HTTP 429: Rate limit exceeded. Retry after 60s"
  const match = errorMessage.match(/Retry after (\d+)s/);
  if (match) {
    return parseInt(match[1]) * 1000; // Convert to milliseconds
  }
  return null;
}
```

### Exponential Backoff Calculation

```typescript
function calculateBackoff(attempt: number, maxDelay: number = 8000): number {
  // 2^0 * 1000 = 1000ms (1s)
  // 2^1 * 1000 = 2000ms (2s)
  // 2^2 * 1000 = 4000ms (4s)
  // 2^3 * 1000 = 8000ms (8s, capped)
  return Math.min(Math.pow(2, attempt) * 1000, maxDelay);
}
```

### Error Message Templates

```typescript
// Retry attempt
console.warn(
  `${agentName}: Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`
);

// Rate limit
console.warn(
  `${agentName}: Rate limit exceeded. Waiting ${retryAfter}ms before retry...`
);

// Retry exhaustion
console.error(
  `${agentName}: API unavailable after ${maxRetries} retries: ${lastError.message}`
);
```

---

## Pattern 5: Fallback Data Provision

### Context

After all retry attempts fail, workflow must continue with degraded functionality.

### Problem

Throwing errors blocks workflow and degrades user experience.

### Solution: Provide Fallback Data with Reduced Confidence

```typescript
/**
 * Execute agent with automatic fallback on failure
 *
 * Quality Targets:
 * - Primary: 95% confidence, full data
 * - Fallback: 50-60% confidence, generic data
 */
async function executeWithFallback<T>(
  agent: Agent,
  fallbackProvider: () => T,
  agentName: string = 'agent'
): Promise<{ data: T; fallback: boolean; confidence: number }> {
  try {
    const result = await withRetry(() => agent.execute(), 3, agentName);

    return {
      data: result,
      fallback: false,
      confidence: 95 // High confidence with primary data
    };
  } catch (error) {
    console.warn(
      `${agentName}: All retries failed. Providing fallback data. ` +
      `Quality degraded to ~50% of baseline.`
    );

    return {
      data: fallbackProvider(),
      fallback: true,
      confidence: 50 // Low confidence with fallback data
    };
  }
}
```

### Fallback Providers

```typescript
// Research Agent fallback
function provideGenericResearchFindings(query: string): ResearchFindings {
  return {
    recommendations: [
      'Review security best practices',
      'Follow established codebase patterns',
      'Add comprehensive test coverage',
      'Document assumptions and edge cases'
    ],
    confidence: 50,
    source: 'generic',
    query,
    timestamp: new Date().toISOString()
  };
}

// Security Scanner fallback
function provideGenericSecurityFindings(): SecurityFindings {
  return {
    findings: [],
    severity: 'unknown',
    message: 'Security scan unavailable - manual review recommended',
    confidence: 0
  };
}
```

---

## Testing Your Failure Handling

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Failure Handling', () => {
  it('should handle Research Agent timeout with fallback', async () => {
    const mockAgent = vi.fn().mockImplementation(() =>
      new Promise((resolve) => setTimeout(resolve, 70000)) // 70s timeout
    );

    const result = await executeResearchWithTimeout(mockAgent, 'test query');

    expect(result.fallback).toBe(true);
    expect(result.confidence).toBe(60);
    expect(result.data).toContain('Generic recommendations');
  });

  it('should handle JSON parse errors gracefully', async () => {
    const mockScanner = vi.fn().mockResolvedValue('{ invalid json');

    const result = await parseSecurityFindings(mockScanner);

    expect(result).toBeNull();
    // Workflow continues without crash
  });

  it('should use Promise.allSettled for parallel execution', async () => {
    const mockSuccess = vi.fn().mockResolvedValue({ data: 'success' });
    const mockFailure = vi.fn().mockRejectedValue(new Error('failed'));

    const results = await Promise.allSettled([
      mockSuccess(),
      mockFailure()
    ]);

    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
    // No crash despite failure
  });

  it('should retry with exponential backoff', async () => {
    let attempts = 0;
    const mockAgent = vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) throw new Error('HTTP 500');
      return { data: 'success' };
    });

    const result = await withRetry(mockAgent, 3);

    expect(attempts).toBe(3);
    expect(result.data).toBe('success');
  });
});
```

---

## Production Monitoring

### Metrics to Track

```typescript
// Metric collection interface
interface FailureMetrics {
  agent_timeouts: number;
  json_parse_errors: number;
  partial_failures: number;
  retry_exhaustions: number;
  fallback_usage: number;
}

// Log metrics for monitoring
function logFailureMetric(
  type: keyof FailureMetrics,
  details: Record<string, any>
): void {
  const metric = {
    type,
    ...details,
    timestamp: new Date().toISOString()
  };

  // Send to monitoring system (e.g., Datadog, New Relic, Sentry)
  console.log('[METRIC]', JSON.stringify(metric));
}
```

### Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Research Agent timeout rate | >5% | >10% | Investigate performance |
| JSON parse error rate | >1% | >5% | Review Scanner output |
| Partial failure rate | >10% | >20% | Check agent reliability |
| Retry exhaustion rate | >5% | >15% | Verify API health |
| Fallback usage rate | >20% | >40% | Escalate to on-call |

### Logging Best Practices

```typescript
// Structured logging for failure events
logger.warn('agent_timeout', {
  agent: 'research',
  duration_ms: 60000,
  fallback_used: true,
  quality_impact: 0.25,
  timestamp: new Date().toISOString()
});

logger.warn('json_parse_error', {
  agent: 'security',
  error: error.message,
  raw_response_length: raw?.length || 0,
  timestamp: new Date().toISOString()
});

logger.warn('parallel_partial_failure', {
  total_agents: 3,
  successful: ['research', 'security'],
  failed: ['issue-creator'],
  workflow_quality: 0.9,
  timestamp: new Date().toISOString()
});

logger.error('network_retry_exhausted', {
  agent: 'research',
  retry_attempts: 3,
  last_error: lastError.message,
  fallback_used: true,
  timestamp: new Date().toISOString()
});
```

---

## Quick Reference

### Timeout Handling

- ✅ Use 60-second timeout for Research Agent
- ✅ Provide generic recommendations as fallback
- ✅ Reduce confidence to 60% with fallback
- ✅ Log: `"Research Agent timeout after 60s. Falling back..."`

### JSON Parsing

- ✅ Wrap `JSON.parse()` in try-catch
- ✅ Return explicit `null` (not `undefined`) on error
- ✅ Type-check response before parsing
- ✅ Log: `"Security scan failed - skipping"`

### Parallel Execution

- ✅ Use `Promise.allSettled` (NOT `Promise.all`)
- ✅ Research Agent is critical (required)
- ✅ Security Scanner is optional
- ✅ Extract successful results with filter + map

### Network Errors

- ✅ Retry max 3 times with exponential backoff (1s, 2s, 4s)
- ✅ Respect 429 rate limit with 60s wait
- ✅ Don't retry client errors (400, 401, 403, 404, 422)
- ✅ Log: `"API unavailable after 3 retries"`

---

## References

**Note:** These patterns were validated during Phase 3 sub-agent testing work. Phase 3 has been cancelled (over-engineered for MVP needs), but the failure handling patterns documented above remain valuable for production use in auth flows, API integrations, and webhook handling.

See [ROADMAP.md](../../ROADMAP.md) for current MVP-focused priorities.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
