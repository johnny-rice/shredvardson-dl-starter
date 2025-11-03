#!/usr/bin/env tsx

/**
 * Validate Sub-Agent Prompt Structure
 *
 * Related: ADR-003 - Structured Prompt Template Standards
 * See: docs/adr/003-structured-prompt-templates.md
 *
 * Ensures all sub-agent prompts follow the structured format:
 * - PURPOSE section (1 sentence)
 * - CONTEXT section (input format, project info, tools, constraints)
 * - CONSTRAINTS section (token budget, output format, quality requirements)
 * - OUTPUT FORMAT section (explicit JSON schema)
 *
 * Usage:
 *   pnpm tsx scripts/validate-prompts.ts
 *
 * Exit codes:
 *   0 - All prompts valid
 *   1 - Validation errors found
 */

import * as fs from 'fs';
import * as path from 'path';

const PROMPTS_DIR = '.claude/prompts';
const REQUIRED_SECTIONS = ['PURPOSE', 'CONTEXT', 'CONSTRAINTS', 'OUTPUT FORMAT'];

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validatePromptFile(filePath: string): ValidationResult {
  const fileName = path.basename(filePath);
  const result: ValidationResult = {
    file: fileName,
    valid: true,
    errors: [],
    warnings: [],
  };

  // Skip template file
  if (fileName === '_TEMPLATE.md') {
    return result;
  }

  // Read file
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Check for required sections
  for (const section of REQUIRED_SECTIONS) {
    const sectionRegex = new RegExp(`^## ${section}$`, 'm');
    if (!sectionRegex.test(content)) {
      result.valid = false;
      result.errors.push(`Missing required section: ## ${section}`);
    }
  }

  // Check section order
  const sectionPositions = REQUIRED_SECTIONS.map((section) => {
    const match = content.match(new RegExp(`^## ${section}$`, 'm'));
    return match ? content.indexOf(match[0]) : -1;
  });

  for (let i = 1; i < sectionPositions.length; i++) {
    if (sectionPositions[i] !== -1 && sectionPositions[i - 1] !== -1) {
      if (sectionPositions[i] < sectionPositions[i - 1]) {
        result.valid = false;
        result.errors.push(
          `Section order incorrect: ${REQUIRED_SECTIONS[i]} should come after ${REQUIRED_SECTIONS[i - 1]}`
        );
      }
    }
  }

  // Check PURPOSE is one sentence (ends with period, no other periods)
  const purposeMatch = content.match(/## PURPOSE\n\n(.+?)(\n\n|$)/s);
  if (purposeMatch) {
    const purposeText = purposeMatch[1].trim();
    const sentenceCount = (purposeText.match(/\./g) || []).length;
    if (sentenceCount === 0) {
      result.warnings.push('PURPOSE section should end with a period');
    } else if (sentenceCount > 1) {
      result.warnings.push('PURPOSE section should be a single sentence');
    }
  }

  // Check CONTEXT has required subsections
  const contextMatch = content.match(/## CONTEXT\n\n(.+?)(\n## |$)/s);
  if (contextMatch) {
    const contextText = contextMatch[1];
    const requiredContextItems = ['Input Format', 'Project', 'Tools Available', 'Model', 'Timeout'];
    for (const item of requiredContextItems) {
      if (!contextText.includes(`**${item}**`)) {
        result.warnings.push(`CONTEXT section missing: **${item}**`);
      }
    }
  }

  // Check CONSTRAINTS has token budget
  const constraintsMatch = content.match(/## CONSTRAINTS\n\n(.+?)(\n## |$)/s);
  if (constraintsMatch) {
    const constraintsText = constraintsMatch[1];
    if (!constraintsText.includes('**Token Budget**')) {
      result.warnings.push('CONSTRAINTS section missing: **Token Budget**');
    }
    if (!constraintsText.includes('**Output Format**')) {
      result.warnings.push('CONSTRAINTS section missing: **Output Format**');
    }
    if (!constraintsText.includes('**Confidence Level**')) {
      result.warnings.push('CONSTRAINTS section missing: **Confidence Level**');
    }
  }

  // Check OUTPUT FORMAT has JSON schema
  const outputMatch = content.match(/## OUTPUT FORMAT\n\n(.+?)(\n## |$)/s);
  if (outputMatch) {
    const outputText = outputMatch[1];
    if (!outputText.includes('```json')) {
      result.warnings.push('OUTPUT FORMAT section should include JSON schema in code block');
    }
    if (!outputText.includes('**Required Fields:**')) {
      result.warnings.push('OUTPUT FORMAT section missing: **Required Fields:**');
    }
    if (!outputText.includes('**Optional Fields:**')) {
      result.warnings.push('OUTPUT FORMAT section missing: **Optional Fields:**');
    }
    if (!outputText.includes('"confidence"')) {
      result.warnings.push('OUTPUT FORMAT JSON schema should include "confidence" field');
    }
  }

  // Check for EXAMPLES section (recommended)
  if (!content.includes('## EXAMPLES')) {
    result.warnings.push('Missing recommended section: ## EXAMPLES');
  }

  // Check for SUCCESS CRITERIA section (recommended)
  if (!content.includes('## SUCCESS CRITERIA')) {
    result.warnings.push('Missing recommended section: ## SUCCESS CRITERIA');
  }

  // Check file size (should be reasonable)
  const sizeKB = content.length / 1024;
  if (sizeKB > 15) {
    result.warnings.push(`File is large (${sizeKB.toFixed(1)}KB). Consider simplifying.`);
  }

  return result;
}

function main() {
  console.log('🔍 Validating sub-agent prompt structure...\n');

  // Find all prompt files
  const files = fs
    .readdirSync(PROMPTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(PROMPTS_DIR, f));

  if (files.length === 0) {
    console.error('❌ No prompt files found in', PROMPTS_DIR);
    process.exit(1);
  }

  // Validate each file
  const results = files.map(validatePromptFile);

  // Print results
  let hasErrors = false;
  for (const result of results) {
    if (result.file === '_TEMPLATE.md') continue;

    if (result.valid && result.warnings.length === 0) {
      console.log(`✅ ${result.file}`);
    } else if (result.valid && result.warnings.length > 0) {
      console.log(`⚠️  ${result.file}`);
      for (const warning of result.warnings) {
        console.log(`   ⚠️  ${warning}`);
      }
    } else {
      console.log(`❌ ${result.file}`);
      hasErrors = true;
      for (const error of result.errors) {
        console.log(`   ❌ ${error}`);
      }
      for (const warning of result.warnings) {
        console.log(`   ⚠️  ${warning}`);
      }
    }
  }

  // Summary
  const validCount = results.filter((r) => r.valid && r.file !== '_TEMPLATE.md').length;
  const totalCount = results.filter((r) => r.file !== '_TEMPLATE.md').length;
  const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);

  console.log('\n📊 Summary:');
  console.log(`   ${validCount}/${totalCount} prompts valid`);
  console.log(`   ${warningCount} warnings`);

  if (hasErrors) {
    console.log('\n❌ Validation failed. Please fix errors above.');
    process.exit(1);
  } else if (warningCount > 0) {
    console.log('\n⚠️  Validation passed with warnings. Consider addressing warnings.');
    process.exit(0);
  } else {
    console.log('\n✅ All prompts valid!');
    process.exit(0);
  }
}

main();
