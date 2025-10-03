import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

// Wrapper with common providers
function AllTheProviders({
  children,
  theme = 'light',
}: {
  children: React.ReactNode;
  theme?: string;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme={theme}>
      {children}
    </ThemeProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { theme?: string }
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders theme={options?.theme}>{children}</AllTheProviders>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };
