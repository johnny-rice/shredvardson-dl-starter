import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { SectionHeader } from './section-header';

describe('SectionHeader Component', () => {
  describe('Basic rendering', () => {
    it('renders with default props', () => {
      render(<SectionHeader>Section Title</SectionHeader>);
      expect(screen.getByText('Section Title')).toBeInTheDocument();
    });

    it('renders as h2 by default', () => {
      render(<SectionHeader>Default Heading</SectionHeader>);
      const heading = screen.getByText('Default Heading');
      expect(heading.tagName).toBe('H2');
    });

    it('renders children correctly', () => {
      render(<SectionHeader>Test Heading</SectionHeader>);
      expect(screen.getByText('Test Heading')).toBeInTheDocument();
    });
  });

  describe('Semantic heading levels', () => {
    it('renders as h1 when specified', () => {
      render(<SectionHeader as="h1">Page Title</SectionHeader>);
      const heading = screen.getByText('Page Title');
      expect(heading.tagName).toBe('H1');
    });

    it('renders as h2 when specified', () => {
      render(<SectionHeader as="h2">Section</SectionHeader>);
      const heading = screen.getByText('Section');
      expect(heading.tagName).toBe('H2');
    });

    it('renders as h3 when specified', () => {
      render(<SectionHeader as="h3">Subsection</SectionHeader>);
      const heading = screen.getByText('Subsection');
      expect(heading.tagName).toBe('H3');
    });

    it('renders as h4 when specified', () => {
      render(<SectionHeader as="h4">Minor Heading</SectionHeader>);
      const heading = screen.getByText('Minor Heading');
      expect(heading.tagName).toBe('H4');
    });

    it('renders as h5 when specified', () => {
      render(<SectionHeader as="h5">Small Heading</SectionHeader>);
      const heading = screen.getByText('Small Heading');
      expect(heading.tagName).toBe('H5');
    });

    it('renders as h6 when specified', () => {
      render(<SectionHeader as="h6">Smallest Heading</SectionHeader>);
      const heading = screen.getByText('Smallest Heading');
      expect(heading.tagName).toBe('H6');
    });
  });

  describe('Size variants', () => {
    it('applies small size classes', () => {
      render(<SectionHeader size="sm">Small</SectionHeader>);
      const heading = screen.getByText('Small');
      expect(heading).toHaveClass('text-lg', 'md:text-xl');
    });

    it('applies medium size classes (default)', () => {
      render(<SectionHeader size="md">Medium</SectionHeader>);
      const heading = screen.getByText('Medium');
      expect(heading).toHaveClass('text-2xl', 'md:text-3xl');
    });

    it('applies large size classes', () => {
      render(<SectionHeader size="lg">Large</SectionHeader>);
      const heading = screen.getByText('Large');
      expect(heading).toHaveClass('text-3xl', 'md:text-4xl', 'lg:text-5xl');
    });
  });

  describe('Alignment variants', () => {
    it('applies left alignment by default', () => {
      render(<SectionHeader>Left</SectionHeader>);
      const heading = screen.getByText('Left');
      expect(heading).toHaveClass('text-left');
    });

    it('applies center alignment', () => {
      render(<SectionHeader align="center">Center</SectionHeader>);
      const heading = screen.getByText('Center');
      expect(heading).toHaveClass('text-center');
    });

    it('applies right alignment', () => {
      render(<SectionHeader align="right">Right</SectionHeader>);
      const heading = screen.getByText('Right');
      expect(heading).toHaveClass('text-right');
    });
  });

  describe('Description text', () => {
    it('renders description when provided', () => {
      render(
        <SectionHeader description="This is a description">Heading with Description</SectionHeader>
      );

      expect(screen.getByText('Heading with Description')).toBeInTheDocument();
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('does not render description when not provided', () => {
      const { container } = render(<SectionHeader>No Description</SectionHeader>);

      expect(screen.getByText('No Description')).toBeInTheDocument();
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(0);
    });

    it('applies proper styles to description', () => {
      render(<SectionHeader description="Description text">Title</SectionHeader>);

      const description = screen.getByText('Description text');
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('aligns description with heading', () => {
      render(
        <SectionHeader align="center" description="Centered description">
          Centered Title
        </SectionHeader>
      );

      const description = screen.getByText('Centered description');
      expect(description).toHaveClass('text-center');
    });

    it('sizes description appropriately', () => {
      render(
        <SectionHeader size="sm" description="Small description">
          Small Title
        </SectionHeader>
      );

      const description = screen.getByText('Small description');
      expect(description).toHaveClass('text-sm');
    });
  });

  describe('Custom styling', () => {
    it('applies custom className to wrapper', () => {
      const { container } = render(<SectionHeader className="custom-wrapper">Title</SectionHeader>);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-wrapper');
      expect(wrapper).toHaveClass('space-y-2');
    });

    it('applies custom className to heading via headingClassName (legacy)', () => {
      render(<SectionHeader headingClassName="custom-heading">Custom Heading</SectionHeader>);

      const heading = screen.getByText('Custom Heading');
      expect(heading).toHaveClass('custom-heading');
    });

    it('applies custom className to heading via headingProps', () => {
      render(<SectionHeader headingProps={{ className: 'heading-class' }}>Heading</SectionHeader>);

      const heading = screen.getByText('Heading');
      expect(heading).toHaveClass('heading-class');
    });

    it('merges headingClassName and headingProps.className', () => {
      render(
        <SectionHeader headingClassName="legacy-class" headingProps={{ className: 'new-class' }}>
          Merged
        </SectionHeader>
      );

      const heading = screen.getByText('Merged');
      expect(heading).toHaveClass('legacy-class', 'new-class');
    });
  });

  describe('HeadingProps support', () => {
    it('applies id via headingProps', () => {
      render(<SectionHeader headingProps={{ id: 'section-id' }}>Section</SectionHeader>);

      const heading = screen.getByText('Section');
      expect(heading).toHaveAttribute('id', 'section-id');
    });

    it('applies aria-label via headingProps', () => {
      render(
        <SectionHeader headingProps={{ 'aria-label': 'Custom label' }}>Heading</SectionHeader>
      );

      const heading = screen.getByLabelText('Custom label');
      expect(heading).toBeInTheDocument();
    });

    it('applies data attributes via headingProps', () => {
      render(
        <SectionHeader
          headingProps={
            { 'data-testid': 'heading-test' } as React.HTMLAttributes<HTMLHeadingElement>
          }
        >
          Test
        </SectionHeader>
      );

      expect(screen.getByTestId('heading-test')).toBeInTheDocument();
    });

    it('applies multiple headingProps attributes', () => {
      render(
        <SectionHeader
          headingProps={
            {
              id: 'multi-attr',
              'aria-label': 'Multi attributes',
              'data-section': 'test',
            } as React.HTMLAttributes<HTMLHeadingElement>
          }
        >
          Multiple
        </SectionHeader>
      );

      const heading = screen.getByText('Multiple');
      expect(heading).toHaveAttribute('id', 'multi-attr');
      expect(heading).toHaveAttribute('aria-label', 'Multi attributes');
      expect(heading).toHaveAttribute('data-section', 'test');
    });
  });

  describe('Wrapper props', () => {
    it('applies data-testid to wrapper', () => {
      render(<SectionHeader data-testid="wrapper-test">Wrapper</SectionHeader>);

      const wrapper = screen.getByTestId('wrapper-test');
      expect(wrapper).toBeInTheDocument();
    });

    it('spreads additional wrapper props', () => {
      render(
        <SectionHeader data-section="main" aria-describedby="desc">
          Props Test
        </SectionHeader>
      );

      const heading = screen.getByText('Props Test');
      const wrapper = heading.parentElement;
      expect(wrapper).toHaveAttribute('data-section', 'main');
      expect(wrapper).toHaveAttribute('aria-describedby', 'desc');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to heading element', () => {
      const ref = { current: null };
      render(<SectionHeader ref={ref}>Ref Test</SectionHeader>);

      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
      expect(ref.current).toHaveTextContent('Ref Test');
    });

    it('ref points to correct heading level', () => {
      const ref = { current: null };
      render(
        <SectionHeader as="h3" ref={ref}>
          H3 Ref
        </SectionHeader>
      );

      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
      expect((ref.current as HTMLHeadingElement).tagName).toBe('H3');
    });
  });

  describe('Accessibility', () => {
    it('uses proper semantic HTML', () => {
      render(<SectionHeader as="h1">Accessible Title</SectionHeader>);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Accessible Title');
    });

    it('maintains heading hierarchy', () => {
      render(
        <>
          <SectionHeader as="h1">Main Title</SectionHeader>
          <SectionHeader as="h2">Section</SectionHeader>
          <SectionHeader as="h3">Subsection</SectionHeader>
        </>
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Subsection');
    });

    it('supports skip link targets via headingProps id', () => {
      render(<SectionHeader headingProps={{ id: 'main-content' }}>Main Content</SectionHeader>);

      const heading = screen.getByText('Main Content');
      expect(heading).toHaveAttribute('id', 'main-content');
    });
  });

  describe('Base styling', () => {
    it('uses semantic token classes', () => {
      render(<SectionHeader>Token Test</SectionHeader>);

      const heading = screen.getByText('Token Test');
      expect(heading).toHaveClass('text-foreground', 'font-bold', 'tracking-tight');
    });

    it('applies wrapper spacing', () => {
      const { container } = render(<SectionHeader>Spacing</SectionHeader>);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('space-y-2');
    });
  });

  describe('Complex composition', () => {
    it('renders complete section header with all features', () => {
      render(
        <SectionHeader
          as="h1"
          size="lg"
          align="center"
          description="Welcome to our application dashboard"
          className="custom-wrapper"
          headingProps={{ id: 'dashboard-title' }}
        >
          Dashboard
        </SectionHeader>
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Dashboard');
      expect(heading).toHaveClass('text-3xl', 'md:text-4xl', 'lg:text-5xl', 'text-center');
      expect(heading).toHaveAttribute('id', 'dashboard-title');

      const description = screen.getByText('Welcome to our application dashboard');
      expect(description).toHaveClass('text-center', 'text-lg');
    });

    it('renders in page layout context', () => {
      render(
        <main>
          <SectionHeader as="h1" size="lg">
            Page Title
          </SectionHeader>
          <section>
            <SectionHeader as="h2" size="md">
              Section Title
            </SectionHeader>
          </section>
        </main>
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page Title');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section Title');
    });
  });

  describe('Edge cases', () => {
    it('handles empty string as children', () => {
      render(<SectionHeader></SectionHeader>);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toBe('');
    });

    it('handles very long heading text', () => {
      const longText = 'This is a very long heading text that might wrap to multiple lines';
      render(<SectionHeader>{longText}</SectionHeader>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('handles very long description text', () => {
      const longDescription =
        'This is a very long description that provides detailed information about the section';
      render(<SectionHeader description={longDescription}>Title</SectionHeader>);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });
});
