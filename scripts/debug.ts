#!/usr/bin/env tsx
// scripts/debug.ts - Debugging utilities with MCP integration

import { Command } from 'commander';

const program = new Command();

program.name('debug').description('Debugging utilities for the DL Starter').version('1.0.0');

// Sentry commands
program
  .command('sentry:test')
  .description('Test Sentry integration with a sample error')
  .action(() => {
    console.log('🔍 Testing Sentry integration...');
    console.log('Visit http://localhost:3000/test-monitoring to test error reporting');
    console.log('Make sure NEXT_PUBLIC_SENTRY_DSN is set in .env.local');
  });

program
  .command('sentry:check')
  .description('Check Sentry configuration')
  .action(() => {
    console.log('🔧 Checking Sentry configuration...');
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    console.log(`SENTRY_DSN: ${dsn ? '✅ Set' : '❌ Missing'}`);
    console.log(`SENTRY_ORG: ${process.env.SENTRY_ORG ? '✅ Set' : '❌ Missing'}`);
    console.log(`SENTRY_PROJECT: ${process.env.SENTRY_PROJECT ? '✅ Set' : '❌ Missing'}`);
  });

// Vercel commands
program
  .command('vercel:status')
  .description('Check Vercel deployment status')
  .action(() => {
    console.log('🚀 Checking Vercel status...');
    console.log('Run: vercel --version to check CLI installation');
    console.log('Run: vercel ls to list projects');
    console.log('Run: vercel env ls to check environment variables');
  });

// Environment commands
program
  .command('env:check')
  .description('Check environment configuration')
  .action(() => {
    console.log('🌍 Environment Configuration:');
    console.log('='.repeat(40));

    // Check essential env vars
    const checks = [
      'NODE_ENV',
      'NEXT_PUBLIC_APP_NAME',
      'NEXT_PUBLIC_SENTRY_DSN',
      'SENTRY_ORG',
      'SENTRY_PROJECT',
    ];

    checks.forEach((key) => {
      const value = process.env[key];
      console.log(
        `${key}: ${value ? '✅' : '❌'} ${value ? `(${value.substring(0, 20)}...)` : 'Not set'}`
      );
    });
  });

// Development helpers
program
  .command('dev:health')
  .description('Check development environment health')
  .action(() => {
    console.log('🏥 Development Health Check:');
    console.log('='.repeat(40));

    // Check Node version
    console.log(`Node.js: ${process.version}`);

    // Check package manager
    try {
      const { execSync } = require('node:child_process');
      const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
      console.log(`pnpm: v${pnpmVersion} ✅`);
    } catch {
      console.log('pnpm: ❌ Not found');
    }

    // Check essential files
    const fs = require('node:fs');
    const essentialFiles = [
      'package.json',
      'next.config.ts',
      'src/lib/env.ts',
      'src/lib/adapters/sentry.ts',
      'sentry.client.config.ts',
      'sentry.server.config.ts',
    ];

    console.log('\nEssential Files:');
    essentialFiles.forEach((file) => {
      console.log(`${file}: ${fs.existsSync(file) ? '✅' : '❌'}`);
    });
  });

// MCP integration commands
program
  .command('mcp:test')
  .description('Test MCP connections')
  .action(() => {
    console.log('🔌 Testing MCP Connections...');
    console.log('Available MCPs:');
    console.log('- Sentry MCP: Error monitoring and debugging');
    console.log('- Vercel MCP: Deployment and project management');
    console.log('- Playwright MCP: Browser automation and testing');
    console.log('- Jam MCP: Bug reporting and user feedback');
    console.log('\nUse Claude Code to test MCP connections directly.');
  });

program.parse();
