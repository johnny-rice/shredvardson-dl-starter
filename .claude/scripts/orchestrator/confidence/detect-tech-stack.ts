import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import type { TechStack } from './types';

/**
 * Zod schema for tech stack validation
 */
export const TechStackSchema = z.object({
  libraries: z.array(z.string().max(100)).max(20),
  deployment: z.string().nullable(),
});

/**
 * Cache for tech stack detection results (per session)
 */
const techStackCache = new Map<string, TechStack>();

/**
 * Key libraries to detect from package.json
 */
const KEY_LIBRARIES = [
  'next',
  'react',
  'vue',
  'svelte',
  'angular',
  '@supabase/supabase-js',
  'firebase',
  'express',
  'fastify',
  'nestjs',
  'prisma',
  'drizzle-orm',
  'typeorm',
  'tailwindcss',
  'shadcn',
  'chakra-ui',
  'mui',
];

/**
 * Deployment platform keywords to scan for in ADRs
 */
const DEPLOYMENT_KEYWORDS = {
  vercel: ['vercel', 'vercel.json', 'vercel deploy'],
  netlify: ['netlify', 'netlify.toml', 'netlify deploy'],
  railway: ['railway', 'railway.json'],
  render: ['render', 'render.yaml'],
  aws: ['aws', 'cloudfront', 'lambda', 'ec2'],
  gcp: ['google cloud', 'gcp', 'cloud run'],
  azure: ['azure', 'microsoft cloud'],
  'fly.io': ['fly.io', 'fly.toml'],
  cloudflare: ['cloudflare', 'workers', 'pages'],
};

/**
 * Detects a project's libraries and deployment platform by inspecting package.json and ADR markdown files.
 *
 * @param projectRoot - Root directory of the project to inspect
 * @param sessionId - Optional session identifier used to cache the result for the session
 * @returns TechStack object containing detected library names (limited to 20) and the detected deployment platform, or `null` for deployment if none was found
 */
export async function detectTechStack(
  projectRoot: string = process.cwd(),
  sessionId?: string
): Promise<TechStack> {
  // Check cache
  const cacheKey = sessionId || projectRoot;
  const cached = techStackCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const libraries: string[] = [];
  let deployment: string | null = null;

  // 1. Parse package.json for libraries
  try {
    const packageJsonPath = join(projectRoot, 'package.json');
    await access(packageJsonPath);
    const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Extract key libraries
    for (const lib of KEY_LIBRARIES) {
      if (allDeps[lib] || allDeps[`@${lib}`]) {
        libraries.push(lib);
      }
    }

    // Special handling for frameworks
    if (allDeps.next) libraries.push('Next.js');
    if (allDeps['@supabase/supabase-js']) libraries.push('Supabase');
    if (allDeps.tailwindcss) libraries.push('Tailwind CSS');
  } catch (error) {
    // Package.json not found or invalid - graceful fallback
    console.warn('Could not read package.json:', error);
  }

  // 2. Scan ADRs for deployment keywords
  try {
    const adrPath = join(projectRoot, 'docs', 'adr');
    await access(adrPath);

    const { readdir } = await import('node:fs/promises');
    const adrFiles = await readdir(adrPath);

    for (const file of adrFiles) {
      if (file.endsWith('.md')) {
        const content = await readFile(join(adrPath, file), 'utf-8');
        const contentLower = content.toLowerCase();

        // Check each deployment platform
        for (const [platform, keywords] of Object.entries(DEPLOYMENT_KEYWORDS)) {
          if (keywords.some((keyword) => contentLower.includes(keyword))) {
            deployment = platform;
            break;
          }
        }

        if (deployment) break;
      }
    }
  } catch (error) {
    // ADR directory not found - graceful fallback
    console.warn('Could not scan ADRs:', error);
  }

  // 3. Validate and sanitize
  const techStack: TechStack = {
    libraries: libraries.slice(0, 20), // Max 20 libraries
    deployment,
  };

  const validated = TechStackSchema.parse(techStack);

  // Cache result
  if (sessionId) {
    techStackCache.set(cacheKey, validated);
  }

  return validated;
}

/**
 * Remove cached tech stack entries for a specific session or for all sessions.
 *
 * @param sessionId - If provided, deletes only the cache entry for this session; if omitted, clears the entire cache
 */
export function clearTechStackCache(sessionId?: string): void {
  if (sessionId) {
    techStackCache.delete(sessionId);
  } else {
    techStackCache.clear();
  }
}

/**
 * Determine tech stack match level based on detected stack
 *
 * @param techStack - Detected tech stack
 * @param optionTechnologies - Technologies mentioned in the option being evaluated
 * @returns Match level: 'full', 'partial', or 'generic'
 */
export function determineTechStackMatch(
  techStack: TechStack,
  optionTechnologies: string[] = []
): 'full' | 'partial' | 'generic' {
  if (techStack.libraries.length === 0 && !techStack.deployment) {
    return 'generic';
  }

  if (optionTechnologies.length === 0) {
    return 'generic';
  }

  // Check how many option technologies are in our stack
  const matchCount = optionTechnologies.filter((tech) => {
    const techLower = tech.toLowerCase();
    return (
      techStack.libraries.some((lib) => lib.toLowerCase().includes(techLower)) ||
      techStack.deployment?.toLowerCase().includes(techLower)
    );
  }).length;

  const matchRatio = matchCount / optionTechnologies.length;

  if (matchRatio >= 0.8) return 'full';
  if (matchRatio >= 0.4) return 'partial';
  return 'generic';
}
