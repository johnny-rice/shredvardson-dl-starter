#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generate command index from .claude/commands directory structure
 */
function generateCommandIndex() {
  const commandsDir = path.join(process.cwd(), '.claude/commands');
  const outputFile = path.join(process.cwd(), 'docs/commands/index.json');
  
  if (!fs.existsSync(commandsDir)) {
    console.error('❌ Commands directory not found:', commandsDir);
    process.exit(1);
  }
  
  const commands = [];
  
  // Recursively scan command files
  function scanDirectory(dir, category = '') {
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Use directory name as category
        const newCategory = category ? `${category}/${entry}` : entry;
        scanDirectory(fullPath, newCategory);
      } else if (entry.endsWith('.md')) {
        // Process command file
        const relativePath = path.relative(process.cwd(), fullPath);
        const command = parseCommandFile(fullPath, relativePath, category);
        if (command) {
          commands.push(command);
        }
      }
    }
  }
  
  scanDirectory(commandsDir);
  
  // Generate routing rules and decision framework
  const routingRules = {
    complex_features: [
      "authentication",
      "database", 
      "payments",
      "api",
      "infra"
    ],
    simple_tasks: [
      "styling",
      "copy",
      "props", 
      "refactor",
      "docs"
    ],
    security_sensitive: [
      "auth",
      "payments",
      "user-data",
      "api-keys",
      "validation"
    ],
    multi_component: [
      "cross-cutting",
      "breaking-changes", 
      "new-dependencies"
    ]
  };
  
  const decisionFramework = {
    spec_driven_triggers: [
      "Risk: authentication/payments/data",
      "Scope: 3+ files or 2+ hours", 
      "Clarity: requirements unclear",
      "Dependencies: new packages/services"
    ],
    simple_workflow_default: [
      "Single component changes",
      "UI tweaks and styling",
      "Bug fixes",
      "Documentation updates", 
      "Anything completable in 1-2 hours"
    ]
  };
  
  const index = {
    version: 1,
    generated: new Date().toISOString(),
    commands: commands.sort((a, b) => a.name.localeCompare(b.name)),
    routing_rules: routingRules,
    decision_framework: decisionFramework
  };
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write index file
  fs.writeFileSync(outputFile, JSON.stringify(index, null, 2) + '\n');
  console.log(`✅ Generated command index: ${outputFile}`);
  console.log(`📊 Found ${commands.length} commands`);
}

/**
 * Simple YAML parser for command frontmatter
 */
function parseSimpleYAML(yamlContent) {
  const result = {};
  const lines = yamlContent.split('\n');
  let currentKey = null;
  let isMultiline = false;
  let multilineValue = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Handle continuation of multiline value
    if (isMultiline) {
      if (line.startsWith('  ') || line.startsWith('\t')) {
        // Indented line - part of multiline value
        multilineValue.push(line.replace(/^  /, '').trim());
      } else {
        // End of multiline value
        result[currentKey] = multilineValue.join(' ').trim();
        isMultiline = false;
        multilineValue = [];
        currentKey = null;
        // Process current line as new key-value pair
        i--; // Reprocess this line
        continue;
      }
    } else {
      // Handle key: value pairs
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim();
        let value = trimmed.substring(colonIndex + 1).trim();
        
        // Check for multiline indicators
        if (value === '>' || value === '|') {
          currentKey = key;
          isMultiline = true;
          multilineValue = [];
          continue;
        }
        
        // Handle different value types
        if (value.startsWith('"') && value.endsWith('"')) {
          // Quoted string
          value = value.slice(1, -1);
        } else if (value.startsWith('[') && value.endsWith(']')) {
          // Array
          try {
            value = JSON.parse(value);
          } catch {
            // Fallback: split by comma and trim
            value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
          }
        } else if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        } else if (value.match(/^\d+$/)) {
          value = parseInt(value, 10);
        }
        
        result[key] = value;
      }
    }
  }
  
  // Handle final multiline value if we ended in multiline mode
  if (isMultiline && currentKey) {
    result[currentKey] = multilineValue.join(' ').trim();
  }
  
  return result;
}

/**
 * Parse a command markdown file to extract metadata
 */
