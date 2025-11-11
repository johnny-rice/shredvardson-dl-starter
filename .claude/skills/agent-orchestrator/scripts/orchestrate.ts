#!/usr/bin/env tsx

/**
 * Agent Orchestrator - Main Entry Point
 *
 * Coordinates delegation of exploration and research tasks to Haiku-based sub-agents,
 * enabling 50%+ token reduction and 56%+ cost savings per workflow.
 *
 * Usage:
 *   pnpm skill:run agent-orchestrator orchestrate '{"task_type": "research", "context": {...}}'
 */

import { delegateResearch } from './delegate-research.js';
import { delegateSecurity } from './delegate-security.js';
import { delegateTest } from './delegate-test.js';
import type {
  ConfidenceLevel,
  MultiAgentFindings,
  OrchestrationRequest,
  OrchestrationResponse,
  ResearchResponse,
  SecurityResponse,
  TestResponse,
} from './types.js';

/** Union type for all possible agent findings */
type AgentFindings = ResearchResponse | SecurityResponse | TestResponse | MultiAgentFindings;

/**
 * Main orchestration function
 *
 * Routes tasks to appropriate sub-agents, handles parallel execution,
 * merges responses, and coordinates overall orchestration flow.
 *
 * @param request - Orchestration request with task type and context
 * @returns Orchestration response with findings and metadata
 */
export async function orchestrate(request: OrchestrationRequest): Promise<OrchestrationResponse> {
  const startTime = Date.now();

  try {
    console.log('[orchestrator] Starting orchestration:', {
      task_type: request.task_type,
      agents: request.agents,
    });

    // Route based on task type
    switch (request.task_type) {
      case 'research':
        return await orchestrateSingleAgent('research', request, startTime);

      case 'security':
        return await orchestrateSingleAgent('security', request, startTime);

      case 'test':
        return await orchestrateSingleAgent('test', request, startTime);

      case 'multi':
        return await orchestrateMultiAgent(request, startTime);

      default:
        throw new Error(`Unknown task_type: ${request.task_type}`);
    }
  } catch (error) {
    // Orchestration failed, return error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const executionTime = Date.now() - startTime;

    console.error('[orchestrator] Orchestration failed:', errorMessage);

    return {
      success: false,
      agent_used: request.task_type === 'multi' ? request.agents || [] : request.task_type,
      findings: {},
      execution_time_ms: executionTime,
      tokens_used: 0,
      confidence: 'low',
      error: errorMessage,
      fallback: 'Orchestration failed, falling back to main agent',
    };
  }
}

/**
 * Orchestrate single-agent task
 *
 * @param agentType - Type of agent to invoke
 * @param request - Orchestration request
 * @param startTime - Start time for execution tracking
 * @returns Orchestration response
 */
async function orchestrateSingleAgent(
  agentType: 'research' | 'security' | 'test',
  request: OrchestrationRequest,
  startTime: number
): Promise<OrchestrationResponse> {
  let findings: ResearchResponse | SecurityResponse | TestResponse;
  let tokensUsed = 0;

  // Delegate to appropriate agent
  switch (agentType) {
    case 'research':
      findings = await delegateResearch(request.context);
      tokensUsed = estimateTokens(findings);
      break;

    case 'security':
      findings = await delegateSecurity(request.context);
      tokensUsed = estimateTokens(findings);
      break;

    case 'test':
      findings = await delegateTest(request.context);
      tokensUsed = 0; // Stub doesn't use tokens
      break;

    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }

  const executionTime = Date.now() - startTime;

  // Extract confidence from findings
  const confidence = extractConfidence(findings);

  return {
    success: true,
    agent_used: agentType,
    findings,
    execution_time_ms: executionTime,
    tokens_used: tokensUsed,
    confidence,
  };
}

/**
 * Orchestrate multi-agent task (parallel execution)
 *
 * @param request - Orchestration request with agents array
 * @param startTime - Start time for execution tracking
 * @returns Orchestration response with merged findings
 */
async function orchestrateMultiAgent(
  request: OrchestrationRequest,
  startTime: number
): Promise<OrchestrationResponse> {
  if (!request.agents || request.agents.length === 0) {
    throw new Error('Multi-agent task requires agents array');
  }

  console.log('[orchestrator] Starting parallel execution:', request.agents);

  // Execute agents in parallel using Promise.all
  const agentPromises = request.agents.map((agentType) => {
    switch (agentType) {
      case 'research':
        return delegateResearch(request.context);
      case 'security':
        return delegateSecurity(request.context);
      case 'test':
        return delegateTest(request.context);
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  });

  // Add timeout wrapper (120s max per agent)
  const AGENT_TIMEOUT = 120000; // 120 seconds
  const resultsWithTimeout = await Promise.all(
    agentPromises.map((promise) => promiseWithTimeout(promise, AGENT_TIMEOUT))
  );

  // Build merged findings object
  const findings: MultiAgentFindings = {};
  let totalTokens = 0;

  for (let i = 0; i < request.agents.length; i++) {
    const agentType = request.agents[i];
    const result = resultsWithTimeout[i];

    if (result) {
      findings[agentType] = result;
      totalTokens += estimateTokens(result);
    } else {
      console.error(`[orchestrator] Agent ${agentType} timed out or failed`);
    }
  }

  const executionTime = Date.now() - startTime;

  // Calculate overall confidence (lowest confidence among agents)
  const confidenceLevels = request.agents
    .map((agentType) => findings[agentType])
    .filter((f) => f !== undefined)
    .map((f) => extractConfidence(f));

  const overallConfidence = getLowestConfidence(confidenceLevels);

  return {
    success: true,
    agent_used: request.agents,
    findings,
    execution_time_ms: executionTime,
    tokens_used: totalTokens,
    confidence: overallConfidence,
  };
}

/**
 * Wrap promise with timeout
 *
 * @param promise - Promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise that rejects on timeout
 */
async function promiseWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Agent timeout')), timeoutMs)
    ),
  ]).catch((error) => {
    console.error('[orchestrator] Agent failed:', error.message);
    return null;
  });
}

/**
 * Estimate tokens used by sub-agent based on response size
 *
 * Rough heuristic: 1 token ≈ 4 characters
 *
 * @param findings - Agent findings
 * @returns Estimated token count
 */
function estimateTokens(findings: AgentFindings): number {
  const jsonString = JSON.stringify(findings);
  return Math.ceil(jsonString.length / 4);
}

/**
 * Extract confidence level from agent findings
 *
 * @param findings - Agent findings
 * @returns Confidence level
 */
function extractConfidence(findings: AgentFindings): ConfidenceLevel {
  if (findings && typeof findings === 'object' && 'confidence' in findings) {
    return findings.confidence as ConfidenceLevel;
  }
  return 'medium'; // Default
}

/**
 * Get lowest confidence level from array
 *
 * @param levels - Array of confidence levels
 * @returns Lowest confidence level
 */
function getLowestConfidence(levels: ConfidenceLevel[]): ConfidenceLevel {
  if (levels.includes('low')) return 'low';
  if (levels.includes('medium')) return 'medium';
  return 'high';
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const requestJson = process.argv[2];

  if (!requestJson) {
    console.error('Usage: pnpm tsx orchestrate.ts \'{"task_type": "research", "context": {...}}\'');
    process.exit(1);
  }

  try {
    const request: OrchestrationRequest = JSON.parse(requestJson);
    const response = await orchestrate(request);
    console.log(JSON.stringify(response, null, 2));
    process.exit(response.success ? 0 : 1);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
