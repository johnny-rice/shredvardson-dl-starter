import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/components/theme-provider';

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: (props: Record<string, unknown>) => {
    const {
      children,
      attribute,
      defaultTheme,
      enableSystem,
      disableTransitionOnChange,
      storageKey,
      ...rest
    } = props;
    return (
      <div
        data-testid="theme-provider"
        data-attribute={attribute}
        data-default-theme={defaultTheme}
        data-enable-system={enableSystem}
        data-disable-transition={disableTransitionOnChange}
        data-storage-key={storageKey}
        {...rest}
      >
        {children as React.ReactNode}
      </div>
    );
  },
}));

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('default props', () => {
    it('renders with attribute set to "class"', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-attribute', 'class');
    });

    it('renders with defaultTheme set to "system"', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-default-theme', 'system');
    });

    it('renders with enableSystem set to true', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-enable-system', 'true');
    });

    it('renders with disableTransitionOnChange enabled', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-disable-transition', 'true');
    });

    it('renders with correct storageKey', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-storage-key', 'dl-starter-theme');
    });
  });

  describe('children rendering', () => {
    it('renders children correctly', () => {
      render(
        <ThemeProvider>
          <div data-testid="child-element">Child Content</div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('child-element')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <ThemeProvider>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
          <div data-testid="child-3">Third Child</div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('renders nested component tree', () => {
      render(
        <ThemeProvider>
          <div>
            <header>Header</header>
            <main>
              <article>Article Content</article>
            </main>
            <footer>Footer</footer>
          </div>
        </ThemeProvider>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Article Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('prop overrides', () => {
    it('allows attribute override', () => {
      render(
        <ThemeProvider attribute="data-theme">
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-attribute', 'data-theme');
    });

    it('allows defaultTheme override', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-default-theme', 'dark');
    });

    it('allows enableSystem override', () => {
      render(
        <ThemeProvider enableSystem={false}>
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-enable-system', 'false');
    });

    it('allows disableTransitionOnChange override', () => {
      render(
        <ThemeProvider disableTransitionOnChange={false}>
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-disable-transition', 'false');
    });

    it('allows storageKey override', () => {
      render(
        <ThemeProvider storageKey="custom-theme-key">
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-storage-key', 'custom-theme-key');
    });

    it('allows multiple prop overrides simultaneously', () => {
      render(
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem={false}
          storageKey="my-app-theme"
        >
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-attribute', 'data-theme');
      expect(provider).toHaveAttribute('data-default-theme', 'light');
      expect(provider).toHaveAttribute('data-enable-system', 'false');
      expect(provider).toHaveAttribute('data-storage-key', 'my-app-theme');
    });
  });

  describe('storage key configuration', () => {
    it('uses project-specific storage key by default', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-storage-key', 'dl-starter-theme');
    });

    it('accepts custom storage key', () => {
      const customKey = 'my-custom-theme-storage';
      render(
        <ThemeProvider storageKey={customKey}>
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-storage-key', customKey);
    });
  });

  describe('NextThemesProvider integration', () => {
    it('passes through all NextThemesProvider props', () => {
      render(
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={true}
          storageKey="dl-starter-theme"
        >
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toBeInTheDocument();
    });

    it('spreads additional props to NextThemesProvider', () => {
      render(
        <ThemeProvider data-custom-prop="custom-value">
          <div>Test Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toHaveAttribute('data-custom-prop', 'custom-value');
    });
  });

  describe('edge cases', () => {
    it('handles empty children', () => {
      render(<ThemeProvider>{null}</ThemeProvider>);

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toBeInTheDocument();
      expect(provider).toBeEmptyDOMElement();
    });

    it('handles undefined children', () => {
      render(<ThemeProvider>{undefined}</ThemeProvider>);

      const provider = screen.getByTestId('theme-provider');
      expect(provider).toBeInTheDocument();
    });

    it('handles string children', () => {
      render(<ThemeProvider>Plain text content</ThemeProvider>);

      expect(screen.getByText('Plain text content')).toBeInTheDocument();
    });

    it('handles fragment children', () => {
      render(
        <ThemeProvider>
          <>
            <div>Fragment Child 1</div>
            <div>Fragment Child 2</div>
          </>
        </ThemeProvider>
      );

      expect(screen.getByText('Fragment Child 1')).toBeInTheDocument();
      expect(screen.getByText('Fragment Child 2')).toBeInTheDocument();
    });
  });
});
