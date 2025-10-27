#!/usr/bin/env tsx

/**
 * Token Counter Utility
 *
 * Uses tiktoken (cl100k_base encoding) to estimate token counts for Skills validation.
 *
 * NOTE: This provides approximate token counts for Claude models. Anthropic has indicated
 * Claude 3+ models use an approach similar to cl100k_base, but actual token consumption
 * may vary slightly (~5-10% margin). This approximation is acceptable for measuring
 * relative token savings between workflows (old vs new).
 *
 * ALTERNATIVE: For exact token counts, use Anthropic SDK's client.messages.count_tokens()
 * API endpoint. This requires:
 * - @anthropic-ai/sdk dependency
 * - ANTHROPIC_API_KEY environment variable
 * - Network access (API calls)
 * - Associated API costs
 *
 * tiktoken was chosen for Skills validation because:
 * 1. Works offline (no API key required)
 * 2. No API costs
 * 3. Fast (no network latency)
 * 4. Sufficient accuracy for relative comparisons (~5-10% margin)
 */

import { readFileSync } from 'node:fs';
import { encoding_for_model } from 'tiktoken';

// Use cl100k_base encoding (GPT-4/Claude approximation)
// Provides ~90-95% accuracy for Claude token counting
const encoder = encoding_for_model('gpt-4');

export interface WorkflowTokens {
  metadata: number;
  prompts: number;
  scripts: number;
  docs: number;
  total: number;
}

/**
 * Count tokens in a string
 */
export function countTokens(text: string): number {
  return encoder.encode(text).length;
}

/**
 * Count tokens in a file
 */
export function countFileTokens(filePath: string): number {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return countTokens(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return 0;
  }
}

/**
 * Count tokens in multiple files and categorize
 */
export function countWorkflowTokens(files: {
  metadata?: string[];
  prompts?: string[];
  scripts?: string[];
  docs?: string[];
}): WorkflowTokens {
  const result: WorkflowTokens = {
    metadata: 0,
    prompts: 0,
    scripts: 0,
    docs: 0,
    total: 0,
  };

  // Count metadata files
  if (files.metadata) {
    for (const file of files.metadata) {
      result.metadata += countFileTokens(file);
    }
  }

  // Count prompt files
  if (files.prompts) {
    for (const file of files.prompts) {
      result.prompts += countFileTokens(file);
    }
  }

  // Count script files
  if (files.scripts) {
    for (const file of files.scripts) {
      result.scripts += countFileTokens(file);
    }
  }

  // Count documentation files
  if (files.docs) {
    for (const file of files.docs) {
      result.docs += countFileTokens(file);
    }
  }

  result.total = result.metadata + result.prompts + result.scripts + result.docs;

  return result;
}

/**
 * Parse YAML frontmatter from markdown file
 */
export function extractFrontmatter(filePath: string): { frontmatter: string; body: string } {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (match) {
      return {
        frontmatter: match[1],
        body: match[2],
      };
    }

    return {
      frontmatter: '',
      body: content,
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return { frontmatter: '', body: '' };
  }
}
