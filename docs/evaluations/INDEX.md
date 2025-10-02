# Evaluations Index

Evaluations of tools, processes, and integrations for the DL Starter project.

## What This Is

This directory contains structured assessments of potential tools, workflows, and integrations before adoption. Each evaluation follows a consistent framework to ensure objective decision-making.

## When to Use

Create an evaluation when:
- Considering a new tool or service integration
- Assessing alternative approaches to existing workflows
- Testing beta/experimental features from current tools
- Evaluating process changes that affect development workflow

## Active Evaluations

- [CodeRabbit CLI Evaluation](coderabbit-cli-evaluation.md) - Pre-commit code review tool assessment (Issue #98)

## Completed Evaluations

- (None yet)

## Evaluation Framework

Each evaluation should include:

1. **Objective** - What are we evaluating and why?
2. **Setup** - Installation/configuration steps
3. **Testing Plan** - How will we assess effectiveness?
4. **Results** - Findings from testing (quantitative + qualitative)
5. **Analysis** - Strengths, weaknesses, edge cases
6. **Cost-Benefit** - Time investment vs value gained
7. **Recommendation** - Go/no-go decision with justification
8. **Next Steps** - If positive: implementation plan; If negative: alternatives

## Creating a New Evaluation

1. Create file: `docs/evaluations/[tool-name]-evaluation.md`
2. Use the framework above as a template
3. Link to related GitHub issue if applicable
4. Update this INDEX.md with the new evaluation
5. Commit evaluation document before testing begins
6. Update with findings as testing progresses
7. Finalize with recommendation when complete

## References

- [Quality Gates](../wiki/WIKI-Quality-Gates.md) - Standards evaluations should meet
- [Decision Records](../decisions/README.md) - ADRs for accepted tools/processes
