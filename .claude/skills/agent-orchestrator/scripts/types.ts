/**
 * Type definitions for Agent Orchestrator Skill
 *
 * These types define the contracts between the orchestrator and sub-agents,
 * enabling structured JSON communication and validation.
 */

/**
 * Task type for orchestration request
 */
export type TaskType = 'research' | 'security' | 'test' | 'multi';

/**
 * Agent identifier for delegation
 */
export type AgentType = 'research' | 'security' | 'test';

/**
 * Research depth level
 */
export type ResearchDepth = 'shallow' | 'deep';

/**
 * Confidence level for agent responses
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Severity level for security issues
 */
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * Orchestration context passed to sub-agents
 */
export interface OrchestrationContext {
  /** The query or task description */
  query: string;
  /** Specific areas to focus on (e.g., ["auth", "payments"]) */
  focus_areas?: string[];
  /** Depth of research to perform */
  depth?: ResearchDepth;
  /** Whether to include external documentation (Context7, web search) */
  include_external?: boolean;
}

/**
 * Orchestration request sent to the orchestrator
 */
export interface OrchestrationRequest {
  /** Type of task to orchestrate */
  task_type: TaskType;
  /** Context for the task */
  context: OrchestrationContext;
  /** Agents to invoke (required for task_type: "multi") */
  agents?: AgentType[];
}

/**
 * Orchestration response returned by the orchestrator
 */
export interface OrchestrationResponse {
  /** Whether orchestration succeeded */
  success: boolean;
  /** Agent(s) used for the task */
  agent_used: string | string[];
  /** Findings from the sub-agent(s) */
  findings: ResearchResponse | SecurityResponse | TestResponse | MultiAgentFindings;
  /** Execution time in milliseconds */
  execution_time_ms: number;
  /** Total tokens used by sub-agents */
  tokens_used: number;
  /** Overall confidence level */
  confidence: ConfidenceLevel;
  /** Error message if orchestration failed */
  error?: string;
  /** Fallback message if delegation failed */
  fallback?: string;
}

/**
 * Finding from research agent
 */
export interface ResearchFinding {
  /** The finding description */
  finding: string;
  /** Source of the finding */
  source: 'internal' | 'external';
  /** File path or URL where finding was located */
  location: string;
  /** Optional reference (e.g., line number, documentation URL) */
  reference?: string;
}

/**
 * Code location reference
 */
export interface CodeLocation {
  /** File path */
  file: string;
  /** Line number */
  line: number;
  /** Purpose or description of the code */
  purpose: string;
}

/**
 * External library reference
 */
export interface ExternalReference {
  /** Library name */
  library: string;
  /** Topic or feature */
  topic: string;
  /** Documentation URL */
  url: string;
}

/**
 * Recommendation from an agent
 */
export interface Recommendation {
  /** Recommended action */
  action: string;
  /** Rationale for the recommendation */
  rationale: string;
}

/**
 * Research Agent response schema
 */
export interface ResearchResponse {
  /** Key findings from the research */
  key_findings: ResearchFinding[];
  /** Architecture patterns discovered */
  architecture_patterns: string[];
  /** Recommendations based on research */
  recommendations: Recommendation[];
  /** Code locations relevant to the query */
  code_locations: CodeLocation[];
  /** External library references */
  external_references: ExternalReference[];
  /** Research depth performed */
  research_depth: ResearchDepth;
  /** Confidence in the research findings */
  confidence: ConfidenceLevel;
}

/**
 * Security vulnerability finding
 */
export interface SecurityVulnerability {
  /** Severity level */
  severity: SeverityLevel;
  /** Description of the vulnerability */
  description: string;
  /** File path or location */
  location: string;
  /** Recommendation to fix the vulnerability */
  recommendation: string;
}

/**
 * Security Scanner response schema
 */
export interface SecurityResponse {
  /** Identified vulnerabilities */
  vulnerabilities: SecurityVulnerability[];
  /** Row-Level Security (RLS) gaps identified */
  rls_gaps: string[];
  /** Security recommendations */
  recommendations: string[];
  /** Confidence in the security analysis */
  confidence: ConfidenceLevel;
}

/**
 * Test case structure for generated tests
 */
export interface TestCase {
  /** Test name or description */
  name: string;
  /** Test file path */
  file_path: string;
  /** Test type (unit, integration, e2e, etc.) */
  type: string;
}

/**
 * Test Generator response schema (stub for future implementation)
 */
export interface TestResponse {
  /** Whether test generation succeeded */
  success: boolean;
  /** Message about test generation status */
  message: string;
  /** Generated test cases (future) */
  test_cases?: TestCase[];
}

/**
 * Findings from multiple agents (parallel execution)
 */
export interface MultiAgentFindings {
  /** Research findings (if research agent was used) */
  research?: ResearchResponse;
  /** Security findings (if security agent was used) */
  security?: SecurityResponse;
  /** Test findings (if test agent was used) */
  test?: TestResponse;
}

/**
 * Type guard for ResearchResponse
 */
export function isResearchResponse(obj: unknown): obj is ResearchResponse {
  if (!obj || typeof obj !== 'object') return false;
  const data = obj as Record<string, unknown>;
  return (
    Array.isArray(data.key_findings) &&
    Array.isArray(data.architecture_patterns) &&
    Array.isArray(data.recommendations) &&
    Array.isArray(data.code_locations) &&
    Array.isArray(data.external_references) &&
    (data.research_depth === 'shallow' || data.research_depth === 'deep') &&
    (data.confidence === 'high' || data.confidence === 'medium' || data.confidence === 'low')
  );
}

/**
 * Type guard for SecurityResponse
 */
export function isSecurityResponse(obj: unknown): obj is SecurityResponse {
  if (!obj || typeof obj !== 'object') return false;
  const data = obj as Record<string, unknown>;
  return (
    Array.isArray(data.vulnerabilities) &&
    Array.isArray(data.rls_gaps) &&
    Array.isArray(data.recommendations) &&
    (data.confidence === 'high' || data.confidence === 'medium' || data.confidence === 'low')
  );
}

/**
 * Type guard for TestResponse
 */
export function isTestResponse(obj: unknown): obj is TestResponse {
  if (!obj || typeof obj !== 'object') return false;
  const data = obj as Record<string, unknown>;
  return typeof data.success === 'boolean' && typeof data.message === 'string';
}
