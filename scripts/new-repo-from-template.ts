import { execSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';

interface AppConfig {
  APP_NAME: string;
  APP_SLUG: string;
  PRIMARY_DOMAIN: string;
  COMPANY_NAME: string;
  DEFAULT_LOCALE: string;
}

function prompt(question: string, defaultValue?: string): string {
  const readline = require('node:readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const suffix = defaultValue ? ` (${defaultValue})` : '';
    readline.question(`${question}${suffix}: `, (answer: string) => {
      readline.close();
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

function shouldSkipPath(filePath: string): boolean {
  const skipPatterns = [
    '.git',
    'node_modules',
    '.next',
    '.turbo',
    'coverage',
    '.log',
    'dist',
    '.cache',
  ];

  return skipPatterns.some((pattern) => filePath.includes(pattern) || filePath.endsWith('.log'));
}

function copyRecursive(src: string, dest: string): void {
  const stat = statSync(src);

  if (stat.isDirectory()) {
    if (shouldSkipPath(src)) return;

    mkdirSync(dest, { recursive: true });

    const entries = readdirSync(src);
    for (const entry of entries) {
      copyRecursive(join(src, entry), join(dest, entry));
    }
  } else {
    if (shouldSkipPath(src)) return;

    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
  }
}

function replacePlaceholders(filePath: string, config: AppConfig): void {
  if (shouldSkipPath(filePath)) return;

  const stat = statSync(filePath);
  if (!stat.isFile()) return;

  // Only process text files
  const textExtensions = [
    '.md',
    '.json',
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.css',
    '.html',
    '.txt',
    '.yml',
    '.yaml',
  ];
  if (!textExtensions.some((ext) => filePath.endsWith(ext))) return;

  try {
    let content = readFileSync(filePath, 'utf8');

    content = content.replace(/\{\{APP_NAME\}\}/g, config.APP_NAME);
    content = content.replace(/\{\{APP_SLUG\}\}/g, config.APP_SLUG);
    content = content.replace(/\{\{PRIMARY_DOMAIN\}\}/g, config.PRIMARY_DOMAIN);
    content = content.replace(/\{\{COMPANY_NAME\}\}/g, config.COMPANY_NAME);
    content = content.replace(/\{\{DEFAULT_LOCALE\}\}/g, config.DEFAULT_LOCALE);

    // Replace template project name references
    content = content.replace(/dl-starter-new/g, config.APP_SLUG);
    content = content.replace(/dl-starter \(Monorepo\)/g, config.APP_NAME);

    writeFileSync(filePath, content);
  } catch (_error) {
    // Skip binary files or files that can't be read as text
  }
}

function walkDirectory(dir: string, callback: (filePath: string) => void): void {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (shouldSkipPath(fullPath)) continue;

    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walkDirectory(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

async function main() {
  console.log('🚀 Creating new product repo from template (export mode)');
  console.log();

  const config: AppConfig = {
    APP_NAME: await prompt('App Name', 'My App'),
    APP_SLUG: '',
    PRIMARY_DOMAIN: await prompt('Primary Domain', 'myapp.com'),
    COMPANY_NAME: await prompt('Company Name', 'Your Company'),
    DEFAULT_LOCALE: await prompt('Default Locale', 'en-US'),
  };

  config.APP_SLUG = config.APP_NAME.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const sourceDir = process.cwd();
  const targetDir = resolve('..', config.APP_SLUG);

  if (existsSync(targetDir)) {
    console.error(`❌ Target directory already exists: ${targetDir}`);
    process.exit(1);
  }

  console.log(`Creating: ${config.APP_NAME} (${config.APP_SLUG})`);
  console.log(`Source: ${sourceDir}`);
  console.log(`Target: ${targetDir}`);
  console.log();

  // Copy repository
  console.log('📁 Copying repository...');
  mkdirSync(targetDir, { recursive: true });
  copyRecursive(sourceDir, targetDir);

  // Replace placeholders
  console.log('🔄 Replacing placeholders...');
  walkDirectory(targetDir, (filePath) => {
    replacePlaceholders(filePath, config);
  });

  // Update package.json name
  const packageJsonPath = join(targetDir, 'package.json');
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    packageJson.name = config.APP_SLUG;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  try {
    execSync('pnpm i', { cwd: targetDir, stdio: 'inherit' });
  } catch (_error) {
    console.warn('⚠️  Failed to install dependencies. Run manually: pnpm i');
  }

  // Initialize git (optional)
  try {
    execSync('git init', { cwd: targetDir, stdio: 'pipe' });
    execSync('git add .', { cwd: targetDir, stdio: 'pipe' });
    execSync(
      `git commit -m "chore: initial commit from dl-starter template

✨ ${config.APP_NAME} created from template
🔧 Configuration applied for ${config.PRIMARY_DOMAIN}

🤖 Generated with Claude Code"`,
      { cwd: targetDir, stdio: 'pipe' }
    );

    console.log('📝 Git repository initialized with initial commit');
  } catch (_error) {
    console.log('📝 Git initialization skipped (run git init manually if needed)');
  }

  console.log();
  console.log('✅ New product repo created successfully!');
  console.log();
  console.log('Next Steps:');
  console.log(`1. cd ../${config.APP_SLUG}`);
  console.log('2. Fill docs/product/PRD.md with MVP scope');
  console.log('3. pnpm tsx scripts/starter-doctor.ts');
  console.log('4. pnpm dev');
  console.log();
  console.log('Optional:');
  console.log(`- git remote add origin https://github.com/yourusername/${config.APP_SLUG}.git`);
  console.log(`- gh repo create ${config.APP_SLUG} --push`);
}

main().catch(console.error);
