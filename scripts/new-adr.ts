#!/usr/bin/env tsx
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

function getNextADRNumber(): string {
  const decisionsDir = resolve('docs/decisions');

  if (!existsSync(decisionsDir)) {
    console.error('❌ Directory docs/decisions does not exist');
    process.exit(1);
  }

  const files = readdirSync(decisionsDir);

  // Find all ADR files with pattern ADR-NNN-*
  const adrNumbers = files
    .filter((file) => file.match(/^ADR-\d{3,}-.*\.md$/))
    .map((file) => {
      const match = file.match(/^ADR-(\d{3,})-/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter((num) => num > 0);

  const maxNumber = adrNumbers.length > 0 ? Math.max(...adrNumbers) : 0;
  const nextNumber = maxNumber + 1;

  // Add current timestamp to reduce collision risk
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  console.log(
    `📝 Suggested number: ADR-${nextNumber.toString().padStart(3, '0')} (if collision occurs, manually increment)`
  );

  return nextNumber.toString().padStart(3, '0');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: pnpm adr:create "Title of the Decision"

Creates a new ADR file with the next sequential number.

Examples:
  pnpm adr:create "Database Migration Strategy"
  pnpm adr:create "Authentication Provider Selection"
  
The script will:
1. Find the next ADR number (e.g., 004)
2. Create a slugified filename
3. Copy and customize the template
4. Show the filename for PR reference

Note: If multiple people create ADRs simultaneously, you may need to manually
adjust the number to avoid conflicts. The script will warn about this.
`);
    process.exit(0);
  }

  const title = args.join(' ');
  if (!title.trim()) {
    console.error('❌ Title is required');
    process.exit(1);
  }

  const adrNumber = getNextADRNumber();
  const slug = slugify(title);

  if (!slug) {
    console.error('❌ Title must contain at least one alphanumeric character');
    process.exit(1);
  }

  const filename = `ADR-${adrNumber}-${slug}.md`;
  const filepath = resolve('docs/decisions', filename);

  // Read template
  const templatePath = resolve('docs/decisions/0001-template.md');
  let template: string;

  try {
    template = readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error('❌ Could not read ADR template at docs/decisions/0001-template.md');
    process.exit(1);
  }

  // Customize template using template variables
  const currentDate = new Date().toISOString().split('T')[0];
  const customized = template
    .replace(/\{\{NUMBER\}\}/g, adrNumber)
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{DATE\}\}/g, currentDate)
    .replace(/\{\{STATUS\}\}/g, 'Draft')
    .replace(
      'We need a standardized format for documenting architectural decisions to maintain transparency and reasoning for both humans and AI agents. This template establishes the structure for all future ADRs.',
      '[Describe the background, problem, or need that led to this decision]'
    )
    .replace(
      'Use this template for all architectural decision records with mandatory sections: Status, Date, Context, Decision, Consequences, and References. ADRs will be numbered sequentially with zero-padding (0001, 0002, etc.) and stored in docs/decisions/.',
      '[Describe the decision made and the solution chosen]'
    )
    .replace(
      '- **Benefits:** Clear decision history, LLM-friendly structure, consistent formatting\n- **Tradeoffs:** Additional documentation overhead for architectural changes\n- **Monitoring:** Ensure all significant architectural changes have corresponding ADRs',
      '- **Benefits:** [Positive outcomes expected from this decision]\n- **Tradeoffs:** [Negative aspects or limitations]\n- **Monitoring:** [How to track the impact of this decision]'
    )
    .replace(
      '- Issue: N/A (template establishment)',
      '- Issue: [Link to GitHub issue if applicable]'
    )
    .replace('- PR: TBD', '- PR: [Link to implementing PR]');

  // Write file
  try {
    writeFileSync(filepath, customized, 'utf8');
  } catch (error) {
    console.error(`❌ Could not write ADR file: ${error}`);
    process.exit(1);
  }

  console.log(`✅ Created ADR: ${filename}`);
  console.log(`📝 Edit: ${filepath}`);
  console.log(`🔗 PR Reference: ADR-${adrNumber}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Edit the ADR file to fill in Context, Decision, and Consequences');
  console.log('2. Update Status from "Draft" to "Proposed" when ready');
  console.log(`3. Add "ADR: ADR-${adrNumber}" to your PR description`);
}

main();
