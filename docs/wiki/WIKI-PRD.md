# Product Requirements Document (Agentic PRD Template)

## 1. Overview
- **Product/Agent Name:** DLStarter AI-Assisted Development Platform
- **Version:** 1.0  
- **Status:** Approved  
- **Team:** PM, Eng Lead, Stakeholders  
- **Target Release:** Q1 2025  

## 2. Objective & Strategic Context
- **Business Problem:** Developers need a faster, safer way to build and ship features with AI assistance while maintaining code quality and security standards, but existing tools either sacrifice quality for speed or are too complex for individual developers.
- **Target Persona:** Individual developers and small teams who want AI-powered development workflows without sacrificing quality or introducing security risks.
- **Strategic Goal:** Enable developers to ship quality features 3x faster through structured AI collaboration while maintaining security and reliability standards.

## 3. Agentic Specifications
### 3.1 Purpose & Scope
- **Core Purpose:** Provide a Next.js/Supabase starter kit with dual-lane spec-driven workflows and AI collaboration guardrails for safe, fast feature development.
- **In Scope:** 
  - Dual-lane workflow system (Simple vs Spec-driven)
  - Slash command automation for structured development
  - Quality gates integration (TypeScript, linting, security, testing)
  - AI collaboration framework with safety boundaries
  - Template generation and scaffolding
- **Out of Scope:** 
  - Deployment or infrastructure management
  - Supporting arbitrary tech stacks beyond Next.js/Supabase
  - Replacing human decision-making or architectural judgment
  - Complex multi-agent orchestration
- **Delegation & Scaling Logic:** Simple lane for <15 step changes, Spec lane for complex features requiring planning; escalate to human for architectural decisions or security-sensitive changes.

### 3.2 Input/Output Schema
- **Input Schema:** 
  ```typescript
  interface FeatureRequest {
    description: string;
    complexity: 'simple' | 'complex';
    constraints?: string[];
    securitySensitive?: boolean;
  }
  ```
- **Output Schema:** 
  ```typescript
  interface ImplementationPlan {
    lane: 'simple' | 'spec';
    steps: string[];
    testPlan: string[];
    risks: string[];
    estimatedEffort: number;
  }
  ```

### 3.3 System Instructions & Guardrails
- **Persona & Role:** "You are an expert development assistant that helps developers implement features safely and efficiently using structured workflows."
- **Core Directives:** 
  - Prioritize security and code quality over speed
  - Always follow TDD (tests before implementation)
  - Use conventional commits and maintain git hygiene
- **Decision-Making Heuristics:** 
  - Escalate to human if security implications unclear
  - Use Spec lane if feature touches authentication/authorization
  - Require human approval for architectural changes
- **Responsible AI Guardrails:** 
  - Never modify CI/CD workflows, environment files, or security policies
  - No secrets or credentials in prompts or code
  - Always maintain human oversight for final decisions

### 3.4 Orchestration & Workflow
- **Pattern:** Manager-Worker (human decides lane, AI executes workflow)
- **Frameworks:** Custom slash commands with TodoWrite/TodoRead for task tracking
- **Workflow Diagram:** Simple → Plan → Implement vs Specify → Plan → Tasks → Implement

## 4. Execution & Validation
### 4.1 Definition of Done (Process-Oriented)
- [ ] Feature request assessed and appropriate lane selected
- [ ] Implementation plan created with test strategy
- [ ] Tests scaffolded before implementation
- [ ] Code generated to pass tests with quality gates
- [ ] All quality gates pass (TypeScript, lint, test, build)
- [ ] PR created with proper documentation
- [ ] Human review and approval obtained

### 4.2 Tooling & MCP Permissions
| Tool Name | Description | Operations | Risk Level |
|-----------|-------------|------------|------------|
| Read/Write/Edit | File operations | Create, modify, read source files | High |
| Bash | Command execution | Run scripts, git operations | High |
| TodoWrite/Read | Task tracking | Manage development tasks | Low |
| Grep/Glob | Code search | Find patterns and files | Low |

### 4.3 Metrics & Success Criteria
- **Primary Metric (Must-Meet):** 80% of features pass quality gates on first attempt
- **Guardrails:**  
  - Security violations: 0 tolerance
  - Human intervention rate: <10% for Simple lane, <30% for Spec lane
  - Time to first value: <30 minutes for new developers
- **Business Metric:** 3x faster feature development vs traditional workflows

---

**Example (short form):**  
> *DLStarter guides developers through dual-lane workflows (Simple/Spec) with AI assistance. Input = feature description + complexity. Output = working implementation with tests and documentation. DoD = all quality gates pass, PR ready for human review.*

---

## 5. Core Jobs-To-Be-Done
- **JTBD-1:** As a developer, I want to quickly plan and implement small features so I can maintain development velocity
- **JTBD-2:** As a developer, I want to safely collaborate with AI on complex features so I can leverage AI capabilities without introducing risks  
- **JTBD-3:** As a team lead, I want consistent quality and security across AI-assisted development so I can maintain codebase standards

## 6. Success Metrics (Founder KPIs)
- **Activation:** Successfully complete first feature using dual-lane workflow within 30 minutes
- **Weekly Active Users (WAU):** Developers actively using slash commands and quality gates weekly
- **Task Success Rate:** 80% of features pass quality gates on first attempt

## 7. Non-Goals (for clarity)
- Replace human developers or decision-making
- Support every possible development workflow or tech stack  
- Provide deployment or infrastructure management

## 8. Constraints & Guardrails
- Platform & stack constraints (see [Architecture](./WIKI-Architecture.md))
- Security & quality requirements (see [Quality Gates](./WIKI-Quality-Gates.md))
- Process workflows (see [Spec System](./WIKI-Spec-System.md) & [Commands](./WIKI-Commands.md))

## 9. Reference
- **Design System:** shadcn/ui with CSS custom properties and design tokens
- **Telemetry:** Optional analytics tracking with feature flags for privacy control
- **Project Principles:** See [WIKI-Home](./WIKI-Home.md) for DLStarter philosophy and core values

---

*This PRD follows the DLStarter principles of lightweight, AI-native development with quality-first guardrails (see [WIKI-Home](./WIKI-Home.md)).*