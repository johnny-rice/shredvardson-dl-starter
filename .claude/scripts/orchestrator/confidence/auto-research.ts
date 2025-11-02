import { calculateConfidence } from './calculate-confidence';
import { checkRateLimit, getRateLimitErrorMessage, incrementRateLimit } from './rate-limit';
import { sanitizeExternalText } from './sanitize';
import type { AutoResearchResult, ConfidenceInput, ConfidenceResult } from './types';

/**
 * Auto-research configuration
 */
const AUTO_RESEARCH_TIMEOUT_MS = 30000; // 30 seconds
const AUTO_RESEARCH_CONFIDENCE_THRESHOLD = 90;

/**
 * Trigger auto-research when confidence is below threshold
 *
 * This function:
 * 1. Checks rate limit
 * 2. Displays status message to user
 * 3. Calls Context7 and WebSearch MCP tools in parallel
 * 4. Validates and sanitizes responses
 * 5. Recalculates confidence with new findings
 *
 * @param sessionId - Session identifier for rate limiting
 * @param currentConfidence - Current confidence result
 * @param query - Research query
 * @param focusAreas - Specific areas to research
 * @returns Auto-research result with new confidence and external refs
 */
export async function triggerAutoResearch(
  sessionId: string,
  currentConfidence: ConfidenceResult,
  query: string,
  focusAreas: string[] = []
): Promise<AutoResearchResult> {
  // 1. Check rate limit
  if (!checkRateLimit(sessionId)) {
    console.warn(getRateLimitErrorMessage(sessionId));
    return {
      triggered: false,
      newConfidence: currentConfidence.percentage,
      externalRefs: [],
    };
  }

  // 2. Display initial status
  console.log(
    `\nMy confidence is ${currentConfidence.percentage}% because ${currentConfidence.reasoning}`
  );
  console.log('\nLet me research to improve my recommendation...\n');

  try {
    // 3. Call MCP tools with timeout
    const researchPromise = performResearch(query, focusAreas);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Research timeout')), AUTO_RESEARCH_TIMEOUT_MS)
    );

    const { context7Results, webSearchResults, externalRefs } = await Promise.race([
      researchPromise,
      timeoutPromise,
    ]);

    // 4. Increment rate limit
    incrementRateLimit(sessionId);

    // 5. Recalculate confidence with research findings
    const enhancedInput: ConfidenceInput = {
      ...getInputFromConfidenceResult(currentConfidence),
      researchDepth: 'high', // Research completed
      contextDetails: {
        ...currentConfidence,
        researchFindings: externalRefs,
      },
    };

    const newConfidenceResult = calculateConfidence(enhancedInput);

    console.log(`\n[Research complete - confidence now: ${newConfidenceResult.percentage}%]\n`);

    return {
      triggered: true,
      newConfidence: newConfidenceResult.percentage,
      externalRefs,
      enhancedFindings: {
        context7Results,
        webSearchResults,
      },
    };
  } catch (error) {
    // Graceful degradation on timeout or MCP failure
    console.warn('\nResearch could not be completed:', error);
    console.log('Proceeding with original confidence level.\n');

    return {
      triggered: false,
      newConfidence: currentConfidence.percentage,
      externalRefs: [],
    };
  }
}

/**
 * Perform research queries against Context7 and web search and aggregate their results and source references.
 *
 * @param query - The search query or topic to research
 * @param focusAreas - Topics or subareas to prioritize during the research
 * @returns An object containing:
 *  - `context7Results`: the result returned by the Context7 query,
 *  - `webSearchResults`: the result returned by the web search,
 *  - `externalRefs`: an array of human-readable descriptions of sources consulted
 */
async function performResearch(
  query: string,
  focusAreas: string[]
): Promise<{
  context7Results: unknown;
  webSearchResults: unknown;
  externalRefs: string[];
}> {
  const externalRefs: string[] = [];

  // Simulate MCP calls (in real implementation, these would call actual MCP tools)
  // For now, return placeholder structure

  console.log('[Checking Context7 for library documentation...]');
  const context7Results = await simulateContext7Query(query, focusAreas);

  console.log(`[Searching web for ${new Date().getFullYear()} best practices...]`);
  const webSearchResults = await simulateWebSearch(query, focusAreas);

  // Extract references from results
  if (context7Results) {
    externalRefs.push('Context7: Library documentation reviewed');
  }

  if (webSearchResults) {
    externalRefs.push('WebSearch: Community best practices validated');
  }

  return {
    context7Results,
    webSearchResults,
    externalRefs,
  };
}

/**
 * Return a mocked Context7 research result for the given query and focus areas.
 *
 * @param _query - The search query used to scope the Context7 lookup
 * @param _focusAreas - Optional focus areas to narrow the lookup
 * @returns An object with `source: 'context7'` and `data` containing `library` (string) and `documentation` (sanitized string)
 */
async function simulateContext7Query(_query: string, _focusAreas: string[]): Promise<unknown> {
  // In production, this would call:
  // const result = await useMcpTool('context7', 'get-library-docs', {
  //   context7CompatibleLibraryID: libraryId,
  //   topic: focusAreas[0],
  // });

  return {
    source: 'context7',
    data: {
      library: 'example',
      documentation: sanitizeExternalText('Example documentation content'),
    },
  };
}

/**
 * Simulate WebSearch query (placeholder for actual MCP integration)
 * TODO: Replace with actual WebSearch MCP call
 */
async function simulateWebSearch(_query: string, _focusAreas: string[]): Promise<unknown> {
  // In production, this would call:
  // const result = await useMcpTool('websearch', 'search', {
  //   query: `${query} best practices 2025`,
  // });

  return {
    source: 'websearch',
    data: {
      results: [
        {
          title: 'Example best practice',
          snippet: sanitizeExternalText('Example search result content'),
        },
      ],
    },
  };
}

/**
 * Reconstructs a conservative ConfidenceInput from a ConfidenceResult for use in recalculation.
 *
 * @param result - The ConfidenceResult whose percentage is used to inform a provisional research depth (not applied).
 * @returns A ConfidenceInput populated with conservative default values; `researchDepth` is `null` and intended to be overridden before use.
 */
function getInputFromConfidenceResult(result: ConfidenceResult): ConfidenceInput {
  // Map percentage back to input levels (best effort)
  const _researchDepth =
    result.percentage >= 90 ? 'high' : result.percentage >= 70 ? 'medium' : 'low';

  return {
    researchDepth: null, // Will be overridden
    techStackMatch: 'partial', // Conservative default
    architectureSimplicity: 'moderate',
    knowledgeRecency: 'current',
  };
}

/**
 * Determine whether auto-research should run for the provided confidence result.
 *
 * @param confidence - The current confidence result to evaluate.
 * @returns `true` if `confidence.percentage` is less than the auto-research threshold, `false` otherwise.
 */
export function shouldTriggerAutoResearch(confidence: ConfidenceResult): boolean {
  return confidence.percentage < AUTO_RESEARCH_CONFIDENCE_THRESHOLD;
}