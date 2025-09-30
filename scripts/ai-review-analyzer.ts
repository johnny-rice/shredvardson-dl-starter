#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Represents a pattern found in AI review feedback
 */
interface AIReviewPattern {
  /** The descriptive name of the pattern */
  pattern: string;
  /** Number of times this pattern has occurred */
  count: number;
  /** Recent examples of this pattern */
  examples: string[];
  /** Category classification for organizational purposes */
  category:
    | 'lint'
    | 'tests'
    | 'naming'
    | 'security'
    | 'performance'
    | 'architecture'
    | 'documentation'
    | 'other';
}

/**
 * Complete analysis results from AI review processing
 */
interface AIReviewAnalysis {
  /** Total number of AI reviews processed */
  totalReviews: number;
  /** All patterns found, sorted by frequency */
  patterns: AIReviewPattern[];
  /** Suggested micro-lessons based on pattern thresholds */
  suggestedLessons: string[];
  /** Suggested ADRs for high-frequency patterns */
  suggestedADRs: string[];
}

/**
 * Analyzes AI review comments to identify patterns and suggest institutional learning opportunities
 */
class AIReviewAnalyzer {
  private patterns: Map<string, AIReviewPattern> = new Map();
  private readonly PATTERN_THRESHOLD = 3; // Suggest micro-lesson after 3 occurrences
  private readonly ADR_THRESHOLD = 5; // Suggest ADR after 5 occurrences

  /**
   * Analyzes AI review reports from the artifacts directory
   * @param artifactsDir - Directory containing doctor reports and AI review data
   * @returns Complete analysis with patterns and suggestions
   */
  analyzeReports(artifactsDir: string = 'artifacts'): AIReviewAnalysis {
    // Reset state to avoid double-counting across runs
    this.patterns.clear();

    const reportFiles = this.findReportFiles(artifactsDir);
    let totalReviews = 0;

    for (const reportFile of reportFiles) {
      const reviews = this.extractAIReviews(reportFile);
      totalReviews += reviews.length;

      for (const review of reviews) {
        this.categorizeAndStore(review);
      }
    }

    const patterns = Array.from(this.patterns.values()).sort((a, b) => b.count - a.count);
    const suggestedLessons = this.generateLessonSuggestions(patterns);
    const suggestedADRs = this.generateADRSuggestions(patterns);

    return {
      totalReviews,
      patterns,
      suggestedLessons,
      suggestedADRs,
    };
  }

