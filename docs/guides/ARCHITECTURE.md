# Architecture Guide

Comprehensive guide to the dl-starter project architecture - a modern monorepo template built for human-AI collaboration.

## Table of Contents

- [Overview](#overview)
- [Monorepo Structure](#monorepo-structure)
- [Package Dependency Graph](#package-dependency-graph)
- [Application Architecture](#application-architecture)
- [Shared Packages](#shared-packages)
- [Build and Deployment](#build-and-deployment)
- [Development Workflow](#development-workflow)
- [Design System](#design-system)
- [LLM-Friendly Architecture Patterns](#llm-friendly-architecture-patterns)

---

## Overview

### Project Philosophy

dl-starter is built on three core principles:

1. **Human-AI Collaboration**: Architecture optimized for both developers and AI agents
2. **Progressive Disclosure**: Information revealed as needed (see [Skills system](./SKILLS.md))
3. **Security-First**: Defense-in-depth at every layer

### Technology Stack

**Core Technologies:**

- **Next.js 15.5**: React framework with App Router
- **React 19.2**: UI library with Server Components
- **TypeScript 5**: Type-safe development
- **Turborepo**: Monorepo build system
- **pnpm**: Fast, efficient package manager

**Backend & Database:**

- **Supabase**: Backend-as-a-Service (PostgreSQL + Auth + Storage + Real-time)
- **PostgreSQL 15**: Production-ready database
- **Row Level Security (RLS)**: Database-level security

**Styling & UI:**

- **Tailwind CSS 4**: Utility-first CSS
- **Radix UI**: Accessible component primitives
- **Design Tokens**: Theme-based design system
- **Framer Motion**: Animations

**Testing & Quality:**

- **Vitest**: Unit and integration testing
- **Playwright**: E2E browser testing
- **BATS**: Bash script testing
- **pgTAP**: Database testing
- **ESLint + Prettier**: Code quality

**AI & Automation:**

- **Claude Code**: AI-assisted development
- **Skills System**: Progressive disclosure workflows
- **Git Context Package**: Secure git info for AI agents

### Project Structure

```
dl-starter/
├── apps/                           # Applications
│   └── web/                       # Next.js 15 application
│       ├── src/
│       │   ├── app/               # App Router pages
│       │   ├── components/        # React components
│       │   ├── hooks/             # Custom hooks
│       │   ├── lib/               # Utilities
│       │   └── design-system/     # Design tokens
│       ├── tests/                 # Tests (unit, E2E, RLS)
│       ├── public/                # Static assets
│       └── package.json
│
├── packages/                       # Shared packages
│   ├── ai/                        # AI utilities and prompts
│   ├── config/                    # Shared configs (ESLint, TS, etc.)
│   ├── db/                        # Database client and types
│   ├── git-context/               # Secure git context extraction
│   ├── types/                     # Shared TypeScript types
│   └── ui/                        # Shared UI components
│
├── .claude/                        # Claude Code configuration
│   ├── commands/                  # Slash command definitions
│   ├── skills/                    # Skills implementation guides
│   └── agents/                    # Sub-agent configurations
│
├── supabase/                       # Database & Auth
│   ├── migrations/                # Database migrations
│   ├── tests/                     # pgTAP tests
│   ├── templates/                 # RLS policy templates
│   ├── seed.sql                   # Development seed data
│   └── config.toml                # Supabase configuration
│
├── scripts/                        # Automation scripts
│   ├── skills/                    # Skills implementations
│   │   ├── git.sh
│   │   ├── git/                   # Git sub-skills
│   │   └── __tests__/             # BATS tests
│   ├── db/                        # Database scripts
│   └── [other automation scripts]
│
├── docs/                           # Documentation
│   ├── guides/                    # Developer guides
│   │   ├── TESTING.md
│   │   ├── DATABASE.md
│   │   ├── SKILLS.md
│   │   └── ARCHITECTURE.md (this file)
│   ├── database/                  # Database docs
│   ├── testing/                   # Testing docs
│   └── [other documentation]
│
├── turbo.json                      # Turborepo configuration
├── pnpm-workspace.yaml            # pnpm workspace configuration
└── package.json                    # Root package (scripts, workspaces)
```

---

## Monorepo Structure

### Why Monorepo?

**Benefits:**

- ✅ **Code sharing**: Share packages across apps
- ✅ **Atomic changes**: Update multiple packages in one commit
- ✅ **Consistent tooling**: Single ESLint, TypeScript, Prettier config
- ✅ **Simplified dependencies**: No version conflicts
- ✅ **Better developer experience**: Single `pnpm install`

**Tools:**

- **Turborepo**: Task orchestration and caching
- **pnpm workspaces**: Package management
- **TypeScript project references**: Type checking

### Workspace Configuration

**pnpm Workspace** (`pnpm-workspace.yaml`):

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Turborepo Configuration** (`turbo.json`):

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "cache": false
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Package Naming Convention

Packages use scoped names:

- `@shared/*`: Shared utility packages
  - `@shared/db`: Database client and types
  - `@shared/git-context`: Git context extraction
  - `@shared/types`: Shared TypeScript types
  - `@shared/ai`: AI utilities

- `@ui/*`: UI component packages
  - `@ui/components`: Shared UI components
  - `@ui/design-tokens`: Design system tokens

- `@config/*`: Configuration packages
  - `@config/eslint`: ESLint configurations
  - `@config/typescript`: TypeScript configurations

### Workspace Dependencies

Packages reference each other via workspace protocol:

```json
{
  "name": "web",
  "dependencies": {
    "@shared/db": "workspace:*",
    "@shared/types": "workspace:*",
    "@ui/components": "workspace:*"
  }
}
```

**Benefits:**

- Always uses latest local version
- No version conflicts
- Type safety across packages

---

## Package Dependency Graph

### Visual Dependency Map

```
┌─────────────┐
│    web      │  Next.js Application
│   (apps/)   │
└─────┬───────┘
      │
      ├─────────┐
      │         │
      ▼         ▼
┌─────────┐  ┌─────────┐
│   @ui/  │  │ @shared/│
│components│ │   db    │
└────┬────┘  └────┬────┘
     │            │
     │            ▼
     │       ┌─────────┐
     │       │ @shared/│
     │       │  types  │
     │       └─────────┘
     │
     ▼
┌─────────┐
│ @shared/│
│   ai    │
└─────────┘
```

### Package Dependencies

#### `apps/web` (Next.js App)

**Dependencies:**

```json
{
  "dependencies": {
    // Framework
    "next": "^15.5.6",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",

    // Workspace packages
    "@shared/db": "workspace:*",
    "@shared/types": "workspace:*",
    "@shared/ai": "workspace:*",
    "@ui/components": "workspace:*",

    // UI
    "@radix-ui/*": "^...",
    "framer-motion": "^11.15.0",

    // Database
    "@supabase/ssr": "^0.6.2",
    "@supabase/supabase-js": "^2.48.1",

    // Forms & Validation
    "react-hook-form": "^7.54.2",
    "zod": "^3.24.1",

    // Utilities
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0"
  }
}
```

#### `packages/ui` (UI Components)

**Dependencies:**

```json
{
  "dependencies": {
    "@radix-ui/react-*": "^...",
    "@tanstack/react-table": "^8.20.6",
    "class-variance-authority": "^0.7.1",
    "framer-motion": "^11.15.0",
    "lucide-react": "^0.468.0",
    "tailwind-merge": "^2.6.0"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

#### `packages/db` (Database)

**Dependencies:**

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.48.1"
  }
}
```

**Exports:**

```typescript
// Generated types from database schema
export type { Database } from './types';

// Supabase client
export { supabase } from './client';
```

#### `packages/git-context` (Git Context)

**Dependencies:**

```json
{
  "dependencies": {
    "zod": "^3.24.1"
  }
}
```

**Exports:**

```typescript
export { getGitContext } from './index';
export type { GitContext, GitContextOptions } from './types';
// + 30+ other exports
```

#### `packages/types` (Shared Types)

**Dependencies:** None (pure TypeScript types)

**Exports:**

```typescript
export type { User, Profile } from './user';
export type { ApiResponse, ApiError } from './api';
// Shared types across the monorepo
```

---

## Application Architecture

### Next.js App Router Structure

**Layout:**

```
apps/web/src/app/
├── (auth)/                    # Auth routes group
│   ├── login/
│   │   └── page.tsx          # /login
│   ├── signup/
│   │   └── page.tsx          # /signup
│   └── layout.tsx            # Auth layout
│
├── (marketing)/               # Marketing routes group
│   ├── page.tsx              # / (homepage)
│   ├── about/
│   │   └── page.tsx          # /about
│   ├── pricing/
│   │   └── page.tsx          # /pricing
│   └── layout.tsx            # Marketing layout
│
├── (protected)/               # Protected routes group
│   ├── dashboard/
│   │   └── page.tsx          # /dashboard
│   ├── settings/
│   │   └── page.tsx          # /settings
│   └── layout.tsx            # Protected layout (requires auth)
│
├── api/                       # API routes
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts      # Auth callback
│   └── health/
│       └── route.ts          # Health check
│
├── design/                    # Component playground
│   └── page.tsx
│
├── showcase/                  # Feature showcases
│   └── page.tsx
│
├── layout.tsx                 # Root layout
├── globals.css                # Global styles
├── error.tsx                  # Error boundary
├── loading.tsx                # Loading UI
└── not-found.tsx              # 404 page
```

### Route Groups

**Purpose:** Organize routes without affecting URL structure

**Examples:**

1. **`(auth)`**: Authentication pages
   - `/login` → `app/(auth)/login/page.tsx`
   - `/signup` → `app/(auth)/signup/page.tsx`
   - Shared layout: `(auth)/layout.tsx`

2. **`(marketing)`**: Public marketing pages
   - `/` → `app/(marketing)/page.tsx`
   - `/about` → `app/(marketing)/about/page.tsx`
   - Shared layout: `(marketing)/layout.tsx`

3. **`(protected)`**: Authenticated user pages
   - `/dashboard` → `app/(protected)/dashboard/page.tsx`
   - Middleware checks authentication

### Server Components vs Client Components

**Server Components (Default):**

```typescript
// app/(marketing)/page.tsx
export default async function HomePage() {
  // Fetch data on server
  const data = await fetchData();

  return <div>{data.title}</div>;
}
```

**Client Components:**

```typescript
'use client'

// src/components/theme-toggle.tsx
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

**Rule of thumb:**

- ✅ Use Server Components by default
- ✅ Use Client Components for:
  - Interactivity (onClick, useState, useEffect)
  - Browser APIs (localStorage, window)
  - Third-party libraries that require client-side

### Data Fetching

**Server-Side:**

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: user } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return <Dashboard profile={profile} />;
}
```

**Client-Side:**

```typescript
'use client'

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function UserProfile() {
  const [profile, setProfile] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('profiles').select('*').single().then(({ data }) => {
      setProfile(data);
    });
  }, []);

  return <div>{profile?.username}</div>;
}
```

### Authentication Flow

```
User clicks "Login"
   ↓
app/(auth)/login/page.tsx
   ↓
Supabase Auth (signInWithPassword)
   ↓
Set session cookie
   ↓
Redirect to /dashboard
   ↓
middleware.ts checks auth
   ↓
Allow access to (protected) routes
```

**Middleware** (`apps/web/src/middleware.ts`):

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Protect /dashboard and other (protected) routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*'],
};
```

---

## Shared Packages

### `packages/db` - Database Package

**Purpose:** Centralized database client and type definitions

**Structure:**

```
packages/db/
├── src/
│   ├── types.ts          # Generated from Supabase schema
│   └── client.ts         # Supabase client config
├── package.json
└── tsconfig.json
```

**Usage:**

```typescript
import { supabase } from '@shared/db';
import type { Database } from '@shared/db/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const { data } = await supabase.from('profiles').select('*');
```

**Type Generation:**

```bash
pnpm db:types
# Runs: supabase gen types typescript --schema public > packages/db/src/types.ts
```

### `packages/ui` - UI Components

**Purpose:** Shared, reusable UI components

**Structure:**

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── [50+ components]
│   ├── design-tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   └── index.ts         # Exports
├── package.json
└── tsconfig.json
```

**Component Example:**

```typescript
// packages/ui/src/components/button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
```

**Usage:**

```typescript
import { Button } from '@ui/components/button';

export function LoginForm() {
  return (
    <form>
      <Button variant="default" size="lg">
        Log In
      </Button>
      <Button variant="outline">
        Cancel
      </Button>
    </form>
  );
}
```

### `packages/git-context` - Git Context Extraction

**Purpose:** Secure git information for AI agents

See [packages/git-context/README.md](../../packages/git-context/README.md) for full documentation.

**Quick Example:**

```typescript
import { getGitContext } from '@shared/git-context';

const context = getGitContext();
console.log(context.branch.current); // 'main'
console.log(context.status.staged);   // ['src/index.ts']
```

### `packages/types` - Shared Types

**Purpose:** TypeScript types used across multiple packages

**Structure:**

```
packages/types/
├── src/
│   ├── user.ts
│   ├── api.ts
│   └── index.ts
└── package.json
```

**Example:**

```typescript
// packages/types/src/user.ts
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}
```

---

## Build and Deployment

### Build Process

**Development:**

```bash
# Start all apps in dev mode
pnpm dev

# Start specific app
pnpm --filter=web dev

# Start with Supabase
pnpm db:start && pnpm dev
```

**Production Build:**

```bash
# Build all packages and apps
pnpm build

# Build specific app
pnpm --filter=web build

# Typecheck
pnpm typecheck

# Lint
pnpm lint
```

### Turborepo Task Pipeline

**Task Execution Order:**

```
pnpm build
  ↓
1. Build packages/ui (no dependencies)
2. Build packages/db (no dependencies)
3. Build packages/types (no dependencies)
4. Build packages/git-context (no dependencies)
  ↓
5. Build apps/web (depends on packages)
```

**Caching:**

Turborepo caches task outputs:

```bash
# First build: ~60s
pnpm build

# Second build (cache hit): ~2s
pnpm build
```

**Cache Configuration:**

```json
{
  "tasks": {
    "build": {
      "outputs": [".next/**", "dist/**"],
      "dependsOn": ["^build"]
    }
  }
}
```

### Deployment

**Vercel (Recommended):**

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Environment Variables:**

```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Vercel (production)
# Set via Vercel dashboard or CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

**Build Settings (Vercel):**

- **Framework Preset:** Next.js
- **Build Command:** `pnpm build`
- **Output Directory:** `apps/web/.next`
- **Install Command:** `pnpm install`

See [DEPLOYMENT.md](../DEPLOYMENT.md) for comprehensive deployment guide.

---

## Development Workflow

### Getting Started

```bash
# 1. Clone repository
git clone https://github.com/your-org/dl-starter.git
cd dl-starter

# 2. Install dependencies
pnpm install

# 3. Start Supabase
pnpm db:start

# 4. Start dev server
pnpm dev

# 5. Open browser
open http://localhost:3000
```

### Day-to-Day Development

**1. Create Feature Branch:**

```bash
/git branch Issue #123: Add dark mode
# Creates branch: 123-add-dark-mode
```

**2. Make Changes:**

```bash
# Edit files
code apps/web/src/components/theme-toggle.tsx

# Run tests
pnpm test:unit

# Check types
pnpm typecheck
```

**3. Commit Changes:**

```bash
/git commit
# Smart commit with conventional message
```

**4. Create Pull Request:**

```bash
/git pr create
# Creates PR with template
```

### Common Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Testing
pnpm test                   # Run all tests
pnpm test:unit              # Unit tests
pnpm test:e2e               # E2E tests
pnpm test:coverage          # Coverage report

# Database
pnpm db:start               # Start Supabase
pnpm db:stop                # Stop Supabase
pnpm db:reset               # Reset database
pnpm db:types               # Generate types
pnpm db:migrate             # Apply migrations

# Code Quality
pnpm lint                   # Run ESLint
pnpm lint:fix               # Fix ESLint issues
pnpm format                 # Format with Prettier
pnpm typecheck              # TypeScript check

# Monorepo
pnpm --filter=web [cmd]     # Run command in web app
pnpm --filter=@shared/db [cmd] # Run in db package
```

### Git Workflow

**Branch Naming:**

```
<issue-number>-<kebab-case-title>

Examples:
123-add-dark-mode
456-fix-auth-bug
789-update-docs
```

**Commit Messages (Conventional Commits):**

```
<type>(<scope>): <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Examples:
feat(auth): add Google OAuth integration
fix(database): resolve RLS policy performance issue
docs(guides): update testing guide
```

**Pull Requests:**

Use `/git pr create` to create PRs with template:

```markdown
## Summary
- Brief description of changes
- Links to related issues

## Test Plan
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] TypeScript builds without errors
- [ ] Linting passes
- [ ] Documentation updated
```

---

## Design System

### Design Tokens

**Location:** `apps/web/src/design-system/`

**Colors** (`tokens/colors.ts`):

```typescript
export const colors = {
  // Brand colors
  primary: {
    50: 'hsl(var(--primary-50))',
    100: 'hsl(var(--primary-100))',
    // ...
    900: 'hsl(var(--primary-900))',
  },

  // Semantic colors
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  error: 'hsl(var(--error))',
  info: 'hsl(var(--info))',
};
```

**Typography** (`tokens/typography.ts`):

```typescript
export const typography = {
  fontFamily: {
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};
```

**Spacing** (`tokens/spacing.ts`):

```typescript
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
};
```

### Tailwind Configuration

**Configuration** (`apps/web/tailwind.config.ts`):

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS variables for theme switching
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
        // ...
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### Theme System

**Dark Mode:**

```typescript
// src/components/theme-provider.tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      {children}
    </NextThemesProvider>
  );
}
```

**CSS Variables** (`src/app/globals.css`):

```css
@layer base {
  :root {
    --primary: 222 47% 11%;
    --secondary: 210 40% 96%;
    --accent: 210 40% 96%;
    /* ... */
  }

  .dark {
    --primary: 210 40% 98%;
    --secondary: 217 33% 17%;
    --accent: 217 33% 17%;
    /* ... */
  }
}
```

### Component Variants

**Using Class Variance Authority:**

```typescript
import { cva } from 'class-variance-authority';

const cardVariants = cva('rounded-lg border p-6', {
  variants: {
    variant: {
      default: 'bg-card text-card-foreground',
      outline: 'border-2',
      ghost: 'border-none shadow-none',
    },
    size: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export function Card({ variant, size, className, ...props }) {
  return <div className={cardVariants({ variant, size, className })} {...props} />;
}
```

---

## LLM-Friendly Architecture Patterns

### Progressive Disclosure

**Problem:** Traditional documentation loads everything at once (5,000+ tokens)

**Solution:** Three-tier architecture

**Tier 1: Metadata** (~50 tokens)

```markdown
---
skill: git
version: 1.0.0
category: workflow
description: Git workflow automation
---
```

**Tier 2: Overview** (~500 tokens)

```markdown
# Usage

/git <action> [args]

## Actions
- branch - Create feature branch
- commit - Smart commit
- pr - Pull request operations
```

**Tier 3: Implementation** (~2,000 tokens, loaded only when needed)

```markdown
## Detailed Implementation

[Comprehensive guide with examples, edge cases, etc.]
```

**Benefits:**

- 89% token savings for pure automation
- 52% savings for LLM-assisted tasks
- Faster response times
- Better context utilization

See [SKILLS.md](./SKILLS.md) for comprehensive Skills documentation.

### Structured Output (JSON)

**All automation scripts return JSON:**

```typescript
// Success
{
  "status": "success",
  "action": "branch",
  "data": { "branch": "123-feature-name" }
}

// Error
{
  "error": "Branch already exists",
  "suggestion": "Use: git checkout 123-feature-name"
}
```

**Benefits:**

- Parseable by AI agents
- Consistent error handling
- Enables automation chaining

### Security-First

**Input Validation:**

```typescript
import { z } from 'zod';

const branchNameSchema = z.string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9/_-]+$/);

// Validate before use
const branch = branchNameSchema.parse(userInput);
```

**Safe Execution:**

```typescript
import { spawnSync } from 'child_process';

// No shell = no command injection
const result = spawnSync('git', ['status'], { shell: false });
```

**Output Sanitization:**

```typescript
import { sanitizeForAIContext } from '@shared/git-context';

const context = getGitContext({ sanitizeForAI: true });
// Removes credentials, absolute paths, potential prompt injection
```

### Self-Documenting Code

**TypeScript Types as Documentation:**

```typescript
/**
 * Creates a new user profile.
 *
 * @param userId - User ID from auth.users
 * @param username - Unique username (3-20 chars, alphanumeric + underscore)
 * @returns Created profile
 * @throws {Error} If username already exists
 *
 * @example
 * ```typescript
 * const profile = await createProfile('user-123', 'john_doe');
 * ```
 */
export async function createProfile(
  userId: string,
  username: string
): Promise<Profile> {
  // Implementation
}
```

**Benefits:**

- AI agents can understand function purpose
- IDE autocomplete provides context
- Reduces need for external documentation

### Traceability

**Issue → Code → PR → Deployment:**

```
Issue #123: Add dark mode
  ↓
Branch: 123-add-dark-mode
  ↓
Commits: feat(ui): add dark mode toggle
  ↓
PR #124: Implements Issue #123
  ↓
Deploy: Vercel deployment with SHA abc1234
```

**Benefits:**

- Easy to trace features to issues
- AI agents can understand context
- Simplifies debugging and rollbacks

---

## Next Steps

- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide
- **[DATABASE.md](./DATABASE.md)** - Database and RLS guide
- **[SKILLS.md](./SKILLS.md)** - Skills system documentation
- **[../DEPLOYMENT.md](../DEPLOYMENT.md)** - Deployment guide
- **[../CONTRIBUTING.md](../CONTRIBUTING.md)** - Contributing guidelines

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
