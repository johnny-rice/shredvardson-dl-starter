/**
 * Confidence level types for Socratic planning recommendations
 */

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ConfidenceResult {
  percentage: number;
  level: ConfidenceLevel;
  factors: string[];
  reasoning: string;
}

export interface ConfidenceInput {
  researchDepth: 'high' | 'medium' | 'low' | null;
  techStackMatch: 'full' | 'partial' | 'generic';
  architectureSimplicity: 'simple' | 'moderate' | 'complex';
  knowledgeRecency: 'current' | 'emerging';
  contextDetails?: {
    techStack?: string[];
    researchFindings?: string[];
    optionCount?: number;
  };
}

export interface TechStack {
  libraries: string[];
  deployment: string | null;
}

export interface AutoResearchResult {
  triggered: boolean;
  newConfidence: number;
  externalRefs: string[];
  enhancedFindings?: {
    context7Results?: unknown;
    webSearchResults?: unknown;
  };
}

export interface RecommendationLog {
  timestamp: string;
  sessionId: string;
  featureName: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  recommended: string;
  userChoice: string;
  accepted: boolean;
  researchTriggered: boolean;
  techStack: string[];
  reasoning: string;
}
