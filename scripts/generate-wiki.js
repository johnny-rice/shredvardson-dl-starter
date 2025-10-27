#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

/**
 * Generate wiki content from project files
 */
function generateWiki(_scrubSecrets = false) {
  const outputDir = path.join(process.cwd(), 'wiki-content/generated');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate Home.md
  const homeContent = generateHomePage();
  fs.writeFileSync(path.join(outputDir, 'Home.md'), homeContent);

  // Generate other wiki pages
  generateCommandsPage(outputDir);
  generateConstitutionPage(outputDir);
  generateArchitecturePage(outputDir);
  generatePRDPage(outputDir);

  console.log(`✅ Generated wiki content in ${outputDir}`);
}

function generateHomePage() {
  const candidates = ['docs/ai/CLAUDE.md', 'CLAUDE.md'];
  const claudePath = candidates.find((p) => fs.existsSync(p)) || candidates[0];
  const claudeContent = fs.readFileSync(claudePath, 'utf8');

  return `# Dissonance Labs Starter

${extractSection(claudeContent, '## Mission')}

${extractSection(claudeContent, '## Guardrails')}

## Quick Links

- [Commands Reference](Commands.md)
- [Constitution](Constitution.md)
- [Architecture](Architecture.md)

## Workflows

${extractSection(claudeContent, '### Simple Workflow')}

${extractSection(claudeContent, '### Spec-Driven Workflow')}

## Getting Started

Follow the [CLAUDE.md](${claudePath === 'docs/ai/CLAUDE.md' ? '../docs/ai/CLAUDE.md' : '../CLAUDE.md'}) instructions for complete setup details.

---
*Generated automatically from project files*
`;
}

function generateCommandsPage(outputDir) {
  const indexPath = 'docs/commands/index.json';

  if (!fs.existsSync(indexPath)) {
    console.warn('⚠️ Command index not found, skipping commands page');
    return;
  }

  const commandIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

  let content = `# Commands Reference

## Available Commands

`;

  // Group commands by category
  const categories = {};
  commandIndex.commands.forEach((cmd) => {
    if (!categories[cmd.category]) {
      categories[cmd.category] = [];
    }
    categories[cmd.category].push(cmd);
  });

  // Generate sections for each category
  Object.keys(categories)
    .sort()
    .forEach((category) => {
      content += `### ${category}\n\n`;

      categories[category].forEach((cmd) => {
        content += `#### ${cmd.name}\n\n`;
        content += `**Purpose**: ${cmd.purpose}\n\n`;
        content += `**When to use**: ${cmd.when}\n\n`;
        content += `**Example**: ${cmd.example}\n\n`;
        content += `**Risk Level**: ${cmd.riskLevel}`;
        if (cmd.requiresHITL) {
          content += ' (Requires Human Approval)';
        }
        content += '\n\n';
        content += `**Tags**: ${cmd.tags.join(', ')}\n\n`;
        content += '---\n\n';
      });
    });

  content += `## Decision Framework

${JSON.stringify(commandIndex.decision_framework, null, 2)}

---
*Generated from docs/commands/index.json*
`;

  fs.writeFileSync(path.join(outputDir, 'Commands.md'), content);
}

function generateConstitutionPage(outputDir) {
  const constitutionPath = 'docs/constitution.md';

  if (!fs.existsSync(constitutionPath)) {
    console.warn('⚠️ Constitution not found, skipping constitution page');
    return;
  }

  let content = fs.readFileSync(constitutionPath, 'utf8');

  // Add generation note
  content += '\n\n---\n*Copied from docs/constitution.md*\n';

  fs.writeFileSync(path.join(outputDir, 'Constitution.md'), content);
}

function generateArchitecturePage(outputDir) {
  const content = `# Architecture Overview

## System Design

This starter implements a dual-lane AI development system:

- **Simple Lane**: For small changes, bug fixes, and routine tasks
- **Spec-Driven Lane**: For complex features requiring structured planning

## Key Components

### Command System
- Slash commands for structured workflows
- Risk-based routing and approval gates
- Machine-readable command index

### Quality Gates
- Constitutional compliance checking
- Automated testing and linting
- Security scanning and review

### GitHub Integration
- Issue templates for different workflow types
- Automated artifact cross-referencing  
- Wiki synchronization for context sharing

## File Structure

\`\`\`
.claude/commands/     # Slash command definitions
docs/constitution.md  # Governance and constraints
docs/commands/        # Machine-readable command metadata
specs/               # Requirements specifications
plans/               # Technical implementation plans  
tasks/               # Actionable development tasks
\`\`\`

---
*Generated automatically*
`;

  fs.writeFileSync(path.join(outputDir, 'Architecture.md'), content);
}

function extractSection(content, heading) {
  const lines = content.split('\n');
  const startIndex = lines.findIndex((line) => line.startsWith(heading));

  if (startIndex === -1) return '';

  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i].match(/^#+\s/)) {
      endIndex = i;
      break;
    }
  }

  return lines.slice(startIndex, endIndex).join('\n').trim();
}

// Parse command line arguments
const args = process.argv.slice(2);
const scrubSecrets = args.includes('--scrub-secrets');

// Run the generator if called directly
if (require.main === module) {
  generateWiki(scrubSecrets);
}

function generatePRDPage(outputDir) {
  const prdPath = 'docs/product/PRD.md';

  if (!fs.existsSync(prdPath)) {
    console.warn('⚠️ PRD not found, skipping PRD page');
    return;
  }

  let content = fs.readFileSync(prdPath, 'utf8');

  // Add generation note
  content +=
    '\n\n---\n*Copied from docs/product/PRD.md - DO NOT EDIT DIRECTLY*\n*Update the source file and run `pnpm wiki:generate` to sync*\n';

  fs.writeFileSync(path.join(outputDir, 'WIKI-PRD.md'), content);

  // Also sync to docs/wiki/WIKI-PRD.md for consistency
  const wikiDir = path.join(process.cwd(), 'docs/wiki');
  if (!fs.existsSync(wikiDir)) {
    fs.mkdirSync(wikiDir, { recursive: true });
  }
  fs.writeFileSync(path.join(wikiDir, 'WIKI-PRD.md'), content);
}

module.exports = { generateWiki };
