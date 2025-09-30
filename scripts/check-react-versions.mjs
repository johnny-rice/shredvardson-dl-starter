import { execSync } from 'node:child_process';

const out = execSync('pnpm list -r react react-dom --depth -1', { stdio: 'pipe' }).toString();
const lines = out
  .split('\n')
  .filter((l) => l.trim().startsWith('react ') || l.trim().startsWith('react-dom '));
const versions = { react: new Set(), 'react-dom': new Set() };
for (const l of lines) {
  const reactMatch = l.match(/^react (\d+\.\d+\.\d+)/);
  const reactDomMatch = l.match(/^react-dom (\d+\.\d+\.\d+)/);
  if (reactMatch) versions.react.add(reactMatch[1]);
  if (reactDomMatch) versions['react-dom'].add(reactDomMatch[1]);
}
const reactVs = [...versions.react];
const domVs = [...versions['react-dom']];
const ok = reactVs.length === 1 && domVs.length === 1 && reactVs[0] === domVs[0];
if (!ok) {
  console.error('❌ React version mismatch found:', { react: reactVs, reactDom: domVs });
  process.exit(1);
} else {
  console.log('✅ React versions aligned:', reactVs[0]);
}
