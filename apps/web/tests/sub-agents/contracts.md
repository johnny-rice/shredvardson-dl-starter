# Sub-Agent Contracts

This document defines behavioral contracts for all sub-agents in the Claude Code system. Each contract specifies inputs, outputs, timeouts, success criteria, and validation rules.

---

## Contract 1: Research Agent

**Purpose:** Deep codebase exploration with isolated context burning.

### Input Structure

```typescript
{
  query: string;              // Natural language research query
  focus_areas?: string[];     // Optional specific areas to focus on
  max_files?: number;         // Optional file limit (default: 50)
}
```

**Example:**

```json
{
  "query": "How does authentication work in this app?",
  "focus_areas": ["auth", "session", "login"],
  "max_files": 30
}
```

### Output Structure

```typescript
{
  key_findings: string[];           // 3-5 bullet points with file:line references
  architecture_patterns: string[];  // Identified patterns (e.g., "Repository pattern")
  recommendations: string[];        // Actionable next steps
  code_locations: CodeLocation[];   // Relevant files and line numbers
  confidence: 'high' | 'medium' | 'low';
}

interface CodeLocation {
  file: string;
  line?: number;
  purpose: string;
}
```

**Example:**

```json
{
  "key_findings": [
    "Auth handled by NextAuth.js in apps/web/src/lib/auth.ts:15",
    "Session stored in Supabase with RLS policies",
    "JWT tokens managed by middleware in apps/web/src/middleware.ts:42"
  ],
  "architecture_patterns": [
    "NextAuth.js provider pattern with custom adapters",
    "Supabase Row-Level Security for data isolation"
  ],
  "recommendations": [
    "Consider adding refresh token rotation",
    "Document session lifecycle in ADR"
  ],
  "code_locations": [
    {
      "file": "apps/web/src/lib/auth.ts",
      "line": 15,
      "purpose": "NextAuth configuration"
    }
  ],
  "confidence": "high"
}
```

### Constraints

- **Token Limit:** Output must be <5K tokens
- **Timeout:** 60 seconds
- **Tools:** Read, Glob, Grep, Bash (read-only commands only)

### Success Criteria

- [ ] All required output fields present
- [ ] At least 3 key findings with file references
- [ ] Output size <5K tokens
- [ ] Completes within 60 seconds
- [ ] File references are valid (files exist)

### Failure Modes

- **Query too broad:** Return partial findings + suggestion to narrow scope
- **No matches found:** Return empty findings + suggestions for alternative queries
- **Timeout:** Return partial findings + indication of incomplete research

---

## Contract 2: Security Scanner

**Purpose:** Identify security vulnerabilities, RLS policy gaps, and OWASP Top 10 issues.

### Input Structure

```typescript
{
  scan_type: 'rls' | 'owasp' | 'full';
  targets?: string[];           // Specific files/dirs to scan
  severity_threshold?: 'critical' | 'high' | 'medium' | 'low';
}
```

**Example:**

```json
{
  "scan_type": "full",
  "targets": ["apps/web/src/**/*.ts", "packages/db/**/*.sql"],
  "severity_threshold": "medium"
}
```

### Output Structure

```typescript
{
  findings: SecurityFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
  scan_coverage: string;  // e.g., "80% of codebase scanned"
}

interface SecurityFinding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;  // e.g., "SQL Injection", "Missing RLS Policy"
  file: string;
  line?: number;
  description: string;
  remediation: string;
  cwe_id?: string;  // Common Weakness Enumeration ID
}
```

**Example:**

```json
{
  "findings": [
    {
      "severity": "high",
      "category": "Missing RLS Policy",
      "file": "packages/db/migrations/20250101_users.sql",
      "line": 15,
      "description": "Table 'user_profiles' has no RLS policies defined",
      "remediation": "Add RLS policies to restrict access to own profile only",
      "cwe_id": "CWE-285"
    }
  ],
  "summary": {
    "critical": 0,
    "high": 1,
    "medium": 3,
    "low": 5
  },
  "recommendations": [
    "Enable RLS on all tables with user data",
    "Add input validation for all API endpoints"
  ],
  "scan_coverage": "85% of codebase scanned"
}
```

### Constraints

- **Token Limit:** Output must be <5K tokens
- **Timeout:** 90 seconds
- **Tools:** Read, Glob, Grep
- **Focus:** False positive rate <10%

### Success Criteria

- [ ] All required output fields present
- [ ] Findings include file references
- [ ] Severity levels assigned correctly
- [ ] Remediation steps are actionable
- [ ] Output size <5K tokens
- [ ] Completes within 90 seconds

### Failure Modes

- **No issues found:** Return empty findings + confirmation of security posture
- **Too many findings:** Prioritize by severity, return top 20
- **Timeout:** Return partial findings + indication of incomplete scan

---

## Contract 3: Test Generator

**Purpose:** Generate unit, E2E, or integration tests with high coverage.

### Input Structure

```typescript
{
  target: {
    type: 'file' | 'function' | 'component' | 'api' | 'feature';
    path: string;
    name?: string;
  };
  test_types: ('unit' | 'integration' | 'e2e')[];
  coverage_goal?: number;     // Target coverage % (default: 70)
  focus_areas?: ('happy_path' | 'edge_cases' | 'error_handling')[];
}
```

**Example:**

```json
{
  "target": {
    "type": "component",
    "path": "packages/ui/src/components/ui/button.tsx"
  },
  "test_types": ["unit"],
  "coverage_goal": 90,
  "focus_areas": ["happy_path", "edge_cases", "error_handling"]
}
```

### Output Structure

```typescript
{
  test_file_path: string;
  test_code: string;
  coverage_analysis: {
    estimated_coverage: number;
    covered_scenarios: string[];
    uncovered_scenarios: string[];
  };
  dependencies: string[];
  setup_required: string[];
  confidence: 'high' | 'medium' | 'low';
}
```

**Example:**

```json
{
  "test_file_path": "packages/ui/src/components/ui/button.test.tsx",
  "test_code": "import { render, screen } from '@testing-library/react';\nimport { Button } from './button';\n\ndescribe('Button', () => {\n  it('renders with default variant', () => {\n    render(<Button>Click me</Button>);\n    expect(screen.getByRole('button')).toBeInTheDocument();\n  });\n  // ... 7 more tests\n});",
  "coverage_analysis": {
    "estimated_coverage": 92,
    "covered_scenarios": [
      "renders with default variant",
      "handles click events",
      "applies disabled state correctly"
    ],
    "uncovered_scenarios": ["Loading state with spinner"]
  },
  "dependencies": ["@testing-library/react", "@testing-library/user-event"],
  "setup_required": [],
  "confidence": "high"
}
```

### Constraints

- **Token Limit:** Output must be <5K tokens
- **Timeout:** 60 seconds
- **Tools:** Read, Glob, Grep, Write (for test files)
- **Quality:** Tests must be executable (valid syntax)

### Success Criteria

- [ ] All required output fields present
- [ ] Generated tests are syntactically valid
- [ ] Test cases cover happy path + edge cases
- [ ] Dependencies list is complete
- [ ] Output size <5K tokens
- [ ] Completes within 60 seconds

### Failure Modes

- **Target too complex:** Generate skeleton tests + TODOs for manual completion
- **Unknown framework:** Request clarification or use default (Vitest)
- **Timeout:** Return partial tests + indication of incomplete generation

---

## Contract 4: Refactor Analyzer

**Purpose:** Identify code quality issues, complexity hotspots, and refactoring opportunities.

### Input Structure

```typescript
{
  targets: string[];                // Files or dirs to analyze
  focus?: 'complexity' | 'coupling' | 'duplication' | 'all';
  priority_threshold?: 'critical' | 'high' | 'medium';
}
```

**Example:**

```json
{
  "targets": ["apps/web/src/lib/**/*.ts"],
  "focus": "all",
  "priority_threshold": "high"
}
```

### Output Structure

```typescript
{
  opportunities: RefactorOpportunity[];
  code_smells: CodeSmell[];
  metrics: {
    avg_complexity: number;
    high_coupling_count: number;
    duplication_percentage: number;
  };
  priority_order: string[];  // Ordered list of files to refactor first
}

interface RefactorOpportunity {
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: string;  // e.g., "High complexity", "Tight coupling"
  file: string;
  line?: number;
  issue: string;
  suggestion: string;
  estimated_effort: 'small' | 'medium' | 'large';
}

interface CodeSmell {
  smell: string;  // e.g., "Long method", "God class"
  file: string;
  line?: number;
  severity: number;  // 1-10
}
```

**Example:**

```json
{
  "opportunities": [
    {
      "priority": "high",
      "type": "High complexity",
      "file": "apps/web/src/lib/analytics.ts",
      "line": 45,
      "issue": "Function has cyclomatic complexity of 15",
      "suggestion": "Extract conditional logic into separate functions",
      "estimated_effort": "medium"
    }
  ],
  "code_smells": [
    {
      "smell": "Long method",
      "file": "apps/web/src/lib/analytics.ts",
      "line": 45,
      "severity": 7
    }
  ],
  "metrics": {
    "avg_complexity": 4.2,
    "high_coupling_count": 3,
    "duplication_percentage": 8.5
  },
  "priority_order": ["apps/web/src/lib/analytics.ts", "apps/web/src/lib/db.ts"]
}
```