function parseCommandFile(filePath, relativePath, category) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Parse YAML frontmatter
    let metadata = {};
    if (lines[0]?.trim() === '---') {
      const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
      if (endIndex > 0) {
        const yamlLines = lines.slice(1, endIndex);
        metadata = parseSimpleYAML(yamlLines.join('\n'));
      }
    }
    
    // Extract command name from YAML metadata, filename, or first heading
    let name = metadata.name || path.basename(filePath, '.md');
    if (name.startsWith('"') && name.endsWith('"')) {
      name = name.slice(1, -1); // Remove quotes
    }
    if (name.startsWith('/')) {
      name = name.substring(1); // Remove leading slash for index
    }
    
    const firstHeading = lines.find(line => line.startsWith('#'));
    if (!metadata.name && firstHeading) {
      const headingText = firstHeading.replace(/^#+\s*/, '').trim();
      if (headingText.startsWith('/')) {
        name = headingText.substring(1);
      }
    }
    
    // Determine category from directory structure
    const pathParts = relativePath.split('/');
    let commandCategory = 'General';
    
    if (pathParts.includes('spec')) {
      commandCategory = 'Spec-Driven Development';
    } else if (pathParts.includes('dev')) {
      commandCategory = 'Simple Development';  
    } else if (pathParts.includes('git')) {
      commandCategory = 'Git Workflow';
    } else if (pathParts.includes('github')) {
      commandCategory = 'GitHub Integration';
    } else if (pathParts.includes('test')) {
      commandCategory = 'Testing';
    } else if (pathParts.includes('quality')) {
      commandCategory = 'Quality Assurance'; 
    } else if (pathParts.includes('review')) {
      commandCategory = 'Review & Quality';
    } else if (pathParts.includes('docs')) {
      commandCategory = 'Documentation';
    } else if (pathParts.includes('ops')) {
      commandCategory = 'Operations';
    }
    
    // Extract tags from metadata or content
    const tags = metadata.tags || extractTags(content, pathParts);
    
    // Extract purpose/description from metadata or content
    let purpose = metadata.when_to_use || 'No description available';
    if (!metadata.when_to_use) {
      const purposeMatch = content.match(/(?:Purpose|Description):\s*(.+)/i);
      if (purposeMatch) {
        purpose = purposeMatch[1].trim();
      }
    }
    
    // Extract when to use
    let when = determineWhenToUse(content, tags, commandCategory);
    
    // Extract example
    let example = determineExample(content, commandCategory, name);
    
    // Determine risk level from metadata or content
    const riskLevel = metadata.riskLevel || determineRiskLevel(content, tags, name);
    
    // Determine if requires human-in-the-loop from metadata or heuristics
    const requiresHITL = metadata.requiresHITL !== undefined ? metadata.requiresHITL : determineRequiresHITL(content, tags, riskLevel);
    
    return {
      name,
      path: relativePath,
      category: commandCategory,
      tags,
      when,
      purpose,
      example, 
      riskLevel,
      requiresHITL
    };
    
  } catch (error) {
    console.error(`⚠️ Error parsing ${filePath}:`, error.message);
    return null;
  }
}

function extractTags(content, pathParts) {
  const tags = new Set();
  
  // Add tags based on path
  pathParts.forEach(part => {
    if (['spec', 'dev', 'git', 'github', 'test', 'quality', 'review', 'docs'].includes(part)) {
      tags.add(part);
    }
  });
  
  // Add tags based on content keywords
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('test') || contentLower.includes('tdd')) tags.add('testing');
  if (contentLower.includes('security') || contentLower.includes('auth')) tags.add('security');  
  if (contentLower.includes('plan') || contentLower.includes('spec')) tags.add('planning');
  if (contentLower.includes('implement') || contentLower.includes('build')) tags.add('implementation');
  if (contentLower.includes('requirement') || contentLower.includes('criteria')) tags.add('requirements');
  if (contentLower.includes('quality') || contentLower.includes('lint')) tags.add('quality');
  
  return Array.from(tags);
}

function determineWhenToUse(content, tags, category) {
  if (category === 'Spec-Driven Development') {
    return 'Complex features requiring structured approach';
  }
  
  if (category === 'Simple Development') {
    return 'Small changes and quick tasks';
  }
  
  if (tags.includes('github')) {
    return 'GitHub workflow and project management';
  }
  
  if (tags.includes('testing')) {
    return 'Setting up tests and TDD workflows';
  }
  
  if (tags.includes('security')) {
    return 'Code quality and security improvements';
  }
  
  return 'General development tasks';
}

function determineExample(content, category, name) {
  if (category === 'Spec-Driven Development') {
    if (name.includes('specify')) {
      return 'Define requirements for user authentication system';
    } else if (name.includes('plan')) {
      return 'Create technical plan for auth implementation';
    } else if (name.includes('tasks')) {
      return 'Break down auth feature into TDD tasks';
    }
  }
  
  if (category === 'GitHub Integration') {
    return 'Create GitHub issue with proper templates';
  }
  
  if (category === 'Simple Development') {
    if (name.includes('implement')) {
      return 'Build feature following established plan';
    } else if (name.includes('refactor')) {
      return 'Add security improvements to API endpoints';
    } else if (name.includes('plan')) {
      return 'Create technical plan for auth implementation';  
    }
  }
  
  if (name.includes('commit')) {
    return 'Create conventional commit for completed feature';
  }
  
  return 'Standard development workflow';
}

function determineRiskLevel(content, tags, name) {
  // HIGH risk indicators
  if (tags.includes('implementation') && name.includes('tasks')) return 'HIGH';
  if (name.includes('implement') && !name.includes('plan')) return 'HIGH';
  
  // MEDIUM risk indicators  
  if (tags.includes('github') && tags.includes('security')) return 'MEDIUM';
  if (tags.includes('planning') && tags.includes('spec')) return 'MEDIUM';
  if (name.includes('plan') || name.includes('specify')) return 'MEDIUM';
  
  // Default to LOW
  return 'LOW';
}

function determineRequiresHITL(content, tags, riskLevel) {
  // Always require HITL for HIGH risk
  if (riskLevel === 'HIGH') return true;
  
  // Require HITL for GitHub operations
  if (tags.includes('github') && tags.includes('security')) return true;
  
  return false;
}

// Run the generator if called directly
if (require.main === module) {
  generateCommandIndex();
}

module.exports = { generateCommandIndex };