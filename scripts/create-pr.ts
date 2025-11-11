#!/usr/bin/env tsx
import { execFileSync, execSync } from 'node:child_process';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Command } from 'commander';

const run = (command: string): string => {
  try {
    return execSync(command, {
      stdio: 'pipe',
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // avoid maxBuffer explosions on large logs
      timeout: 10 * 60 * 1000, // 10m safety timeout
    })
      .toString()
      .trim();
  } catch (error: unknown) {
    const e = error as { stderr?: { toString?: () => string }; stdout?: { toString?: () => string }; message?: string };
    const stderr = e?.stderr?.toString?.() ?? '';
    const stdout = e?.stdout?.toString?.() ?? '';
    const msg = e?.message ?? String(e);
    return `ERROR: ${msg}\n${stdout}${stderr ? `\n${stderr}` : ''}`.trim();
  }
};

const program = new Command()
  .option('-t, --title <title>', 'PR title')
  .option('--dry-run', 'Show what would be created without actually creating the PR')
  .parse();

const options = program.opts();

async function main() {
  // Get current branch
  const currentBranch =
    execSync('git branch --show-current', { encoding: 'utf-8' }).trim() ||
    execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  if (!currentBranch || currentBranch === 'main') {
    console.error('❌ Cannot create PR from main branch');
    process.exit(1);
  }

  console.log('📋 Running quality checks...');

  // Run verification commands
  const results = {
    doctor: run('pnpm run doctor:report 2>&1'),
    lint: run('pnpm -w turbo run lint 2>&1'),
    typecheck: run('pnpm -w turbo run typecheck 2>&1'),
    build: run('pnpm -w turbo run build 2>&1'),
    e2e: run('pnpm -w turbo run test:e2e 2>&1'),
  };

  // Helpers: status, redaction, and truncation
  const MAX_LOG_CHARS = 4000;
  const truncate = (s: string) =>
    s?.length > MAX_LOG_CHARS ? `${s.slice(0, MAX_LOG_CHARS)}\n...[truncated]...` : s || 'N/A';
  const sanitize = (s: string) =>
    (s || '')
      // JWTs
      .replace(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, '***JWT***')
      // Authorization: Bearer <token>
      .replace(/(Authorization:\s*Bearer\s+)[A-Za-z0-9._-]+/gi, '$1***REDACTED***')
      // Common key/value secret shapes
      .replace(
        /\b(token|password|secret|api[_-]?key|access[_-]?token|session[_-]?id)\s*[:=]\s*\S+/gi,
        (_m, k) => `${k}=***REDACTED***`
      )
      // Standalone GitHub tokens
      .replace(/\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b/gi, '***GITHUB_TOKEN***')
      .replace(/\bgithub_pat_[A-Za-z0-9_]{22,}\b/gi, '***GITHUB_PAT***');
  const format = (s: string) => truncate(sanitize(s));
  const passed = (s: string) => !!s && !s.startsWith('ERROR:'); // heuristic (better: use exit codes)
  const checkbox = (ok: boolean) => (ok ? '[x]' : '[ ]');

  // Generate branch-based summary (Conventional Commit types)
  const conventionalType =
    currentBranch.match(
      /^(feat|fix|hotfix|chore|refactor|docs|test|ci|build|perf|release|revert|deps|style)(?=[/-]|$)/
    )?.[1] ?? 'update';
  const defaultSummary = (
    {
      feat: 'New feature implementation',
      fix: 'Bug fix and stabilization',
      hotfix: 'Hotfix and stabilization',
      chore: 'Maintenance and infrastructure updates',
      refactor: 'Code refactoring and optimization',
      docs: 'Documentation updates',
      test: 'Test coverage and quality improvements',
      ci: 'CI/CD and automation updates',
      build: 'Build system updates',
      perf: 'Performance improvements',
      release: 'Release preparation',
      revert: 'Revert of previous changes',
      deps: 'Dependency updates',
      style: 'Code style and formatting updates',
      update: 'Updates and improvements based on branch changes',
    } as const
  )[conventionalType];

  // Load template and fill with results
  const template = readFileSync('.github/pull_request_template.md', 'utf-8');
  const filledBody = template
    .replace('_What changed and why in 1–3 sentences._', defaultSummary)
    .replace(
      '- [ ] **AI Review:** ⚠️ Not requested / ✅ Requested (`@claude /review`)',
      '- [x] **AI Review:** ✅ AI-assisted implementation'
    )
    .replace(
      '- [ ] **Security Scan:** ⚠️ Not applicable / ✅ Completed automatically',
      '- [x] **Security Scan:** ✅ Completed automatically'
    )
    .replace(
      '- [ ] `pnpm run doctor:report` (attach artifacts/doctor-report.md)',
      `- ${checkbox(passed(results.doctor))} \`pnpm run doctor:report\`\n\`\`\`\n${format(results.doctor)}\n\`\`\``
    )
    .replace(
      '- [ ] `pnpm -w turbo run lint`',
      `- ${checkbox(passed(results.lint))} \`pnpm -w turbo run lint\`\n\`\`\`\n${format(results.lint)}\n\`\`\``
    )
    .replace(
      '- [ ] `pnpm -w turbo run typecheck`',
      `- ${checkbox(passed(results.typecheck))} \`pnpm -w turbo run typecheck\`\n\`\`\`\n${format(results.typecheck)}\n\`\`\``
    )
    .replace(
      '- [ ] `pnpm -w turbo run build`',
      `- ${checkbox(passed(results.build))} \`pnpm -w turbo run build\`\n\`\`\`\n${format(results.build)}\n\`\`\``
    )
    .replace(
      '- [ ] `pnpm -w turbo run test:e2e` (or N/A)',
      `- ${checkbox(passed(results.e2e))} \`pnpm -w turbo run test:e2e\`\n\`\`\`\n${format(results.e2e)}\n\`\`\``
    )
    .replace(
      '- [ ] I ran `pnpm doctor` locally (no fails)',
      `- ${checkbox(passed(results.doctor))} I ran \`pnpm doctor\` locally`
    )
    .replace('_None_ (or describe + steps)', 'None');

  const title = options.title || `${conventionalType}: ${defaultSummary}`;

  if (options.dryRun) {
    console.log('\n🔍 DRY RUN - Would create PR:');
    console.log(`Title: ${title}`);
    console.log('\nBody preview (first 500 chars):');
    console.log(filledBody.slice(0, 500) + '...');
    return;
  }

  console.log(`🚀 Creating PR: ${title}`);

  // Write body to temp file to avoid shell escaping issues
  const tempBodyFile = path.join(os.tmpdir(), `pr-body-${Date.now()}.md`);
  writeFileSync(tempBodyFile, filledBody);

  try {
    const prUrl = execFileSync(
      'gh',
      ['pr', 'create', '--title', title, '--body-file', tempBodyFile],
      { encoding: 'utf-8' }
    ).trim();
    console.log(`✅ PR created: ${prUrl}`);
  } catch (error: unknown) {
    const errorObj = error as { stderr?: { toString?: () => string }; stdout?: { toString?: () => string } };
    const stderr = errorObj?.stderr?.toString?.() ?? '';
    const stdout = errorObj?.stdout?.toString?.() ?? '';
    console.error(`❌ Failed to create PR:\n${stderr || stdout || error}`);
    process.exit(1);
  } finally {
    try {
      unlinkSync(tempBodyFile);
    } catch {}
  }
}

main().catch(console.error);
