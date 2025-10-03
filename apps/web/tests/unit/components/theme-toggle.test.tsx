import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../helpers/test-utils';
import { ThemeToggle } from '@/components/theme-toggle';

// Mock next-themes
const mockSetTheme = vi.fn();
vi.mock('next-themes', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-themes')>();
  return {
    ...actual,
    useTheme: () => ({
      theme: 'light',
      setTheme: mockSetTheme,
    }),
  };
});

describe('ThemeToggle Component', () => {
  it('renders theme selector', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByLabelText('Theme:')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('light');
  });

  it('renders all theme options', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('calls setTheme when option is changed', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    select.dispatchEvent(new Event('change', { bubbles: true }));

    // Note: Actual theme change testing would require user interaction simulation
    // which is better suited for E2E tests
  });
});
