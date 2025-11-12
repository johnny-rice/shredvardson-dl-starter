#!/usr/bin/env npx tsx

/**
 * Prerequisites Validation Script
 *
 * Validates prerequisites for running the DL Starter project, ensuring
 * developers have all required tools and configurations before starting.
 *
 * Usage:
 *   pnpm preflight:check
 *   npx tsx scripts/check-prerequisites.ts [--verbose]
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// Types
interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string[];
}

// Configuration
const PROJECT_ROOT = process.cwd();
const REQUIRED_NODE_VERSION = '>=20.0.0';
const REQUIRED_PNPM_VERSION = '>=9.0.0';

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

/**
 * Compare version strings with semantic versioning support.
 * Note: This function only supports '>=' comparisons regardless of the operator in `required`.
 * All current requirements use >= semantics (Node 20+, pnpm 9+), so this is sufficient.
 *
 * @param current - Current installed version (e.g., "v20.5.1" or "9.12.0")
 * @param required - Required version string (e.g., ">=20.0.0" or ">=9.0.0")
 * @returns true if current >= required, false otherwise
 */
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

  return true; // Equal versions pass for >= comparison
}

// Prerequisite checks
async function checkNodeVersion(): Promise<CheckResult> {
  try {
    const version = await execCommand('node', ['--version']);
    const isValid = compareVersions(version, REQUIRED_NODE_VERSION);

    return {
      name: 'Node.js',
      status: isValid ? 'pass' : 'fail',
      message: isValid
        ? `${version} (required: ${REQUIRED_NODE_VERSION})`
        : `${version} does not meet requirements`,
      details: isValid
        ? []
        : [
            `Required: ${REQUIRED_NODE_VERSION}`,
            'Install nvm: https://github.com/nvm-sh/nvm',
            'Then run: nvm install 20 && nvm use 20',
          ],
    };
  } catch {
    return {
      name: 'Node.js',
      status: 'fail',
      message: 'Not found',
      details: [
        'Install nvm: https://github.com/nvm-sh/nvm',
        'Then run: nvm install 20 && nvm use 20',
      ],
    };
  }
}

async function checkPnpmVersion(): Promise<CheckResult> {
  try {
    const version = await execCommand('pnpm', ['--version']);
    const isValid = compareVersions(`v${version}`, REQUIRED_PNPM_VERSION);

    return {
      name: 'pnpm',
      status: isValid ? 'pass' : 'fail',
      message: isValid
        ? `${version} (required: ${REQUIRED_PNPM_VERSION})`
        : `${version} does not meet requirements`,
      details: isValid
        ? []
        : [
            `Required: ${REQUIRED_PNPM_VERSION}`,
            'Install: npm install -g pnpm@latest',
            'Or visit: https://pnpm.io/installation',
          ],
    };
  } catch {
    return {
      name: 'pnpm',
      status: 'fail',
      message: 'Not found',
      details: ['Install: npm install -g pnpm@latest', 'Or visit: https://pnpm.io/installation'],
    };
  }
}

async function checkDocker(): Promise<CheckResult> {
  try {
    const version = await execCommand('docker', ['--version']);
    return {
      name: 'Docker',
      status: 'pass',
      message: version.split(',')[0], // Show "Docker version X.Y.Z"
    };
  } catch {
    return {
      name: 'Docker',
      status: 'fail',
      message: 'Not found (required for Supabase)',
      details: [
        'Install Docker Desktop: https://docs.docker.com/get-docker/',
        'Docker is required to run Supabase locally (pnpm db:start)',
      ],
    };
  }
}

async function checkDockerRunning(): Promise<CheckResult> {
  try {
    await execCommand('docker', ['info']);
    return {
      name: 'Docker Daemon',
      status: 'pass',
      message: 'Running',
    };
  } catch {
    return {
      name: 'Docker Daemon',
      status: 'fail',
      message: 'Not running',
      details: [
        'Start Docker Desktop and try again',
        'Or run: sudo systemctl start docker (Linux)',
      ],
    };
  }
}

async function checkGitConfig(): Promise<CheckResult> {
  const issues: string[] = [];
  const details: string[] = [];

  try {
    const userName = await execCommand('git', ['config', 'user.name']);
    if (userName) {
      details.push(`✓ user.name: ${userName}`);
    } else {
      issues.push('user.name not set');
      details.push('Set with: git config --global user.name "Your Name"');
    }
  } catch {
    issues.push('user.name not set');
    details.push('Set with: git config --global user.name "Your Name"');
  }

  try {
    const userEmail = await execCommand('git', ['config', 'user.email']);
    if (userEmail) {
      details.push(`✓ user.email: ${userEmail}`);
    } else {
      issues.push('user.email not set');
      details.push('Set with: git config --global user.email "you@example.com"');
    }
  } catch {
    issues.push('user.email not set');
    details.push('Set with: git config --global user.email "you@example.com"');
  }

  return {
    name: 'Git Configuration',
    status: issues.length === 0 ? 'pass' : 'fail',
    message: issues.length === 0 ? 'Configured' : `Missing: ${issues.join(', ')}`,
    details: issues.length > 0 ? details : [],
  };
}

