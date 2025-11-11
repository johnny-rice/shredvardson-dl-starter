/**
 * JSON response parser with validation for sub-agent responses
 *
 * Provides robust parsing and validation of JSON responses from sub-agents,
 * with graceful error handling and schema validation.
 */

import {
  isResearchResponse,
  isSecurityResponse,
  isTestResponse,
  type ResearchResponse,
  type SecurityResponse,
  type TestResponse,
} from './types.js';

/**
 * Parse and validate a sub-agent JSON response
 *
 * @param jsonString - Raw JSON string from sub-agent
 * @param expectedType - Expected response type ('research', 'security', or 'test')
 * @returns Parsed and validated response object, or null if parsing/validation failed
 */
export function parseAgentResponse<T>(
  jsonString: string,
  expectedType: 'research' | 'security' | 'test'
): T | null {
  try {
    // Step 1: Parse JSON string
    const parsed = JSON.parse(jsonString);

    // Step 2: Validate schema based on expected type
    switch (expectedType) {
      case 'research':
        if (isResearchResponse(parsed)) {
          return parsed as T;
        }
        console.error('[orchestrator] Research response failed schema validation:', {
          message: 'Missing or invalid required fields',
          received: Object.keys(parsed),
        });
        return null;

      case 'security':
        if (isSecurityResponse(parsed)) {
          return parsed as T;
        }
        console.error('[orchestrator] Security response failed schema validation:', {
          message: 'Missing or invalid required fields',
          received: Object.keys(parsed),
        });
        return null;

      case 'test':
        if (isTestResponse(parsed)) {
          return parsed as T;
        }
        console.error('[orchestrator] Test response failed schema validation:', {
          message: 'Missing or invalid required fields',
          received: Object.keys(parsed),
        });
        return null;

      default:
        console.error('[orchestrator] Unknown response type:', expectedType);
        return null;
    }
  } catch (error) {
    // Step 3: Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      console.error('[orchestrator] Malformed JSON from sub-agent:', {
        message: 'Failed to parse JSON',
        error: error.message,
        preview: jsonString.substring(0, 200), // Show first 200 chars for debugging
      });
    } else {
      console.error('[orchestrator] Unexpected error during JSON parsing:', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    return null;
  }
}

/**
 * Extract JSON from a response that may contain markdown or extra text
 *
 * Looks for JSON blocks wrapped in ```json...``` or standalone {...} objects
 *
 * @param responseText - Response text that may contain JSON
 * @returns Extracted JSON string, or original text if no JSON found
 */
export function extractJSON(responseText: string): string {
  // Try to find JSON in markdown code blocks first
  const jsonCodeBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonCodeBlockMatch?.[1]) {
    return jsonCodeBlockMatch[1].trim();
  }

  // Try to find standalone JSON object
  const jsonObjectMatch = responseText.match(/(\{[\s\S]*\})/);
  if (jsonObjectMatch?.[1]) {
    return jsonObjectMatch[1].trim();
  }

  // Return original text if no JSON found
  return responseText.trim();
}

/**
 * Sanitize error message to prevent data leaks
 *
 * Removes sensitive information like file paths, tokens, or user data
 *
 * @param error - Error object or message
 * @returns Sanitized error message safe for logging/display
 */
export function sanitizeError(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;

  // Remove common sensitive patterns
  const sanitized = message
    .replace(/\/Users\/[^/]+/g, '/Users/***') // User home directories
    .replace(/\/home\/[^/]+/g, '/home/***')
    .replace(/[a-f0-9]{32,}/gi, '***TOKEN***') // Potential API keys/tokens
    .replace(/Bearer\s+[^\s]+/gi, 'Bearer ***') // Bearer tokens
    .replace(/password[=:]\s*[^\s]+/gi, 'password=***'); // Passwords

  return sanitized;
}

/**
 * Validate that required fields exist in an object
 *
 * @param obj - Object to validate
 * @param requiredFields - Array of required field names
 * @returns True if all required fields exist, false otherwise
 */
export function validateRequiredFields(obj: unknown, requiredFields: string[]): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  return requiredFields.every((field) => field in obj);
}

/**
 * Create a fallback response when sub-agent fails
 *
 * @param agentType - Type of agent that failed
 * @param error - Error message
 * @returns Fallback response object
 */
export function createFallbackResponse(
  agentType: 'research' | 'security' | 'test',
  error: string
): ResearchResponse | SecurityResponse | TestResponse {
  const sanitizedError = sanitizeError(error);

  switch (agentType) {
    case 'research':
      return {
        key_findings: [],
        architecture_patterns: [],
        recommendations: [
          {
            action: 'Manual research required',
            rationale: `Automated research failed: ${sanitizedError}`,
          },
        ],
        code_locations: [],
        external_references: [],
        research_depth: 'shallow',
        confidence: 'low',
      };

    case 'security':
      return {
        vulnerabilities: [],
        rls_gaps: [],
        recommendations: [
          `Manual security review required (automated scan failed: ${sanitizedError})`,
        ],
        confidence: 'low',
      };

    case 'test':
      return {
        success: false,
        message: `Test generation failed: ${sanitizedError}`,
      };

    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }
}
