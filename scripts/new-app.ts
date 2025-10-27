import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

interface AppConfig {
  APP_NAME: string;
  APP_SLUG: string;
  PRIMARY_DOMAIN: string;
  COMPANY_NAME: string;
  DEFAULT_LOCALE: string;
}

interface WebPackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
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

function createDirectories(appPath: string) {
  const dirs = ['src/app', 'src/app/api/health', 'public', 'docs'];

  dirs.forEach((dir) => {
    mkdirSync(join(appPath, dir), { recursive: true });
  });
}

function createAppFiles(appPath: string, config: AppConfig) {
  // Copy dependencies from apps/web
  const webPackageJsonPath = resolve('apps/web/package.json');
  let webPackageJson: WebPackageJson = {};

  if (existsSync(webPackageJsonPath)) {
    try {
      webPackageJson = JSON.parse(readFileSync(webPackageJsonPath, 'utf8'));
    } catch (_error) {
      console.warn('⚠️  Could not read apps/web/package.json, using fallback deps');
    }
  }

  // package.json
  const packageJson = {
    name: config.APP_SLUG,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint --fix',
      typecheck: 'tsc --noEmit',
      test: 'vitest',
    },
    dependencies: webPackageJson.dependencies || {
      next: '15.5.2',
      react: '19.1.0',
      'react-dom': '19.1.0',
    },
    devDependencies: webPackageJson.devDependencies || {
      '@types/node': '^20',
      '@types/react': '^19',
      '@types/react-dom': '^19',
      eslint: '^9',
      'eslint-config-next': '15.5.2',
      typescript: '^5',
      vitest: '^3.2.4',
    },
  };
  writeFileSync(join(appPath, 'package.json'), JSON.stringify(packageJson, null, 2));

  // tsconfig.json
  const tsconfig = {
    extends: '../../packages/config/tsconfig.json',
    compilerOptions: {
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*'],
        '@ui/*': ['../../packages/ui/*'],
        '@shared/*': ['../../packages/*'],
      },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
    exclude: ['node_modules'],
  };
  writeFileSync(join(appPath, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

  // next.config.ts
  const nextConfig = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ui', '@shared'],
};

export default nextConfig;`;
  writeFileSync(join(appPath, 'next.config.ts'), nextConfig);

  // tailwind.config.ts
  const tailwindConfig = `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,mdx}',
    '../../packages/ui/**/*.{ts,tsx,mdx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;`;
  writeFileSync(join(appPath, 'tailwind.config.ts'), tailwindConfig);

  // src/app/layout.tsx
  const layout = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${config.APP_NAME}',
  description: 'Built with dl-starter',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="${config.DEFAULT_LOCALE}">
      <body>{children}</body>
    </html>
  );
}`;
  writeFileSync(join(appPath, 'src/app/layout.tsx'), layout);

  // src/app/page.tsx
  const page = `export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">${config.APP_NAME}</h1>
        <p className="text-gray-600">Welcome to your new app!</p>
      </div>
    </main>
  );
}`;
  writeFileSync(join(appPath, 'src/app/page.tsx'), page);

  // src/app/error.tsx
  const errorPage = `'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Something went wrong!</h2>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}`;
  writeFileSync(join(appPath, 'src/app/error.tsx'), errorPage);

  // src/app/loading.tsx
  const loading = `export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}`;
  writeFileSync(join(appPath, 'src/app/loading.tsx'), loading);

  // src/app/globals.css
  const globalsCss = `@import '@ui/components/styles/tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;`;
  writeFileSync(join(appPath, 'src/app/globals.css'), globalsCss);

  // src/app/api/health/route.ts
  const healthRoute = `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    app: '${config.APP_SLUG}'
  });
}`;
  writeFileSync(join(appPath, 'src/app/api/health/route.ts'), healthRoute);

  // docs/README.md
  const appDocs = `# ${config.APP_NAME}

## Quickstart

\`\`\`bash
cd apps/${config.APP_SLUG}
pnpm dev
\`\`\`

## Configuration

- **App Name:** ${config.APP_NAME}
- **Domain:** ${config.PRIMARY_DOMAIN}
- **Company:** ${config.COMPANY_NAME}
- **Locale:** ${config.DEFAULT_LOCALE}

## Development

- Dev: \`pnpm turbo run dev --filter=${config.APP_SLUG}\`
- Build: \`pnpm turbo run build --filter=${config.APP_SLUG}\`
- Test: \`pnpm turbo run test --filter=${config.APP_SLUG}\`
`;
  writeFileSync(join(appPath, 'docs/README.md'), appDocs);
}

async function main() {
  const useDefaults = process.argv.includes('--yes') || process.argv.includes('-y');

  console.log('🚀 Creating new app in monorepo (portfolio mode)');
  console.log();

  const config: AppConfig = {
    APP_NAME: useDefaults ? 'My App' : await prompt('App Name', 'My App'),
    APP_SLUG: '',
    PRIMARY_DOMAIN: useDefaults
      ? 'localhost:3000'
      : await prompt('Primary Domain', 'localhost:3000'),
    COMPANY_NAME: useDefaults ? 'Your Company' : await prompt('Company Name', 'Your Company'),
    DEFAULT_LOCALE: useDefaults ? 'en-US' : await prompt('Default Locale', 'en-US'),
  };

  config.APP_SLUG = config.APP_NAME.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const appPath = resolve(`apps/${config.APP_SLUG}`);

  if (existsSync(appPath)) {
    console.error(`❌ App directory already exists: ${appPath}`);
    process.exit(1);
  }

  console.log(`Creating app: ${config.APP_NAME} (${config.APP_SLUG})`);
  console.log(`Location: ${appPath}`);
  console.log();

  mkdirSync(appPath, { recursive: true });
  createDirectories(appPath);
  createAppFiles(appPath, config);

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('pnpm i', { stdio: 'inherit' });
  execSync(`pnpm -F ${config.APP_SLUG} i`, { stdio: 'inherit' });

  // Update constitution checksum
  console.log('🔐 Updating constitution checksum...');
  execSync('pnpm tsx scripts/update-constitution-checksum.ts', { stdio: 'inherit' });

  // Create git branch and initial commit
  const branchName = `feat/${config.APP_SLUG}-scaffold`;
  try {
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync(
      `git commit -m "feat: scaffold ${config.APP_NAME} app

✨ Created apps/${config.APP_SLUG} with:
- Next.js 15 + React 19
- TypeScript & Tailwind CSS  
- Health API endpoint
- Turbo integration

🤖 Generated with Claude Code"`,
      { stdio: 'inherit' }
    );

    console.log();
    console.log('✅ App created successfully!');
    console.log();
    console.log('Next steps:');
    console.log(`1) pnpm turbo run dev --filter=${config.APP_SLUG}`);
    console.log('2) pnpm doctor');
    console.log();
    console.log('📋 Additional setup:');
    console.log('• Fill docs/product/PRD.md with MVP scope');
    console.log('• Plan → Scaffold Tests → Implement → Prepare PR');
    console.log('• Set SENTRY_DSN to enable error tracking (optional)');
  } catch (_error) {
    console.warn('⚠️  Git operations failed, but app was created successfully');
    console.log('Manually commit when ready:');
    console.log(`git add . && git commit -m "feat: scaffold ${config.APP_NAME} app"`);
  }
}

main().catch(console.error);
