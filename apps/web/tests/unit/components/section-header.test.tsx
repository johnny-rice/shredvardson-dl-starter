import { describe, it, expect } from 'vitest';
import { render, screen } from '../../helpers/test-utils';
import { SectionHeader } from '@ui/components';

describe('SectionHeader Component', () => {
  it('renders with heading text', () => {
    render(<SectionHeader>Test Heading</SectionHeader>);
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('defaults to h2 element', () => {
    render(<SectionHeader>Default Heading</SectionHeader>);
    const heading = screen.getByText('Default Heading');
    expect(heading.tagName).toBe('H2');
  });

  it('renders with custom heading level', () => {
    render(<SectionHeader as="h1">Page Title</SectionHeader>);
    const heading = screen.getByText('Page Title');
    expect(heading.tagName).toBe('H1');
  });

  it('renders with description', () => {
    render(<SectionHeader description="This is a description">Title</SectionHeader>);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('renders with small size', () => {
    render(<SectionHeader size="sm">Small Heading</SectionHeader>);
    const heading = screen.getByText('Small Heading');
    expect(heading).toHaveClass('text-lg');
    expect(heading).toHaveClass('md:text-xl');
  });

  it('renders with medium size (default)', () => {
    render(<SectionHeader size="md">Medium Heading</SectionHeader>);
    const heading = screen.getByText('Medium Heading');
    expect(heading).toHaveClass('text-2xl');
    expect(heading).toHaveClass('md:text-3xl');
  });

  it('renders with large size', () => {
    render(<SectionHeader size="lg">Large Heading</SectionHeader>);
    const heading = screen.getByText('Large Heading');
    expect(heading).toHaveClass('text-3xl');
    expect(heading).toHaveClass('md:text-4xl');
    expect(heading).toHaveClass('lg:text-5xl');
  });

  it('renders with center alignment', () => {
    render(<SectionHeader align="center">Centered</SectionHeader>);
    const heading = screen.getByText('Centered');
    expect(heading).toHaveClass('text-center');
  });

  it('renders with right alignment', () => {
    render(<SectionHeader align="right">Right Aligned</SectionHeader>);
    const heading = screen.getByText('Right Aligned');
    expect(heading).toHaveClass('text-right');
  });

  it('description inherits alignment', () => {
    render(
      <SectionHeader align="center" description="Centered description">
        Title
      </SectionHeader>
    );
    const description = screen.getByText('Centered description');
    expect(description).toHaveClass('text-center');
  });

  it('uses semantic design tokens for text color', () => {
    render(<SectionHeader>Semantic Colors</SectionHeader>);
    const heading = screen.getByText('Semantic Colors');
    expect(heading).toHaveClass('text-foreground');
  });

  it('description uses muted foreground', () => {
    render(<SectionHeader description="Muted text">Title</SectionHeader>);
    const description = screen.getByText('Muted text');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('supports all heading levels for accessibility', () => {
    const levels: Array<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ];

    levels.forEach((level) => {
      const { unmount } = render(
        <SectionHeader as={level}>{level.toUpperCase()} Heading</SectionHeader>
      );
      const heading = screen.getByText(`${level.toUpperCase()} Heading`);
      expect(heading.tagName).toBe(level.toUpperCase());
      unmount();
    });
  });
});