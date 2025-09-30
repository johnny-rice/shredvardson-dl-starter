import { readFileSync, existsSync } from 'fs';
import { resolveDoc } from './utils/resolveDoc';

const mustHave = [
  { file: 'README.md', sections: ['CI Overview'] },
  {
    file: 'CONTRIBUTING.md',
    sections: ['Before Opening a PR', 'Development Workflow', 'Quality Standards'],
  },
  { file: 'RELEASING.md', sections: ['Release Flow', 'Troubleshooting'] },
  { file: resolveDoc('CLAUDE.md'), sections: ['Commands Index', 'References'] },
];

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const scripts = Object.keys(pkg.scripts || {});

let failed = false;

for (const { file, sections } of mustHave) {
  if (!existsSync(file)) {
    console.error(`Missing file: ${file}`);
    failed = true;
    continue;
  }

  const txt = readFileSync(file, 'utf8');

  // Check required sections
  for (const s of sections) {
    if (!txt.includes(s)) {
      console.error(`Missing section "${s}" in ${file}`);
      failed = true;
    }
  }

  // Check referenced scripts exist (only `pnpm run <script>` or `pnpm <script>` where script contains colon or dash)
  const scriptMatches = txt.matchAll(/`pnpm (?:run )?([a-zA-Z0-9:.-]*[:-][a-zA-Z0-9:.-]*)`/g);
  for (const [, name] of scriptMatches) {
    if (!scripts.includes(name)) {
      console.error(`Doc ${file} references missing script: ${name}`);
      failed = true;
    }
  }

  // Check turbo commands exist
  const turboMatches = txt.matchAll(/`pnpm turbo run ([a-zA-Z0-9:.-]+)`/g);
  for (const [, name] of turboMatches) {
    if (!scripts.includes(name)) {
      console.error(`Doc ${file} references missing turbo script: ${name}`);
      failed = true;
    }
  }
}

// Check CLAUDE.md command paths exist
const claudePath = resolveDoc('CLAUDE.md');
if (existsSync(claudePath)) {
  const claudeMd = readFileSync(claudePath, 'utf8');
  const commandMatches = claudeMd.matchAll(/→ (\.claude\/commands\/[^\n]+)/g);
  for (const [, path] of commandMatches) {
    if (!existsSync(path)) {
      console.error(`${claudePath} references missing command file: ${path}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('docs:check passed');