### Constraints

- **Token Limit:** Output must be <5K tokens
- **Timeout:** 60 seconds
- **Tools:** Read, Glob, Grep

### Success Criteria

- [ ] All required output fields present
- [ ] Opportunities are prioritized correctly
- [ ] Suggestions are actionable
- [ ] Metrics are calculated accurately
- [ ] Output size <5K tokens
- [ ] Completes within 60 seconds

### Failure Modes

- **No issues found:** Return metrics + confirmation of code quality
- **Too many opportunities:** Return top 10 by priority
- **Timeout:** Return partial analysis + indication of incomplete scan

---

## Contract 5: Documentation Writer

**Purpose:** Generate JSDoc, README, ADR, API documentation with examples.

### Input Structure

```typescript
{
  doc_type: 'jsdoc' | 'readme' | 'adr' | 'api';
  targets: string[];       // Files or components to document
  style?: 'concise' | 'detailed';
  include_examples?: boolean;
}
```

**Example:**

```json
{
  "doc_type": "jsdoc",
  "targets": ["packages/ui/src/components/ui/button.tsx"],
  "style": "detailed",
  "include_examples": true
}
```

### Output Structure

```typescript
{
  documentation: Documentation[];
  preview: string;  // First 500 chars of generated docs
}

interface Documentation {
  file_path: string;     // Where to write/insert docs
  content: string;       // Full documentation content
  doc_type: string;      // Type of documentation
  insertion_strategy?: string;  // e.g., "Replace lines 1-10", "Insert before line 15"
}
```

**Example:**

```json
{
  "documentation": [
    {
      "file_path": "packages/ui/src/components/ui/button.tsx",
      "content": "/**\n * Button component with multiple variants...\n */",
      "doc_type": "jsdoc",
      "insertion_strategy": "Insert before line 15"
    }
  ],
  "preview": "/**\n * Button component with multiple variants and sizes.\n * Supports primary, secondary, outline, and ghost variants..."
}
```

### Constraints

- **Token Limit:** Output must be <5K tokens
- **Timeout:** 60 seconds
- **Tools:** Read, Glob, Grep
- **Quality:** Follow standard documentation conventions

### Success Criteria

- [ ] All required output fields present
- [ ] Documentation follows style conventions
- [ ] Examples are included (if requested)
- [ ] Insertion strategy is clear
- [ ] Output size <5K tokens
- [ ] Completes within 60 seconds

### Failure Modes

- **Target too complex:** Generate skeleton docs + TODOs for manual completion
- **Unknown doc type:** Request clarification or use default (jsdoc)
- **Timeout:** Return partial docs + indication of incomplete generation

---

## Validation Rules (All Agents)

### General Rules

1. **Output Size:** All agent outputs must be <5K tokens (approximately 3,750 words)
2. **Timeout:** Agents must respect their timeout limits or return partial results
3. **Error Handling:** Agents must return structured errors, not exceptions
4. **File References:** All file paths must be relative to project root
5. **JSON Compliance:** Outputs must be valid JSON (if structured) or valid Markdown

### Validation Script

A validation script (`scripts/validate-sub-agent-contracts.ts`) will:

- [ ] Parse each agent's output
- [ ] Check token count (<5K)
- [ ] Verify required fields present
- [ ] Validate file references exist
- [ ] Measure execution time
- [ ] Report compliance rate

### Success Thresholds

- **Task Success Rate:** ≥90% of delegations complete successfully
- **Token Compliance:** ≥95% of outputs are <5K tokens
- **Timeout Compliance:** ≥95% of tasks complete within timeout
- **Quality Score:** ≥85% user satisfaction (manual review)

---

## Testing Strategy

### Test Layers

1. **Contract Tests:** Validate each agent against its contract
2. **Integration Tests:** Test delegation framework and parallel execution
3. **E2E Tests:** Test commands with actual agent delegation

### Test Files

- `tests/sub-agents/contracts.test.ts` - Contract validation for each agent
- `tests/sub-agents/delegation.test.ts` - Integration tests for delegation framework
- `tests/sub-agents/e2e.spec.ts` - End-to-end command tests

---

## Rollback Strategy

If quality degrades below thresholds:

1. **Monitor:** Track success rate, token usage, and user feedback
2. **Alert:** If success rate <85%, trigger alert
3. **Fallback:** Set `DISABLE_DELEGATION=true` to revert to Sonnet-only
4. **Investigate:** Review failed tasks, adjust agent prompts
5. **Re-test:** Validate improvements with A/B testing

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
