#!/usr/bin/env tsx

/**
 * CI Database Validation Script
 * 
 * Validates that PRs touching database files include all required components:
 * - Migration SQL files
 * - Updated TypeScript types
 * - RLS policy considerations
 * 
 * Used in GitHub Actions to enforce database change policies
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

interface DatabaseChange {
  migrations: string[];
  typeFiles: string[];
  schemaFiles: string[];
  configFiles: string[];
}

function getChangedFiles(): string[] {
  // Prefer comparing to merge-base with origin/main; fall back to scanning tracked files
  try {
    try {
      execSync('git fetch origin main --depth=1', { stdio: 'ignore' });
    } catch {
      // ignore fetch errors
    }
    const base = execSync(
      'git merge-base origin/main HEAD',
      { encoding: 'utf8', stdio: 'pipe' }
    ).trim();
    const output = execSync(
      `git diff --name-only ${base}...HEAD`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch {
    try {
      const output = execSync(
        'git ls-files',
        { encoding: 'utf8', stdio: 'pipe' }
      );
      return output
        .trim()
        .split('\n')
        .filter(f => f.startsWith('supabase/') || f.startsWith('packages/db/'));
    } catch {
      console.warn('Could not determine changed files; forcing DB validation');
      return ['supabase/config.toml']; // trigger validators instead of skipping
    }
  }
}

function categorizeDatabaseChanges(changedFiles: string[]): DatabaseChange {
  const dbChange: DatabaseChange = {
    migrations: [],
    typeFiles: [],
    schemaFiles: [],
    configFiles: []
  };
  
  changedFiles.forEach(file => {
    if (file.startsWith('supabase/migrations/')) {
      dbChange.migrations.push(file);
    } else if (/^packages\/db\/.*types\.ts$/i.test(file)) {
      dbChange.typeFiles.push(file);
    } else if (file.startsWith('supabase/') && file.endsWith('.sql')) {
      dbChange.schemaFiles.push(file);
    } else if (file.includes('supabase') && (file.endsWith('.toml') || file.endsWith('.json'))) {
      dbChange.configFiles.push(file);
    }
  });
  
  return dbChange;
}

function validateMigrationFiles(migrations: string[]): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [], info: [] };
  
  migrations.forEach(migration => {
    if (!existsSync(migration)) {
      result.errors.push(`Migration file not found: ${migration}`);
      result.valid = false;
      return;
    }
    
    const content = readFileSync(migration, 'utf8');
    
    // Check for RLS considerations
    const hasCreateTable = /create\s+table/i.test(content);
    const enablesRls = /enable\s+row\s+level\s+security/i.test(content);
    if (hasCreateTable && !enablesRls) {
      result.warnings.push(`Migration ${migration} creates tables but doesn't enable RLS`);
    }
    
    // Check for proper transaction wrapping
    if (!/\bbegin(?:\s+transaction)?\b/i.test(content) || !/\b(commit|rollback)\b/i.test(content)) {
      result.warnings.push(`Migration ${migration} should be wrapped in a transaction`);
    }
    
    // Check for dangerous operations
    if (/\bdrop\s+table\b/i.test(content) || /\bdrop\s+column\b/i.test(content)) {
      result.warnings.push(`Migration ${migration} contains potentially destructive operations`);
    }
    
    result.info.push(`Validated migration: ${migration}`);
  });
  
  return result;
}

function validateTypeFiles(typeFiles: string[]): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [], info: [] };
  
  if (typeFiles.length === 0) {
    result.errors.push('Database changes detected but TypeScript types not updated');
    result.errors.push('Run: pnpm db:types to regenerate database types');
    result.valid = false;
  }
  
  typeFiles.forEach(typeFile => {
    if (!existsSync(typeFile)) {
      result.errors.push(`Type file not found: ${typeFile}`);
      result.valid = false;
      return;
    }
    
    const stats = statSync(typeFile);
    const age = Date.now() - stats.mtime.getTime();
    const hoursSinceModified = age / (1000 * 60 * 60);
    
    if (hoursSinceModified > 24) {
      result.warnings.push(`Type file ${typeFile} was last modified ${Math.round(hoursSinceModified)} hours ago`);
      result.warnings.push('Consider regenerating types after recent schema changes');
    }
    
    result.info.push(`Validated type file: ${typeFile}`);
  });
  
  return result;
}

function validateSupabaseConfig(configFiles: string[]): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [], info: [] };
  
  configFiles.forEach(configFile => {
    if (!existsSync(configFile)) {
      result.errors.push(`Config file not found: ${configFile}`);
      result.valid = false;
      return;
    }
    
    if (configFile.endsWith('.toml')) {
      const content = readFileSync(configFile, 'utf8');
      
      // Check for security settings
      if (content.includes('enable_signup = true') && !content.includes('# WARNING')) {
        result.warnings.push(`Config allows public signup - ensure this is intentional`);
      }
      
      // Check for development vs production settings
      if (content.includes('localhost') || content.includes('127.0.0.1')) {
        result.info.push(`Config contains local development URLs`);
      }
    }
    
    result.info.push(`Validated config: ${configFile}`);
  });
  
  return result;
}

function checkRequiredWorkspace(): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [], info: [] };
  
  // Check if database package exists
  const dbPackageJson = 'packages/db/package.json';
  if (!existsSync(dbPackageJson)) {
    result.errors.push('Database package not found at packages/db/');
    result.errors.push('Database changes require the @shared/db workspace package');
    result.valid = false;
  }
  
  // Check if Supabase config exists
  const supabaseConfig = 'supabase/config.toml';
  if (!existsSync(supabaseConfig)) {
    result.warnings.push('Supabase configuration not found - ensure project is properly initialized');
  }
  
  return result;
}

function printResults(results: ValidationResult[], title: string) {
  console.log(`\n🔍 ${title}:`);
  
  results.forEach(result => {
    result.errors.forEach(error => console.log(`❌ ${error}`));
    result.warnings.forEach(warning => console.log(`⚠️  ${warning}`));
    result.info.forEach(info => console.log(`ℹ️  ${info}`));
  });
}

async function main() {
  console.log('🗄️  Database CI Validation');
  console.log('==========================');
  
  const changedFiles = getChangedFiles();
  const dbChanges = categorizeDatabaseChanges(changedFiles);
  
  // Determine if this PR has database changes
  const hasDatabaseChanges = 
    dbChanges.migrations.length > 0 ||
    dbChanges.schemaFiles.length > 0 ||
    dbChanges.configFiles.length > 0;
  
  if (!hasDatabaseChanges) {
    console.log('✅ No database changes detected - skipping validation');
    return;
  }
  
  console.log(`📊 Database changes detected:`);
  console.log(`   Migrations: ${dbChanges.migrations.length}`);
  console.log(`   Type files: ${dbChanges.typeFiles.length}`);
  console.log(`   Schema files: ${dbChanges.schemaFiles.length}`);
  console.log(`   Config files: ${dbChanges.configFiles.length}`);
  
  // Run all validations
  const results = [
    validateMigrationFiles(dbChanges.migrations),
    validateTypeFiles(dbChanges.typeFiles),
    validateSupabaseConfig(dbChanges.configFiles),
    checkRequiredWorkspace()
  ];
  
  // Print results
  printResults(results, 'Migration Files');
  
  // Determine overall result
  const overallValid = results.every(r => r.valid);
  const hasWarnings = results.some(r => r.warnings.length > 0);
  
  if (!overallValid) {
    console.log('\n❌ Database validation failed');
    console.log('Fix the errors above before merging');
    process.exit(1);
  }
  
  if (hasWarnings) {
    console.log('\n⚠️  Database validation passed with warnings');
    console.log('Consider addressing warnings for better practices');
  } else {
    console.log('\n✅ Database validation passed');
  }
  
  console.log('\n📋 Human review required for:');
  console.log('   • Migration correctness and data safety');
  console.log('   • RLS policy effectiveness');
  console.log('   • Performance implications');
  console.log('   • Backward compatibility');
}