  /**
   * Finds all report files containing AI review data
   * @param artifactsDir - Directory to search for report files
   * @returns Array of file paths to analyze
   */
  private findReportFiles(artifactsDir: string): string[] {
    const reportFiles: string[] = [];

    // Recursive search function for nested artifacts
    const walkDirectory = (dir: string) => {
      if (!fs.existsSync(dir)) return;

      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recurse into subdirectories (e.g., date-partitioned reports)
          walkDirectory(fullPath);
        } else if (entry.isFile() && /doctor-report.*\.md$/i.test(entry.name)) {
          reportFiles.push(fullPath);
        }
      }
    };

    walkDirectory(artifactsDir);
    return reportFiles;
  }

  private extractAIReviews(reportFile: string): string[] {
    const content = fs.readFileSync(reportFile, 'utf-8');
    const reviews: string[] = [];

    // Extract AI review sections
    const aiReviewRegex = /<!-- ai-review:v1.*?-->(.*?)<!-- \/ai-review:v1 -->/gs;
    const aiSecReviewRegex = /<!-- ai-sec-review:v1.*?-->(.*?)<!-- \/ai-sec-review:v1 -->/gs;

    let match;
    while ((match = aiReviewRegex.exec(content)) !== null) {
      reviews.push(match[1].trim());
    }

    while ((match = aiSecReviewRegex.exec(content)) !== null) {
      reviews.push(match[1].trim());
    }

    return reviews;
  }

  private categorizeAndStore(review: string) {
    const patterns = this.extractPatterns(review);

    for (const pattern of patterns) {
      const key = pattern.pattern.toLowerCase();

      if (this.patterns.has(key)) {
        const existing = this.patterns.get(key)!;
        existing.count++;
        existing.examples.push(pattern.example);
        if (existing.examples.length > 3) {
          existing.examples = existing.examples.slice(-3); // Keep last 3 examples
        }
      } else {
        this.patterns.set(key, {
          pattern: pattern.pattern,
          count: 1,
          examples: [pattern.example],
          category: pattern.category,
        });
      }
    }
  }

  private extractPatterns(
    review: string
  ): Array<{ pattern: string; example: string; category: AIReviewPattern['category'] }> {
    const patterns: Array<{
      pattern: string;
      example: string;
      category: AIReviewPattern['category'];
    }> = [];

    // Common patterns to detect
    const patternRules = [
      { regex: /missing\s+tests?/i, pattern: 'Missing tests', category: 'tests' as const },
      { regex: /add\s+tests?/i, pattern: 'Add tests', category: 'tests' as const },
      { regex: /test\s+coverage/i, pattern: 'Test coverage', category: 'tests' as const },
      { regex: /eslint|prettier|lint/i, pattern: 'Linting issues', category: 'lint' as const },
      { regex: /naming\s+convention/i, pattern: 'Naming convention', category: 'naming' as const },
      { regex: /variable\s+name/i, pattern: 'Variable naming', category: 'naming' as const },
      { regex: /function\s+name/i, pattern: 'Function naming', category: 'naming' as const },
      { regex: /security\s+concern/i, pattern: 'Security concern', category: 'security' as const },
      {
        regex: /potential\s+vulnerability/i,
        pattern: 'Potential vulnerability',
        category: 'security' as const,
      },
      {
        regex: /performance\s+issue/i,
        pattern: 'Performance issue',
        category: 'performance' as const,
      },
      {
        regex: /optimization/i,
        pattern: 'Optimization opportunity',
        category: 'performance' as const,
      },
      {
        regex: /type\s+annotation/i,
        pattern: 'Type annotation',
        category: 'architecture' as const,
      },
      {
        regex: /interface\s+definition/i,
        pattern: 'Interface definition',
        category: 'architecture' as const,
      },
      {
        regex: /missing\s+documentation/i,
        pattern: 'Missing documentation',
        category: 'documentation' as const,
      },
      { regex: /add\s+comments?/i, pattern: 'Add comments', category: 'documentation' as const },
      { regex: /error\s+handling/i, pattern: 'Error handling', category: 'architecture' as const },
      {
        regex: /exception\s+handling/i,
        pattern: 'Exception handling',
        category: 'architecture' as const,
      },
    ];

    for (const rule of patternRules) {
      if (rule.regex.test(review)) {
        patterns.push({
          pattern: rule.pattern,
          example: this.extractExampleFromReview(review, rule.regex),
          category: rule.category,
        });
      }
    }

    // If no specific patterns found, categorize as 'other'
    if (patterns.length === 0) {
      patterns.push({
        pattern: 'General feedback',
        example: review.substring(0, 100) + '...',
        category: 'other',
      });
    }

    return patterns;
  }

  private extractExampleFromReview(review: string, regex: RegExp): string {
    const lines = review.split('\n');
    for (const line of lines) {
      if (regex.test(line)) {
        return line.trim().substring(0, 150);
      }
    }
    return review.substring(0, 100) + '...';
  }

  private generateLessonSuggestions(patterns: AIReviewPattern[]): string[] {
    const suggestions: string[] = [];

    for (const pattern of patterns) {
      if (pattern.count >= this.PATTERN_THRESHOLD && pattern.count < this.ADR_THRESHOLD) {
        suggestions.push(this.createLessonSuggestion(pattern));
      }
    }

    return suggestions;
  }

  private generateADRSuggestions(patterns: AIReviewPattern[]): string[] {
    const suggestions: string[] = [];

    for (const pattern of patterns) {
      if (pattern.count >= this.ADR_THRESHOLD) {
        suggestions.push(this.createADRSuggestion(pattern));
      }
    }

    return suggestions;
  }

  private createLessonSuggestion(pattern: AIReviewPattern): string {
    const filename = `${pattern.category}-${pattern.pattern.toLowerCase().replace(/\s+/g, '-')}.md`;

    return `docs/micro-lessons/${filename}: Pattern "${pattern.pattern}" appeared ${pattern.count} times - consider creating micro-lesson`;
  }

  private createADRSuggestion(pattern: AIReviewPattern): string {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const adrId = `ADR-${today}-${pattern.category}-standards`;

    return `docs/decisions/${adrId.toLowerCase()}.md: Pattern "${pattern.pattern}" appeared ${pattern.count} times - consider architectural decision`;
  }

  /**
   * Generates a comprehensive markdown report of AI review patterns
   * @returns Formatted markdown report with patterns, suggestions, and statistics
   */
  generateReport(): string {
    const analysis = this.analyzeReports();

    let report = `# AI Review Pattern Analysis\n\n`;
    report += `**Total AI reviews analyzed:** ${analysis.totalReviews}\n`;
    report += `**Unique patterns found:** ${analysis.patterns.length}\n\n`;

    if (analysis.patterns.length > 0) {
      report += `## Top Patterns\n\n`;
      for (const pattern of analysis.patterns.slice(0, 10)) {
        report += `### ${pattern.pattern} (${pattern.category})\n`;
        report += `- **Occurrences:** ${pattern.count}\n`;
        report += `- **Recent examples:**\n`;
        for (const example of pattern.examples) {
          report += `  - ${example}\n`;
        }
        report += `\n`;
      }
    }

    if (analysis.suggestedLessons.length > 0) {
      report += `## Suggested Micro-Lessons\n\n`;
      for (const suggestion of analysis.suggestedLessons) {
        report += `- ${suggestion}\n`;
      }
      report += `\n`;
    }

    if (analysis.suggestedADRs.length > 0) {
      report += `## Suggested ADRs\n\n`;
      for (const suggestion of analysis.suggestedADRs) {
        report += `- ${suggestion}\n`;
      }
      report += `\n`;
    }

    report += `## Pattern Breakdown by Category\n\n`;
    const categoryStats = this.getCategoryStats(analysis.patterns);
    for (const [category, count] of Object.entries(categoryStats)) {
      report += `- **${category}:** ${count} occurrences\n`;
    }

    return report;
  }

  private getCategoryStats(patterns: AIReviewPattern[]): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const pattern of patterns) {
      stats[pattern.category] = (stats[pattern.category] || 0) + pattern.count;
    }

    return stats;
  }
}

// CLI interface
function main() {
  const analyzer = new AIReviewAnalyzer();

  if (process.argv.includes('--report')) {
    console.log(analyzer.generateReport());
  } else {
    const analysis = analyzer.analyzeReports();
    console.log(`📊 AI Review Analysis Complete`);
    console.log(`Total reviews: ${analysis.totalReviews}`);
    console.log(`Patterns found: ${analysis.patterns.length}`);
    console.log(`Lesson suggestions: ${analysis.suggestedLessons.length}`);
    console.log(`ADR suggestions: ${analysis.suggestedADRs.length}`);

    if (analysis.suggestedLessons.length > 0) {
      console.log(`\n💡 Run 'pnpm ai-review --report' for detailed suggestions`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

export { AIReviewAnalyzer };
