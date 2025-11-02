/**
 * Security Scanner delegation script
 *
 * Invokes the Security Scanner via Task tool with correct prompt format,
 * parses the JSON response, and returns structured security findings.
 */

import { createFallbackResponse, extractJSON, parseAgentResponse } from './parse-response.js';
import type { OrchestrationContext, SecurityResponse } from './types.js';

/**
 * Delegate security scan to Security Scanner
 *
 * @param context - Orchestration context with query and focus areas
 * @returns Security findings or fallback response if delegation failed
 */
export async function delegateSecurity(context: OrchestrationContext): Promise<SecurityResponse> {
  const startTime = Date.now();

  try {
    // Build prompt for Security Scanner
    const prompt = buildSecurityPrompt(context);

    console.log('[orchestrator] Delegating to Security Scanner:', {
      query: context.query,
      focus_areas: context.focus_areas,
    });

    // Invoke Security Scanner via Task tool
    // Note: This is a placeholder - actual Task tool invocation would be done
    // by the main agent when this script is called from a workflow command
    const agentResponse = await invokeSecurityAgent(prompt);

    // Extract JSON from response (handles markdown or extra text)
    const jsonString = extractJSON(agentResponse);

    // Parse and validate JSON response
    const parsed = parseAgentResponse<SecurityResponse>(jsonString, 'security');

    if (parsed) {
      const executionTime = Date.now() - startTime;
      console.log('[orchestrator] Security Scanner succeeded:', {
        execution_time_ms: executionTime,
        vulnerabilities_count: parsed.vulnerabilities.length,
        rls_gaps_count: parsed.rls_gaps.length,
        confidence: parsed.confidence,
      });
      return parsed;
    } else {
      // Parsing failed, return fallback
      console.error('[orchestrator] Security Scanner returned invalid JSON');
      return createFallbackResponse('security', 'Invalid JSON response from Security Scanner');
    }
  } catch (error) {
    // Delegation failed, return fallback
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[orchestrator] Security Scanner delegation failed:', errorMessage);
    return createFallbackResponse('security', errorMessage);
  }
}

/**
 * Build prompt for Security Scanner
 *
 * @param context - Orchestration context
 * @returns Prompt string for Security Scanner
 */
function buildSecurityPrompt(context: OrchestrationContext): string {
  const { query, focus_areas } = context;

  let prompt = `${query}\n\n`;

  if (focus_areas && focus_areas.length > 0) {
    prompt += `**Focus Areas:**\n${focus_areas.map((area) => `- ${area}`).join('\n')}\n\n`;
  }

  prompt += '**Security Analysis Scope:**\n';
  prompt += '- RLS (Row-Level Security) policy gaps\n';
  prompt += '- Authentication and authorization vulnerabilities\n';
  prompt += '- Input validation and injection risks\n';
  prompt += '- Data exposure and privacy issues\n';
  prompt += '- API security weaknesses\n\n';

  prompt +=
    '**Response Format:** Return findings as structured JSON matching the SecurityResponse schema.\n';
  prompt += 'Include vulnerabilities (with severity levels), rls_gaps, and recommendations.\n';

  return prompt;
}

/**
 * Invoke Security Scanner via Task tool
 *
 * This is a placeholder that would be implemented by the calling workflow command.
 * The actual Task tool invocation happens in the main agent context.
 *
 * @param prompt - Prompt for Security Scanner
 * @returns JSON response from Security Scanner
 */
async function invokeSecurityAgent(prompt: string): Promise<string> {
  // Placeholder: In actual implementation, the workflow command would invoke:
  //
  // Task tool with:
  // - subagent_type: "security-scanner"
  // - description: "Scan for security vulnerabilities"
  // - prompt: prompt
  //
  // This script runs AFTER the Task tool returns, to parse the response.
  // For now, return a mock response for testing.

  throw new Error(
    'invokeSecurityAgent must be called from workflow command context with Task tool access'
  );
}

/**
 * Filter critical/high severity vulnerabilities
 *
 * @param response - Security response
 * @returns Array of critical and high severity vulnerabilities
 */
export function getCriticalVulnerabilities(response: SecurityResponse) {
  return response.vulnerabilities.filter((v) => v.severity === 'critical' || v.severity === 'high');
}

/**
 * Check if there are blocking security issues (critical vulnerabilities)
 *
 * @param response - Security response
 * @returns True if critical vulnerabilities found
 */
export function hasBlockingIssues(response: SecurityResponse): boolean {
  return response.vulnerabilities.some((v) => v.severity === 'critical');
}

/**
 * Format security issues for display
 *
 * @param response - Security response
 * @returns Formatted string with security issues
 */
export function formatSecurityIssues(response: SecurityResponse): string {
  const criticalCount = response.vulnerabilities.filter((v) => v.severity === 'critical').length;
  const highCount = response.vulnerabilities.filter((v) => v.severity === 'high').length;
  const mediumCount = response.vulnerabilities.filter((v) => v.severity === 'medium').length;

  let summary = '**Security Scan Results:**\n';
  summary += `- Critical: ${criticalCount}\n`;
  summary += `- High: ${highCount}\n`;
  summary += `- Medium: ${mediumCount}\n`;
  summary += `- RLS Gaps: ${response.rls_gaps.length}\n`;

  return summary;
}
