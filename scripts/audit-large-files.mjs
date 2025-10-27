#!/usr/bin/env node
import { execSync } from 'node:child_process';

// Configurable limits and allowlist via environment variables
const BAD_LIMIT = Number.parseInt(process.env.AUDIT_LARGE_LIMIT_BYTES ?? '', 10) || 5 * 1024 * 1024; // 5MB default; override via env

const ALLOW_PREFIXES = (
  process.env.AUDIT_LARGE_ALLOW_PREFIXES ?? 'public/,docs/reports/,apps/web/public/,.turbo/,bin/'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const out = execSync(
  'git rev-list --objects --all | ' +
    `git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | ` +
    `awk '$1=="blob"{path=substr($0, index($0, $4)); print $3 "\\t" path}' | LC_ALL=C sort -nr | head -50`,
  { stdio: ['ignore', 'pipe', 'inherit'] }
).toString();

const rows = out
  .trim()
  .split('\n')
  .map((l) => {
    const [size, ...pathParts] = l.split('\t');
    return { size: Number(size), path: pathParts.join('\t') };
  });

const bad = [];
for (const r of rows) {
  const allow = ALLOW_PREFIXES.some((p) => r.path.startsWith(p));
  const isBackup = r.path.includes('backup-') || r.path.endsWith('.bundle');

  // Allow files in approved prefixes, but warn about backup files
  if (isBackup) {
    console.warn(`⚠️ Backup file found in git history: ${r.path} (${r.size} bytes)`);
    console.warn('   Consider using: git filter-branch or BFG to remove from history');
  } else if (!allow && r.size > BAD_LIMIT) {
    bad.push(r);
  }
}

// Note: This audits Git blobs only; Git LFS objects appear as small pointer files
console.log(
  `Top 50 largest blobs (limit: ${BAD_LIMIT} bytes, allowed: ${ALLOW_PREFIXES.join(', ')}):\n`
);
rows.forEach((r) => console.log(`${r.size}\t${r.path}`));

if (bad.length) {
  console.error(`\n❌ Large files over ${BAD_LIMIT} bytes outside allowed dirs:`);
  bad.forEach((r) => console.error(` - ${r.size}\t${r.path}`));
  process.exitCode = 1; // fail CI
}
