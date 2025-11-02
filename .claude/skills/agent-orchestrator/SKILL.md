# Agent Orchestrator Skill

## Purpose

Centralized orchestration for delegating exploration and research tasks to Haiku-based sub-agents, enabling 50%+ token reduction and 56%+ cost savings per workflow.

## When to Use

- **Before `/spec:plan`**: Delegate codebase exploration and security analysis
- **Before `/spec:specify`**: Find similar implementations and patterns
- **Before `/spec:tasks`**: Analyze dependencies and task ordering
- **Before `/code`**: Run security pre-checks

## Usage

```bash
pnpm skill:run agent-orchestrator orchestrate '{
  "task_type": "research",
  "context": {
    "query": "How does authentication work?",
    "focus_areas": ["auth", "session"],
    "depth": "deep"
  }
}'
```

## Response Format

Returns structured JSON with findings from sub-agents:

```json
{
  "success": true,
  "agent_used": "research",
  "findings": { ... },
  "tokens_used": 48000,
  "confidence": "high"
}
```

## Available Agents

- **research**: Codebase exploration, pattern discovery, external documentation
- **security**: Vulnerability scanning, RLS gap analysis, security recommendations
- **test**: Test generation (stub for future integration)

## Parallel Execution

Use `task_type: "multi"` to run multiple agents in parallel:

```json
{
  "task_type": "multi",
  "agents": ["research", "security"],
  "context": { ... }
}
```

## Fallback

Falls back to main agent if delegation fails. Check `response.success` before using findings.
