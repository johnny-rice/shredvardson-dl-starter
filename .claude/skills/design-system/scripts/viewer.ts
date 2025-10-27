#!/usr/bin/env tsx

/**
 * Design System Viewer
 * Opens the /design route in the browser
 */

import { type ChildProcess, exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

let serverProcess: ChildProcess | null = null;

function cleanup() {
  if (serverProcess) {
    console.error('🛑 Stopping development server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

interface ViewerOutput {
  success: boolean;
  url: string;
  message: string;
  error?: string;
}

async function checkServerRunning(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

function getOpenCommand(url: string): string {
  switch (process.platform) {
    case 'darwin':
      return `open "${url}"`;
    case 'win32':
      return `cmd /c start "" "${url}"`;
    default:
      return `xdg-open "${url}"`;
  }
}

/**
 * Opens the design system viewer at http://localhost:3000/design, starting a local dev server if necessary.
 *
 * This function will attempt to open the viewer URL in the platform's default browser. If no server is running, it starts the development server, waits for it to become reachable, and then opens the URL. On failure it performs cleanup of any started server process and returns a failure result.
 *
 * @returns An object describing the outcome:
 * - `success`: `true` if the viewer was opened, `false` otherwise.
 * - `url`: The viewer URL attempted.
 * - `message`: A human-readable status message.
 * - `error` (optional): Error message when `success` is `false`.
 */
async function openViewer(): Promise<ViewerOutput> {
  const url = 'http://localhost:3000/design';

  try {
    console.error('🎨 Opening design system viewer...');

    // Check if dev server is running
    const isRunning = await checkServerRunning(url);

    if (isRunning) {
      console.error('✓ Server already running');
      await execAsync(getOpenCommand(url));
    } else {
      console.error('Starting development server...');
      // Start server in background and track process
      serverProcess = exec('pnpm --filter=web dev');

      // Forward server output
      serverProcess.stdout?.on('data', (data) => {
        console.error(data.toString().trim());
      });
      serverProcess.stderr?.on('data', (data) => {
        console.error(data.toString().trim());
      });

      // Wait for server to be ready
      console.error('Waiting for server...');
      let attempts = 0;
      while (attempts < 30) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (await checkServerRunning(url)) {
          console.error('✓ Server ready');
          await execAsync(getOpenCommand(url));
          break;
        }
        attempts++;
      }

      if (attempts >= 30) {
        cleanup();
        throw new Error('Server failed to start within 30 seconds');
      }
    }

    return {
      success: true,
      url,
      message: 'Design system viewer opened successfully',
    };
  } catch (error) {
    cleanup();
    return {
      success: false,
      url,
      message: 'Failed to open viewer',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Execute and output JSON
openViewer()
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => {
    console.error(
      JSON.stringify(
        {
          success: false,
          url: 'http://localhost:3000/design',
          message: 'Script execution failed',
          error: error.message,
        },
        null,
        2
      )
    );
    process.exit(1);
  });
