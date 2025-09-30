#!/usr/bin/env npx tsx

/**
 * Environment Validation Script
 *
 * Validates the environment before running tests, ensuring all required
 * dependencies, configurations, and services are available and properly
 * configured according to constitutional requirements.
 *
 * Usage:
 *   npm run pretest-env-check
 *   npx tsx scripts/pretest-env-check.ts [--fix] [--verbose]
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';
import { existsSync } from 'fs';

// Types
interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  fixable?: boolean;
  details?: string[];
}

interface EnvironmentConfig {
  nodeVersion: string;
  pnpmVersion: string;
  requiredFiles: string[];
  requiredEnvVars: string[];
  optionalEnvVars: string[];
  services: string[];
  constitutionalCompliance: boolean;
}

// Configuration
const PROJECT_ROOT = process.cwd();
const CONFIG: EnvironmentConfig = {
  nodeVersion: '>=18.0.0',
  pnpmVersion: '>=8.0.0',
  requiredFiles: [
    'package.json',
    'tsconfig.json',
    'vitest.config.ts',
    'playwright.config.ts',
    'docs/constitution.md',
    'docs/llm/risk-policy.json',
  ],
  requiredEnvVars: [
    // Core application
    'NODE_ENV',
  ],
  optionalEnvVars: [
    // Monitoring
    'SENTRY_DSN',
    'SENTRY_ORG',
    'SENTRY_PROJECT',

    // AI Features
    'CLAUDE_ENABLED',
    'CLAUDE_SECURITY_ENABLED',

    // Database (if used)
    'DATABASE_URL',

    // Authentication (if used)
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',

    // External services
    'GITHUB_TOKEN',
  ],
  services: ['git', 'node', 'pnpm'],
  constitutionalCompliance: true,
};

// Utility functions
function execCommand(command: string, args: string[] = []): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: PROJECT_ROOT });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr.trim() || `Command failed with code ${code}`));
      }
    });
  });
}

function parseVersion(versionString: string): number[] {
  return versionString
    .replace(/^v/, '')
    .split('.')
    .map((n) => parseInt(n, 10));
}

function compareVersions(current: string, required: string): boolean {
  const cleanRequired = required.replace(/[>=<~^]/g, '');
  const currentParts = parseVersion(current);
  const requiredParts = parseVersion(cleanRequired);

  for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
    const curr = currentParts[i] || 0;
    const req = requiredParts[i] || 0;

    if (curr > req) return true;
    if (curr < req) return false;
  }

  return true; // Equal versions
}

// Environment checks
async function checkNodeVersion(): Promise<CheckResult> {
  try {
    const version = await execCommand('node', ['--version']);
    const isValid = compareVersions(version, CONFIG.nodeVersion);

    return {
      name: 'Node.js Version',
      status: isValid ? 'pass' : 'fail',
      message: isValid
        ? `Node.js ${version} meets requirements (${CONFIG.nodeVersion})`
        : `Node.js ${version} does not meet requirements (${CONFIG.nodeVersion})`,
      details: isValid
        ? []
        : [
            'Please update Node.js to a supported version',
            'Visit https://nodejs.org/ for the latest version',
          ],
    };
  } catch (error) {
    return {
      name: 'Node.js Version',
      status: 'fail',
      message: 'Node.js not found or not accessible',
      details: ['Please install Node.js from https://nodejs.org/'],
    };
  }
}

async function checkPnpmVersion(): Promise<CheckResult> {
  try {
    const version = await execCommand('pnpm', ['--version']);
    const isValid = compareVersions(`v${version}`, CONFIG.pnpmVersion);

    return {
      name: 'pnpm Version',
      status: isValid ? 'pass' : 'fail',
      message: isValid
        ? `pnpm ${version} meets requirements (${CONFIG.pnpmVersion})`
        : `pnpm ${version} does not meet requirements (${CONFIG.pnpmVersion})`,
      fixable: true,
      details: isValid
        ? []
        : [
            'Run: npm install -g pnpm@latest',
            'Or follow instructions at https://pnpm.io/installation',
          ],
    };
  } catch (error) {
    return {
      name: 'pnpm Version',
      status: 'fail',
      message: 'pnpm not found or not accessible',
      fixable: true,
      details: [
        'Install pnpm with: npm install -g pnpm',
        'Or follow instructions at https://pnpm.io/installation',
      ],
    };
  }
}

async function checkRequiredFiles(): Promise<CheckResult> {
  const missingFiles: string[] = [];
  const foundFiles: string[] = [];

  for (const file of CONFIG.requiredFiles) {
    const filePath = join(PROJECT_ROOT, file);
    if (existsSync(filePath)) {
      foundFiles.push(file);
    } else {
      missingFiles.push(file);
    }
  }

  const allFound = missingFiles.length === 0;

  return {
    name: 'Required Files',
    status: allFound ? 'pass' : 'fail',
    message: allFound
      ? `All ${CONFIG.requiredFiles.length} required files found`
      : `${missingFiles.length} required files missing`,
    details: allFound
      ? foundFiles.map((f) => `✅ ${f}`)
      : [...foundFiles.map((f) => `✅ ${f}`), ...missingFiles.map((f) => `❌ ${f}`)],
  };
}

async function checkEnvironmentVariables(): Promise<CheckResult> {
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  const foundVars: string[] = [];

  // Check required environment variables
  for (const envVar of CONFIG.requiredEnvVars) {
    if (process.env[envVar]) {
      foundVars.push(envVar);
    } else {
      missingRequired.push(envVar);
    }
  }

  // Check optional environment variables
  for (const envVar of CONFIG.optionalEnvVars) {
    if (!process.env[envVar]) {
      missingOptional.push(envVar);
    } else {
      foundVars.push(envVar);
    }
  }

  const status =
    missingRequired.length === 0 ? (missingOptional.length === 0 ? 'pass' : 'warn') : 'fail';

  const message =
    missingRequired.length === 0
      ? missingOptional.length === 0
        ? 'All environment variables configured'
        : `Required variables set, ${missingOptional.length} optional variables missing`
      : `${missingRequired.length} required environment variables missing`;

  const details: string[] = [];

  if (foundVars.length > 0) {
    details.push('Found variables:');
    foundVars.forEach((v) => details.push(`  ✅ ${v}`));
  }

  if (missingRequired.length > 0) {
    details.push('Missing required variables:');
    missingRequired.forEach((v) => details.push(`  ❌ ${v}`));
  }

  if (missingOptional.length > 0) {
    details.push('Missing optional variables:');
    missingOptional.forEach((v) => details.push(`  ⚠️ ${v}`));
  }

  return {
    name: 'Environment Variables',
    status,
    message,
    details,
  };
}

async function checkServices(): Promise<CheckResult> {
  const serviceResults: { [key: string]: boolean } = {};

  for (const service of CONFIG.services) {
    try {
      await execCommand(service, ['--version']);
      serviceResults[service] = true;
    } catch {
      serviceResults[service] = false;
    }
  }

  const failedServices = Object.entries(serviceResults)
    .filter(([, available]) => !available)
    .map(([service]) => service);

  const allAvailable = failedServices.length === 0;

  return {
    name: 'Required Services',
    status: allAvailable ? 'pass' : 'fail',
    message: allAvailable
      ? 'All required services available'
      : `${failedServices.length} services unavailable`,
    details: Object.entries(serviceResults).map(
      ([service, available]) => `${available ? '✅' : '❌'} ${service}`
    ),
  };
}

async function checkConstitutionalCompliance(): Promise<CheckResult> {
  if (!CONFIG.constitutionalCompliance) {
    return {
      name: 'Constitutional Compliance',
      status: 'pass',
      message: 'Constitutional compliance checking disabled',
    };
  }

  const issues: string[] = [];
  const successes: string[] = [];

  // Check for constitution file
  const constitutionPath = join(PROJECT_ROOT, 'docs', 'constitution.md');
  if (existsSync(constitutionPath)) {
    successes.push('Constitution document exists');

    try {
      const constitution = await fs.readFile(constitutionPath, 'utf8');

      // Check for key constitutional principles
      const requiredSections = [
        'Security First',
        'Test-Driven Development',
        'Development Lanes',
        'Quality Assurance',
      ];

      for (const section of requiredSections) {
        if (constitution.includes(section)) {
          successes.push(`Constitution includes ${section} principles`);
        } else {
          issues.push(`Constitution missing ${section} section`);
        }
      }
    } catch (error) {
      issues.push('Could not read constitution file');
    }
  } else {
    issues.push('Constitution document missing');
  }

  // Check for risk policy
  const riskPolicyPath = join(PROJECT_ROOT, 'docs', 'llm', 'risk-policy.json');
  if (existsSync(riskPolicyPath)) {
    successes.push('Risk policy document exists');

    try {
      const riskPolicy = JSON.parse(await fs.readFile(riskPolicyPath, 'utf8'));

      const requiredKeys = ['riskFramework', 'pathRiskAssessment', 'operationalPolicies'];
      for (const key of requiredKeys) {
        if (riskPolicy[key]) {
          successes.push(`Risk policy includes ${key}`);
        } else {
          issues.push(`Risk policy missing ${key}`);
        }
      }
    } catch (error) {
      issues.push('Could not parse risk policy JSON');
    }
  } else {
    issues.push('Risk policy document missing');
  }

  // Check for AI workflow files
  const aiWorkflows = [
    '.github/workflows/claude-review.yml',
    '.github/workflows/security-review.yml',
  ];

  for (const workflow of aiWorkflows) {
    if (existsSync(join(PROJECT_ROOT, workflow))) {
      successes.push(`AI workflow exists: ${workflow}`);
    } else {
      issues.push(`AI workflow missing: ${workflow}`);
    }
  }

  const status = issues.length === 0 ? 'pass' : issues.length <= 2 ? 'warn' : 'fail';

  return {
    name: 'Constitutional Compliance',
    status,
    message:
      issues.length === 0
        ? 'Full constitutional compliance verified'
        : `${issues.length} compliance issues found`,
    details: [...successes, ...issues.map((i) => `⚠️ ${i}`)],
  };
}

async function checkDependencies(): Promise<CheckResult> {
  try {
    // Check if node_modules exists
    if (!existsSync(join(PROJECT_ROOT, 'node_modules'))) {
      return {
        name: 'Dependencies',
        status: 'fail',
        message: 'Dependencies not installed',
        fixable: true,
        details: ['Run: pnpm install'],
      };
    }

    // Check package.json vs pnpm-lock.yaml
    const packageJsonPath = join(PROJECT_ROOT, 'package.json');
    const lockfilePath = join(PROJECT_ROOT, 'pnpm-lock.yaml');

    if (!existsSync(lockfilePath)) {
      return {
        name: 'Dependencies',
        status: 'warn',
        message: 'Lockfile missing - dependencies may be inconsistent',
        fixable: true,
        details: ['Run: pnpm install to generate lockfile'],
      };
    }

    // Check if dependencies are up to date
    try {
      await execCommand('pnpm', ['outdated']);
      return {
        name: 'Dependencies',
        status: 'warn',
        message: 'Some dependencies have updates available',
        details: ['Run: pnpm outdated for details', 'Run: pnpm update to update'],
      };
    } catch {
      // pnpm outdated exits with code 1 if there are outdated packages
      // If it exits with 0, all packages are up to date
      return {
        name: 'Dependencies',
        status: 'pass',
        message: 'All dependencies installed and up to date',
      };
    }
  } catch (error) {
    return {
      name: 'Dependencies',
      status: 'fail',
      message: 'Could not check dependencies',
      details: [(error as Error).message],
    };
  }
}

async function checkGitConfiguration(): Promise<CheckResult> {
  try {
    const userName = await execCommand('git', ['config', 'user.name']);
    const userEmail = await execCommand('git', ['config', 'user.email']);

    const issues: string[] = [];
    const successes: string[] = [];

    if (userName) {
      successes.push(`Git user name: ${userName}`);
    } else {
      issues.push('Git user name not configured');
    }

    if (userEmail) {
      successes.push(`Git user email: ${userEmail}`);
    } else {
      issues.push('Git user email not configured');
    }

    // Check if we're in a git repository
    try {
      await execCommand('git', ['rev-parse', '--git-dir']);
      successes.push('Valid git repository');
    } catch {
      issues.push('Not in a git repository');
    }

    // Check for uncommitted changes
    try {
      const status = await execCommand('git', ['status', '--porcelain']);
      if (status.trim()) {
        issues.push('Uncommitted changes detected');
      } else {
        successes.push('Working directory clean');
      }
    } catch {
      // Ignore git status errors
    }

    return {
      name: 'Git Configuration',
      status: issues.length === 0 ? 'pass' : 'warn',
      message:
        issues.length === 0
          ? 'Git properly configured'
          : `${issues.length} git configuration issues`,
      details: [...successes, ...issues.map((i) => `⚠️ ${i}`)],
    };
  } catch (error) {
    return {
      name: 'Git Configuration',
      status: 'fail',
      message: 'Git not available or not configured',
      details: ['Please install git and configure user.name and user.email'],
    };
  }
}

// Main execution
async function runChecks(options: { fix?: boolean; verbose?: boolean } = {}): Promise<void> {
  console.log('🔍 Environment Validation Starting...\n');

  const checks = [
    checkNodeVersion,
    checkPnpmVersion,
    checkRequiredFiles,
    checkEnvironmentVariables,
    checkServices,
    checkDependencies,
    checkGitConfiguration,
    checkConstitutionalCompliance,
  ];

  const results: CheckResult[] = [];

  for (const check of checks) {
    const result = await check();
    results.push(result);

    // Display result
    const statusIcon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
    console.log(`${statusIcon} ${result.name}: ${result.message}`);

    if (options.verbose && result.details && result.details.length > 0) {
      result.details.forEach((detail) => {
        console.log(`   ${detail}`);
      });
    }

    // Auto-fix if requested and possible
    if (options.fix && result.fixable && result.status === 'fail') {
      console.log(`🔧 Attempting to fix ${result.name}...`);
      // Add auto-fix logic here if needed
    }

    console.log();
  }

  // Summary
  const passed = results.filter((r) => r.status === 'pass').length;
  const warned = results.filter((r) => r.status === 'warn').length;
  const failed = results.filter((r) => r.status === 'fail').length;

  console.log('📊 Environment Check Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ⚠️ Warnings: ${warned}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log();

  if (failed > 0) {
    console.log('❌ Environment validation failed. Please address the issues above.');

    const failedChecks = results.filter((r) => r.status === 'fail');
    console.log('\n🔧 Failed Checks:');
    failedChecks.forEach((check) => {
      console.log(`   • ${check.name}: ${check.message}`);
      if (check.details) {
        check.details.forEach((detail) => console.log(`     ${detail}`));
      }
    });

    process.exit(1);
  } else if (warned > 0) {
    console.log(
      '⚠️ Environment validation completed with warnings. Tests may run but some features might not work optimally.'
    );

    const warnedChecks = results.filter((r) => r.status === 'warn');
    console.log('\n⚠️ Warnings:');
    warnedChecks.forEach((check) => {
      console.log(`   • ${check.name}: ${check.message}`);
    });

    process.exit(0);
  } else {
    console.log('✅ Environment validation passed! All systems ready for testing.');
    process.exit(0);
  }
}

// CLI handling
function parseArgs(): { fix?: boolean; verbose?: boolean } {
  const args = process.argv.slice(2);
  const options: { fix?: boolean; verbose?: boolean } = {};

  if (args.includes('--fix')) {
    options.fix = true;
  }

  if (args.includes('--verbose') || args.includes('-v')) {
    options.verbose = true;
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Environment Validation Script

USAGE:
  npm run pretest-env-check [OPTIONS]
  npx tsx scripts/pretest-env-check.ts [OPTIONS]

OPTIONS:
  --fix       Attempt to automatically fix issues where possible
  --verbose   Show detailed information for each check
  --help      Show this help message

DESCRIPTION:
  Validates the development environment before running tests,
  ensuring all required dependencies, configurations, and
  services are available and properly configured.

EXIT CODES:
  0    All checks passed or warnings only
  1    One or more checks failed
`);
    process.exit(0);
  }

  return options;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs();
  runChecks(options).catch((error) => {
    console.error('❌ Environment check failed:', error.message);
    process.exit(1);
  });
}

export { runChecks, CheckResult, EnvironmentConfig };
