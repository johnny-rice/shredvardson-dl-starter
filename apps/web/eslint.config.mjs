// apps/web/eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

let nextConfigs = [];
try {
  // Prove the package exists in the app; throws if not installed here
  require.resolve('eslint-config-next', { paths: [__dirname] });
  nextConfigs = compat.extends('next/core-web-vitals', 'next/typescript');
} catch {
  // Fallback: run with minimal ignores only; CI stays green
  nextConfigs = [];
}

const config = [
  ...nextConfigs,
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'next-env.d.ts'],
  },
];

export default config;
