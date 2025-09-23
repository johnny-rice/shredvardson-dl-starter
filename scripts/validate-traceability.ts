#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

interface ArtifactMetadata {
  id: string;
  type: 'spec' | 'plan' | 'task';
  issue: number;
  parentId: string;
  links?: string[];
}

interface TraceabilityGraph {
  specs: Map<string, ArtifactMetadata>;
  plans: Map<string, ArtifactMetadata>;
  tasks: Map<string, ArtifactMetadata>;
}

class TraceabilityValidator {
  private graph: TraceabilityGraph = {
    specs: new Map(),
    plans: new Map(),
    tasks: new Map()
  };

  private errors: string[] = [];

  validateTraceability(): { valid: boolean; errors: string[] } {
    try {
      this.loadArtifacts();
      this.validateGraph();
      return { valid: this.errors.length === 0, errors: this.errors };
    } catch (error) {
      this.errors.push(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
      return { valid: false, errors: this.errors };
    }
  }

  private loadArtifacts() {
    this.loadDirectory('specs', 'spec');
    this.loadDirectory('plans', 'plan');
    this.loadDirectory('tasks', 'task');
  }

  private loadDirectory(dirName: string, expectedType: 'spec' | 'plan' | 'task') {
    const dirPath = path.join(process.cwd(), dirName);
    
    if (!fs.existsSync(dirPath)) {
      return; // Directory doesn't exist yet
    }

    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.md') && f !== 'README.md');

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      try {
        const { data } = matter(content);
        
        if (!this.validateMetadata(data, file, expectedType)) {
          continue;
        }

        const metadata = data as ArtifactMetadata;
        const key: keyof TraceabilityGraph = expectedType === 'spec' ? 'specs' : expectedType === 'plan' ? 'plans' : 'tasks';
        this.graph[key].set(metadata.id, metadata);
      } catch (error) {
        this.errors.push(`Failed to parse ${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private validateMetadata(data: any, filename: string, expectedType: 'spec' | 'plan' | 'task'): boolean {
    const required = ['id', 'type', 'issue'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      this.errors.push(`${filename}: Missing required fields: ${missing.join(', ')}`);
      return false;
    }

    if (data.type !== expectedType) {
      this.errors.push(`${filename}: Expected type '${expectedType}', got '${data.type}'`);
      return false;
    }

    // Validate ID format
    const expectedPrefix = expectedType.toUpperCase();
    if (!data.id.startsWith(expectedPrefix + '-')) {
      this.errors.push(`${filename}: ID must start with '${expectedPrefix}-', got '${data.id}'`);
      return false;
    }

    // Validate parentId requirements
    if (expectedType === 'spec') {
      if (data.parentId !== undefined && data.parentId !== '') {
        this.errors.push(`${filename}: Specs should have empty parentId, got '${data.parentId}'`);
        return false;
      }
      data.parentId = ''; // normalize
    }

    if (expectedType !== 'spec' && !data.parentId) {
      this.errors.push(`${filename}: ${expectedType} must have parentId`);
      return false;
    }

    // Normalize issue to number
    if (typeof data.issue !== 'number') {
      const parsed = Number(data.issue);
      if (!Number.isInteger(parsed)) {
        this.errors.push(`${filename}: issue must be an integer, got '${data.issue}'`);
        return false;
      }
      data.issue = parsed;
    }

    return true;
  }

  private validateGraph() {
    // Validate plan parentIds reference existing specs
    for (const [planId, plan] of this.graph.plans) {
      if (!this.graph.specs.has(plan.parentId)) {
        this.errors.push(`Plan ${planId} references non-existent spec: ${plan.parentId}`);
      }
    }

    // Validate task parentIds reference existing plans
    for (const [taskId, task] of this.graph.tasks) {
      if (!this.graph.plans.has(task.parentId)) {
        this.errors.push(`Task ${taskId} references non-existent plan: ${task.parentId}`);
      }
    }

    // Validate issue consistency within chains
    this.validateIssueConsistency();
  }

  private validateIssueConsistency() {
    // Group by issue number and validate consistency
    const issueGroups = new Map<number, { specs: string[]; plans: string[]; tasks: string[] }>();

    // Collect all artifacts by issue
    for (const [id, spec] of this.graph.specs) {
      const group = issueGroups.get(spec.issue) || { specs: [], plans: [], tasks: [] };
      group.specs.push(id);
      issueGroups.set(spec.issue, group);
    }

    for (const [id, plan] of this.graph.plans) {
      const group = issueGroups.get(plan.issue) || { specs: [], plans: [], tasks: [] };
      group.plans.push(id);
      issueGroups.set(plan.issue, group);
    }

    for (const [id, task] of this.graph.tasks) {
      const group = issueGroups.get(task.issue) || { specs: [], plans: [], tasks: [] };
      group.tasks.push(id);
      issueGroups.set(task.issue, group);
    }

    // Validate each issue has complete chain
    for (const [issue, group] of issueGroups) {
      if (group.specs.length === 0) {
        this.errors.push(`Issue #${issue} has plans/tasks but no spec`);
      }
      
      if (group.specs.length > 1) {
        this.errors.push(`Issue #${issue} has multiple specs: ${group.specs.join(', ')}`);
      }
    }
  }

  printSummary() {
    console.log('🔗 Traceability Validation Summary\n');
    console.log(`📋 Specs: ${this.graph.specs.size}`);
    console.log(`🗺️  Plans: ${this.graph.plans.size}`);
    console.log(`✅ Tasks: ${this.graph.tasks.size}`);
    console.log(`🔢 Total Issues: ${new Set([...this.graph.specs.values()].map(s => s.issue)).size}\n`);
    
    if (this.errors.length === 0) {
      console.log('✅ All traceability chains are valid\n');
    } else {
      console.log('❌ Traceability validation failed:\n');
      this.errors.forEach(error => console.log(`  - ${error}`));
      console.log();
    }
  }
}

import { pathToFileURL } from 'node:url';
const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] || '').href;
if (isDirectRun) {
  const validator = new TraceabilityValidator();
  const result = validator.validateTraceability();
  validator.printSummary();
  if (!result.valid) process.exit(1);
}

export { TraceabilityValidator };