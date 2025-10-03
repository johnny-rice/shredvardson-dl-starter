import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../helpers/test-utils';
import { Header } from '@/components/Header';

// Mock the analytics provider hook
vi.mock('@/components/AnalyticsProvider', () => ({
  useTrackClick: () => vi.fn(),
}));

describe('Header Component', () => {
  it('renders the app title', () => {
    render(<Header />);
    expect(screen.getByText('Your Starter')).toBeInTheDocument();
  });

  it('renders dashboard link', () => {
    render(<Header />);
    const dashboardLink = screen.getByText('Your Starter');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  it('renders analytics link', () => {
    render(<Header />);
    const analyticsLink = screen.getByText('Analytics');
    expect(analyticsLink).toHaveAttribute('href', '/dashboard/analytics');
  });

  it('renders help link with correct attributes', () => {
    render(<Header />);
    const helpLink = screen.getByTestId('help-link');

    expect(helpLink).toHaveAttribute(
      'href',
      'https://github.com/Shredvardson/dl-starter/wiki/Two-Lanes-Quick-Start'
    );
    expect(helpLink).toHaveAttribute('target', '_blank');
    expect(helpLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders navigation menu', () => {
    render(<Header />);
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});
