import readline from 'node:readline';

/**
 * Confirmation helper for destructive operations in TypeScript scripts.
 *
 * Features:
 * - Interactive confirmation (user must type "yes")
 * - Force mode via --force flag or FORCE=true env var
 * - Non-interactive detection (CI/CD safety)
 * - Exit code 2 for safety blocks (vs 1 for errors)
 *
 * @param message - Warning message to display
 * @returns Promise<boolean> - Always returns true if confirmed or force mode
 * @throws Process exit with code 1 if user aborts, code 2 if non-interactive without force
 *
 * @example
 * ```typescript
 * import { confirm } from './utils/confirm';
 *
 * await confirm("This will delete all data");
 * // Proceeds only if user types "yes" or --force is used
 * ```
 *
 * @example
 * ```bash
 * # Normal mode - prompts for confirmation
 * tsx scripts/my-script.ts
 *
 * # Force mode - bypasses confirmation
 * tsx scripts/my-script.ts --force
 * FORCE=true tsx scripts/my-script.ts
 * ```
 */
export async function confirm(message: string): Promise<boolean> {
  // Skip in force mode (env var or CLI flag)
  if (process.env.FORCE === 'true' || process.argv.includes('--force')) {
    console.error('⚡ Force mode enabled, skipping confirmation');
    return true;
  }

  // Detect non-interactive mode (CI/CD)
  if (!process.stdin.isTTY) {
    console.error('❌ ERROR: Running in non-interactive mode without --force flag');
    console.error('   Use --force flag or FORCE=true environment variable to bypass confirmation');
    process.exit(2);
  }

  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr, // Use stderr to avoid polluting stdout
  });

  return new Promise((resolve) => {
    console.error('');
    console.error(`⚠️  WARNING: ${message}`);
    console.error('');

    rl.question("Type 'yes' to continue: ", (answer) => {
      console.error('');
      rl.close();

      if (answer === 'yes') {
        resolve(true);
      } else {
        console.error('❌ Aborted.');
        process.exit(1);
      }
    });
  });
}

/**
 * Legacy compatibility wrapper for existing askConfirmation pattern.
 *
 * @deprecated Use confirm() instead for consistent API
 */
export async function askConfirmation(question: string): Promise<boolean> {
  return confirm(question);
}
