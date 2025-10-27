---
UsedBy: 0
Severity: normal
---

# shadcn CLI Requires Full Tailwind Setup in Package

**Context.** Created `packages/ui/components.json` for shadcn CLI but installations would fail. The CLI expects a complete Tailwind CSS setup even in library packages, not just the config file.

**Rule.** **shadcn CLI requires three files in your package: `components.json` (CLI config), `tailwind.config.ts` (Tailwind config), and `src/styles/globals.css` (Tailwind directives) - missing any will cause installation failures.**

**Example.**

```bash
# ❌ BAD: Only components.json exists
packages/ui/
├── components.json     ✅
├── src/
│   └── components/ui/
└── package.json

# Running: npx shadcn@latest add button
# Error: Cannot find tailwind.config.ts

# ✅ GOOD: Complete setup for shadcn CLI
packages/ui/
├── components.json            # CLI configuration
├── tailwind.config.ts         # Tailwind config (can be minimal)
├── src/
│   ├── styles/
│   │   └── globals.css       # @tailwind directives
│   └── components/ui/
└── package.json
```

**Minimal Required Files:**

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css"
  },
  "aliases": {
    "components": "@ui/src/components",
    "utils": "@ui/src/lib/utils"
  }
}
```

```ts
// tailwind.config.ts (can be minimal)
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {} },
  plugins: [],
};
export default config;
```

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Guardrails.**

- Always create all three files when setting up shadcn CLI in a new package
- The `tailwind.config.ts` can be minimal if your app handles the actual Tailwind build
- The `globals.css` paths in `components.json` must match actual file locations
- Test CLI with `npx shadcn@latest add button` to verify setup

**Tags.** shadcn,cli,tailwind,setup,components,ui-library,configuration
