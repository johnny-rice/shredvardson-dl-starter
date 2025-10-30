/**
 * Shared type definitions for sub-agent delegation framework
 */

export interface ResearchAgentOutput {
  key_findings: Array<{
    finding: string;
    source: 'internal' | 'external';
    location: string;
    reference?: string;
  }>;
  architecture_patterns: string[];
  recommendations: Array<{
    action: string;
    rationale: string;
  }>;
  code_locations: Array<{
    file: string;
    line: number;
    purpose: string;
  }>;
  external_references: Array<{
    library: string;
    topic: string;
    url: string;
  }>;
  research_depth: 'shallow' | 'deep';
  confidence: 'high' | 'medium' | 'low';
}