async function checkEnvFile(): Promise<CheckResult> {
  const envPath = join(PROJECT_ROOT, '.env.local');
  const envExamplePath = join(PROJECT_ROOT, '.env.example');

  if (existsSync(envPath)) {
    return {
      name: 'Environment File',
      status: 'pass',
      message: '.env.local exists',
    };
  }

  return {
    name: 'Environment File',
    status: 'fail',
    message: '.env.local not found',
    details: existsSync(envExamplePath)
      ? ['Copy: cp .env.example .env.local', 'Then configure your environment variables']
      : ['Create .env.local with required environment variables'],
  };
}

async function checkSupabaseCLI(): Promise<CheckResult> {
  try {
    const version = await execCommand('supabase', ['--version']);
    return {
      name: 'Supabase CLI',
      status: 'pass',
      message: version,
    };
  } catch {
    return {
      name: 'Supabase CLI',
      status: 'fail',
      message: 'Not found',
      details: [
        'Install: pnpm install -g supabase',
        'Or visit: https://supabase.com/docs/guides/cli/getting-started',
        'Required for database commands (pnpm db:start)',
      ],
    };
  }
}

async function checkDependenciesInstalled(): Promise<CheckResult> {
  const nodeModulesPath = join(PROJECT_ROOT, 'node_modules');

  if (existsSync(nodeModulesPath)) {
    return {
      name: 'Dependencies',
      status: 'pass',
      message: 'Installed',
    };
  }

  return {
    name: 'Dependencies',
    status: 'fail',
    message: 'Not installed',
    details: ['Run: pnpm install'],
  };
}

// Main execution
async function runChecks(options: { verbose?: boolean } = {}): Promise<void> {
  console.log('🔍 DL Starter Prerequisites Check\n');

  const checks = [
    checkNodeVersion,
    checkPnpmVersion,
    checkGitConfig,
    checkDocker,
    checkDockerRunning,
    checkSupabaseCLI,
    checkDependenciesInstalled,
    checkEnvFile,
  ];

  const results: CheckResult[] = [];

  for (const check of checks) {
    const result = await check();
    results.push(result);

    const statusIcon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
    console.log(`${statusIcon} ${result.name}: ${result.message}`);

    if (
      (options.verbose || result.status !== 'pass') &&
      result.details &&
      result.details.length > 0
    ) {
      result.details.forEach((detail) => {
        console.log(`   ${detail}`);
      });
    }
  }

  // Summary
  const passed = results.filter((r) => r.status === 'pass').length;
  const warned = results.filter((r) => r.status === 'warn').length;
  const failed = results.filter((r) => r.status === 'fail').length;

  console.log('\n📊 Summary:');
  console.log(`   ✅ Passed: ${passed}/${results.length}`);
  if (warned > 0) console.log(`   ⚠️ Warnings: ${warned}`);
  if (failed > 0) console.log(`   ❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Prerequisites check failed. Please address the issues above.\n');
    process.exit(1);
  } else if (warned > 0) {
    console.log('\n⚠️ Prerequisites check passed with warnings.\n');
    process.exit(0);
  } else {
    console.log('\n✅ All prerequisites met! Ready to start development.\n');
    console.log('Next steps:');
    console.log('  1. Start Supabase: pnpm db:start');
    console.log('  2. Start dev server: pnpm dev');
    console.log('  3. Visit: http://localhost:3000\n');
    process.exit(0);
  }
}

// CLI handling
function parseArgs(): { verbose?: boolean } {
  const args = process.argv.slice(2);
  const options: { verbose?: boolean } = {};

  if (args.includes('--verbose') || args.includes('-v')) {
    options.verbose = true;
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
DL Starter Prerequisites Check

USAGE:
  pnpm preflight:check [OPTIONS]
  npx tsx scripts/check-prerequisites.ts [OPTIONS]

OPTIONS:
  --verbose   Show detailed information for all checks
  --help      Show this help message

DESCRIPTION:
  Validates that all required tools and configurations are in place
  for running the DL Starter project, including Node.js, pnpm, Docker,
  Git configuration, and environment setup.

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
    console.error('❌ Prerequisites check failed:', error.message);
    process.exit(1);
  });
}

export { runChecks, type CheckResult };
