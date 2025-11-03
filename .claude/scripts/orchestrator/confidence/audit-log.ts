import { access, appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { sanitizeReasoning, truncateForLog } from './sanitize';
import type { RecommendationLog } from './types';

/**
 * Path to audit log file (JSON Lines format)
 */
const LOG_FILE_PATH = join(process.cwd(), '.claude', 'logs', 'recommendations.jsonl');

/**
 * Append a recommendation decision to the audit log file.
 *
 * The decision's `reasoning` field is sanitized and truncated before being recorded; if writing to the log file fails, the function logs an error and prints the decision to stdout instead.
 *
 * @param decision - The recommendation entry to persist (will be written as a JSON Lines record with a sanitized/truncated `reasoning`)
 */
export async function logRecommendation(decision: RecommendationLog): Promise<void> {
  try {
    // Sanitize reasoning before logging
    const sanitizedDecision: RecommendationLog = {
      ...decision,
      reasoning: truncateForLog(sanitizeReasoning(decision.reasoning), 100),
    };

    // Convert to JSON Line format
    const logLine = JSON.stringify(sanitizedDecision) + '\n';

    // Append to log file
    await appendFile(LOG_FILE_PATH, logLine, 'utf-8');
  } catch (error) {
    // Graceful degradation - log to console if file write fails
    console.error('Failed to write audit log:', error);
    console.log('Decision (not persisted):', decision);
  }
}

/**
 * Build a RecommendationLog object from the provided parameters.
 *
 * The resulting log includes a current ISO timestamp and all supplied fields;
 * the `accepted` field is set to `true` when `recommended` equals `userChoice`.
 *
 * @param params - Object containing values used to populate the log entry
 * @returns A RecommendationLog containing `timestamp`, the provided fields, and `accepted`
 */
export function createRecommendationLog(params: {
  sessionId: string;
  featureName: string;
  confidence: number;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  recommended: string;
  userChoice: string;
  researchTriggered: boolean;
  techStack: string[];
  reasoning: string;
}): RecommendationLog {
  return {
    timestamp: new Date().toISOString(),
    sessionId: params.sessionId,
    featureName: params.featureName,
    confidence: params.confidence,
    confidenceLevel: params.confidenceLevel,
    recommended: params.recommended,
    userChoice: params.userChoice,
    accepted: params.recommended === params.userChoice,
    researchTriggered: params.researchTriggered,
    techStack: params.techStack,
    reasoning: params.reasoning,
  };
}

/**
 * Determines whether the audit log file exists and is accessible.
 *
 * @returns `true` if the audit log file is accessible, `false` otherwise.
 */
export async function auditLogExists(): Promise<boolean> {
  try {
    await access(LOG_FILE_PATH);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generates a unique session identifier for tracking.
 *
 * The identifier includes a `session_` prefix, the current timestamp, and a short random base-36 suffix.
 *
 * @returns A session identifier string in the form `session_<timestamp>_<random>`
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
