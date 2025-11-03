import { z } from 'zod';

/**
 * Zod schema for reasoning text sanitization
 * Max 500 chars, strip HTML tags, trim whitespace
 */
export const ReasoningSchema = z
  .string()
  .max(500, 'Reasoning text must be 500 characters or less')
  .transform((str) => str.replace(/[<>]/g, '')) // Remove HTML angle brackets
  .transform((str) => str.replace(/&lt;|&gt;|&amp;/g, '')) // Remove HTML entities
  .transform((str) => str.trim());

/**
 * Zod schema for tech stack name validation
 * Max 100 chars per item, alphanumeric + common special chars
 */
export const TechStackNameSchema = z
  .string()
  .max(100, 'Tech stack name must be 100 characters or less')
  .regex(/^[a-zA-Z0-9\s.\-_/@]+$/, 'Tech stack name contains invalid characters');

/**
 * Zod schema for MCP response validation
 */
export const MCPResponseSchema = z.object({
  data: z.unknown(),
  source: z.enum(['context7', 'websearch']),
});

/**
 * Sanitizes reasoning text by removing angle brackets and common HTML entities, trimming whitespace, and limiting length to 500 characters.
 *
 * If schema validation fails, returns a manually sanitized and truncated string.
 *
 * @param text - Raw reasoning text
 * @returns Sanitized reasoning text with HTML-like characters removed and length at most 500 characters
 */
export function sanitizeReasoning(text: string): string {
  try {
    return ReasoningSchema.parse(text);
  } catch (error) {
    // If validation fails, return truncated safe version
    console.warn('Reasoning sanitization failed:', error);
    return text
      .replace(/[<>]/g, '')
      .replace(/&lt;|&gt;|&amp;/g, '')
      .trim()
      .substring(0, 500);
  }
}

/**
 * Sanitizes an array of tech stack item strings.
 *
 * @param techStack - The raw array of tech stack names to validate and sanitize
 * @returns An array of validated tech stack names (invalid items omitted), limited to the first 20 valid entries
 */
export function sanitizeTechStack(techStack: string[]): string[] {
  const sanitized: string[] = [];

  for (const item of techStack.slice(0, 20)) {
    try {
      const validated = TechStackNameSchema.parse(item);
      sanitized.push(validated);
    } catch (error) {
      console.warn('Tech stack item failed validation:', item, error);
      // Skip invalid items
    }
  }

  return sanitized;
}

/**
 * Validate that an object conforms to the MCP response shape.
 *
 * @param response - Raw MCP response to validate
 * @returns The validated object containing `data` and `source` (`'context7'` or `'websearch'`), or `null` if validation fails
 */
export function validateMCPResponse(
  response: unknown
): { data: unknown; source: 'context7' | 'websearch' } | null {
  try {
    return MCPResponseSchema.parse(response);
  } catch (error) {
    console.warn('MCP response validation failed:', error);
    return null;
  }
}

/**
 * Remove potentially dangerous content from external text.
 *
 * Strips angle brackets, common HTML entities, protocol prefixes (`javascript:`, `data:`, `vbscript:`),
 * and inline event handler attributes, then trims and truncates the result.
 *
 * @param text - Raw external text to sanitize
 * @param maxLength - Maximum length of the returned string (default: 1000)
 * @returns The sanitized string, trimmed and truncated to at most `maxLength`
 */
export function sanitizeExternalText(text: string, maxLength: number = 1000): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/&lt;|&gt;|&amp;|&quot;|&#x27;/g, '') // Remove HTML entities
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick=, onerror=, etc.)
    .trim()
    .substring(0, maxLength);
}

/**
 * Limit a string's length for logging by truncating and appending an ellipsis when necessary.
 *
 * @param text - The input string to truncate if it exceeds `maxLength`
 * @param maxLength - Maximum allowed length of the returned string (default: 100)
 * @returns `text` unchanged if its length is less than or equal to `maxLength`; otherwise a string of length equal to `maxLength` formed by taking the first `maxLength - 3` characters and appending `'...'`
 */
export function truncateForLog(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
