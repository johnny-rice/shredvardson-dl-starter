import { z } from 'zod';
import type { ConfidenceInput, ConfidenceLevel, ConfidenceResult } from './types';

/**
 * Zod schema for confidence input validation
 */
export const ConfidenceInputSchema = z.object({
  researchDepth: z.enum(['high', 'medium', 'low']).nullable(),
  techStackMatch: z.enum(['full', 'partial', 'generic']),
  architectureSimplicity: z.enum(['simple', 'moderate', 'complex']),
  knowledgeRecency: z.enum(['current', 'emerging']),
  contextDetails: z
    .object({
      techStack: z.array(z.string()).optional(),
      researchFindings: z.array(z.string()).optional(),
      optionCount: z.number().optional(),
    })
    .optional(),
});

/**
 * Zod schema for confidence result validation
 */
export const ConfidenceResultSchema = z.object({
  percentage: z.number().min(0).max(100),
  level: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  factors: z.array(z.string()),
  reasoning: z.string().max(500),
});

/**
 * Computes a confidence assessment from the provided inputs.
 *
 * @param input - Input values describing research depth, tech stack match, architecture simplicity, knowledge recency, and optional context details used to derive the assessment
 * @returns An object containing `percentage` (0–100), `level` ("HIGH" | "MEDIUM" | "LOW"), `factors` (array of contributing factor messages), and a human-readable `reasoning` string
 */
export function calculateConfidence(input: ConfidenceInput): ConfidenceResult {
  // Validate input
  const validated = ConfidenceInputSchema.parse(input);

  const factors: string[] = [];
  let totalScore = 0;

  // 1. Research Depth (40 points)
  let researchScore = 0;
  if (validated.researchDepth === 'high') {
    researchScore = 40;
    factors.push('High confidence research findings available');
  } else if (validated.researchDepth === 'medium') {
    researchScore = 25;
    factors.push('Medium confidence research findings available');
  } else if (validated.researchDepth === 'low') {
    researchScore = 10;
    factors.push('Limited research findings available');
  } else {
    researchScore = 10;
    factors.push('No prior research conducted');
  }
  totalScore += researchScore;

  // 2. Tech Stack Match (30 points)
  let techStackScore = 0;
  if (validated.techStackMatch === 'full') {
    techStackScore = 30;
    factors.push('All options compatible with your tech stack');
  } else if (validated.techStackMatch === 'partial') {
    techStackScore = 20;
    factors.push('Some options compatible with your tech stack');
  } else {
    techStackScore = 10;
    factors.push('Generic options without stack-specific optimization');
  }
  totalScore += techStackScore;

  // 3. Architecture Simplicity (20 points)
  let simplicityScore = 0;
  if (validated.architectureSimplicity === 'simple') {
    simplicityScore = 20;
    factors.push('Well-documented, common architectural patterns');
  } else if (validated.architectureSimplicity === 'moderate') {
    simplicityScore = 12;
    factors.push('Moderately complex architecture');
  } else {
    simplicityScore = 5;
    factors.push('Complex or novel architectural approach');
  }
  totalScore += simplicityScore;

  // 4. Knowledge Recency (10 points)
  let recencyScore = 0;
  if (validated.knowledgeRecency === 'current') {
    recencyScore = 10;
    factors.push('Technologies within knowledge cutoff (pre-2025)');
  } else {
    recencyScore = 0;
    factors.push('Emerging post-2025 technologies - research recommended');
  }
  totalScore += recencyScore;

  // Map score to confidence level
  const level: ConfidenceLevel = totalScore >= 90 ? 'HIGH' : totalScore >= 70 ? 'MEDIUM' : 'LOW';

  // Generate reasoning
  const reasoning = generateReasoning(validated, totalScore, level);

  const result: ConfidenceResult = {
    percentage: totalScore,
    level,
    factors,
    reasoning,
  };

  // Validate output
  return ConfidenceResultSchema.parse(result);
}

/**
 * Builds a concise, human-readable explanation of the confidence assessment.
 *
 * Uses context details (tech stack and research findings) and the provided confidence level
 * to assemble a short reasoning statement. If the input indicates emerging technologies,
 * the reasoning includes a validation warning.
 *
 * @param input - Confidence input whose contextDetails (techStack, researchFindings, knowledgeRecency) are reflected in the reasoning
 * @param _score - Unused numeric score placeholder (kept for signature compatibility)
 * @param level - Confidence level (`'HIGH' | 'MEDIUM' | 'LOW'`) that determines the phrasing of the explanation
 * @returns A descriptive reasoning string summarizing relevant factors; the result is trimmed to at most 500 characters and uses an ellipsis if truncated
 */
function generateReasoning(input: ConfidenceInput, _score: number, level: ConfidenceLevel): string {
  const parts: string[] = [];

  // Tech stack context
  if (input.contextDetails?.techStack && input.contextDetails.techStack.length > 0) {
    const stackSummary = input.contextDetails.techStack.slice(0, 3).join(', ');
    parts.push(`Based on your ${stackSummary} stack`);
  }

  // Confidence level explanation
  if (level === 'HIGH') {
    parts.push('I have high confidence in this recommendation');
  } else if (level === 'MEDIUM') {
    parts.push('I have moderate confidence in this recommendation');
  } else {
    parts.push('I have low confidence and recommend additional research');
  }

  // Research findings
  if (input.contextDetails?.researchFindings && input.contextDetails.researchFindings.length > 0) {
    parts.push('Research findings support this approach');
  }

  // Knowledge recency warning
  if (input.knowledgeRecency === 'emerging') {
    parts.push('Note: This involves post-2025 technologies that may require additional validation');
  }

  const reasoning = parts.join('. ') + '.';

  // Truncate to 500 chars if needed
  return reasoning.length > 500 ? reasoning.substring(0, 497) + '...' : reasoning;
}

/**
 * Determines whether a confidence result meets the sufficient threshold.
 *
 * @returns `true` if `result.percentage` is greater than or equal to 90, `false` otherwise.
 */
export function isSufficientConfidence(result: ConfidenceResult): boolean {
  return result.percentage >= 90;
}
