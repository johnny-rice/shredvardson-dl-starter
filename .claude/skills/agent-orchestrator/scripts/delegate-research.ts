/**
 * Research Agent delegation script
 *
 * Invokes the Research Agent via Task tool with correct prompt format,
 * parses the JSON response, and returns structured findings.
 */

import { createFallbackResponse, extractJSON, parseAgentResponse } from './parse-response.js';
import type { OrchestrationContext, ResearchResponse } from './types.js';

/**
 * Delegate research task to Research Agent
 *
 * @param context - Orchestration context with query, focus areas, and depth
 * @returns Research findings or fallback response if delegation failed
 */
export async function delegateResearch(context: OrchestrationContext): Promise<ResearchResponse> {
  const startTime = Date.now();

  try {
    // Build prompt for Research Agent
    const prompt = buildResearchPrompt(context);

    console.log('[orchestrator] Delegating to Research Agent:', {
      query: context.query,
      focus_areas: context.focus_areas,
      depth: context.depth || 'deep',
    });

    // Invoke Research Agent via Task tool
    // Note: This is a placeholder - actual Task tool invocation would be done
    // by the main agent when this script is called from a workflow command
    const agentResponse = await invokeResearchAgent(prompt);

    // Extract JSON from response (handles markdown or extra text)
    const jsonString = extractJSON(agentResponse);

    // Parse and validate JSON response
    const parsed = parseAgentResponse<ResearchResponse>(jsonString, 'research');

    if (parsed) {
      const executionTime = Date.now() - startTime;
      console.log('[orchestrator] Research Agent succeeded:', {
        execution_time_ms: executionTime,
        findings_count: parsed.key_findings.length,
        confidence: parsed.confidence,
      });
      return parsed;
    } else {
      // Parsing failed, return fallback
      console.error('[orchestrator] Research Agent returned invalid JSON');
      return createFallbackResponse('research', 'Invalid JSON response from Research Agent');
    }
  } catch (error) {
    // Delegation failed, return fallback
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[orchestrator] Research Agent delegation failed:', errorMessage);
    return createFallbackResponse('research', errorMessage);
  }
}

/**
 * Build prompt for Research Agent
 *
 * @param context - Orchestration context
 * @returns Prompt string for Research Agent
 */
function buildResearchPrompt(context: OrchestrationContext): string {
  const { query, focus_areas, depth, include_external } = context;

  let prompt = `${query}\n\n`;

  if (focus_areas && focus_areas.length > 0) {
    prompt += `**Focus Areas:**\n${focus_areas.map((area) => `- ${area}`).join('\n')}\n\n`;
  }

  if (depth) {
    prompt += `**Research Depth:** ${depth}\n\n`;
  }

  if (include_external) {
    prompt += '**Include External Documentation:** Yes (use Context7 and web search)\n\n';
  }

  prompt +=
    '**Response Format:** Return findings as structured JSON matching the ResearchResponse schema.\n';
  prompt +=
    'Include key_findings, architecture_patterns, recommendations, code_locations, and external_references.\n';

  return prompt;
}

/**
 * Invoke Research Agent via Task tool
 *
 * This is a placeholder that would be implemented by the calling workflow command.
 * The actual Task tool invocation happens in the main agent context.
 *
 * @param prompt - Prompt for Research Agent
 * @returns JSON response from Research Agent
 */
async function invokeResearchAgent(prompt: string): Promise<string> {
  // Placeholder: In actual implementation, the workflow command would invoke:
  //
  // Task tool with:
  // - subagent_type: "research-agent"
  // - description: "Research codebase patterns"
  // - prompt: prompt
  //
  // This script runs AFTER the Task tool returns, to parse the response.
  // For now, return a mock response for testing.

  throw new Error(
    'invokeResearchAgent must be called from workflow command context with Task tool access'
  );
}

/**
 * Extract key findings from Research Agent response for quick summary
 *
 * @param response - Research response
 * @returns Array of finding descriptions
 */
export function extractKeyFindings(response: ResearchResponse): string[] {
  return response.key_findings.map((f) => f.finding);
}

/**
 * Extract code locations from Research Agent response
 *
 * @param response - Research response
 * @returns Array of file:line references
 */
export function extractCodeReferences(response: ResearchResponse): string[] {
  return response.code_locations.map((loc) => `${loc.file}:${loc.line}`);
}
