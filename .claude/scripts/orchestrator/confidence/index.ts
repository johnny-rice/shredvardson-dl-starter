/**
 * Confidence calculation and auto-research utilities for Socratic planning
 *
 * This module provides:
 * - Confidence calculation based on research depth, tech stack, architecture, and recency
 * - Tech stack detection from package.json and ADRs
 * - Auto-research triggers using Context7 and WebSearch MCP tools
 * - Rate limiting for auto-research
 * - Input sanitization for security
 * - Audit logging for recommendation decisions
 */

// Audit logging
export {
  auditLogExists,
  createRecommendationLog,
  generateSessionId,
  logRecommendation,
} from './audit-log';
export { shouldTriggerAutoResearch, triggerAutoResearch } from './auto-research';
// Core utilities
export { calculateConfidence, isSufficientConfidence } from './calculate-confidence';
export { clearTechStackCache, detectTechStack, determineTechStackMatch } from './detect-tech-stack';

// Rate limiting
export {
  checkRateLimit,
  clearAllRateLimits,
  enforceRateLimit,
  getRateLimitCount,
  getRateLimitErrorMessage,
  incrementRateLimit,
  resetRateLimit,
} from './rate-limit';
// Security utilities
export {
  sanitizeExternalText,
  sanitizeReasoning,
  sanitizeTechStack,
  truncateForLog,
  validateMCPResponse,
} from './sanitize';

// Types
export type {
  AutoResearchResult,
  ConfidenceInput,
  ConfidenceLevel,
  ConfidenceResult,
  RecommendationLog,
  TechStack,
} from './types';
