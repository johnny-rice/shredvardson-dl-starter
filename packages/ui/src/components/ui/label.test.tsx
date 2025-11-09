import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Label } from './label';

describe('Label Component', () => {
  describe('Basic rendering', () => {
    it('renders with default props', () => {
      render(<Label>Username</Label>);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('renders as label element', () => {
      render(<Label>Email</Label>);
      const label = screen.getByText('Email');
      expect(label.tagName).toBe('LABEL');
    });

    it('applies default styles', () => {
      const { container } = render(<Label>Label text</Label>);
      const label = container.querySelector('label');
      expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none');
    });

    it('renders children correctly', () => {
      render(<Label>First Name</Label>);
      expect(screen.getByText('First Name')).toBeInTheDocument();
    });
  });

  describe('Label-Input association', () => {
    it('associates with input using htmlFor', () => {
      render(
        <>
          <Label htmlFor="email-input">Email</Label>
          <input id="email-input" type="email" />
        </>
      );

      const label = screen.getByText('Email');
      expect(label).toHaveAttribute('for', 'email-input');
    });

    it('focuses associated input when label is clicked', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Label htmlFor="username">Username</Label>
          <input id="username" type="text" />
        </>
      );

      const label = screen.getByText('Username');
      const input = document.getElementById('username');

      await user.click(label);

      expect(input).toHaveFocus();
    });

    it('works with multiple labels and inputs', () => {
      render(
        <>
          <Label htmlFor="first-name">First Name</Label>
          <input id="first-name" type="text" />

          <Label htmlFor="last-name">Last Name</Label>
          <input id="last-name" type="text" />
        </>
      );

      expect(screen.getByText('First Name')).toHaveAttribute('for', 'first-name');
      expect(screen.getByText('Last Name')).toHaveAttribute('for', 'last-name');
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      const { container } = render(<Label className="custom-label">Custom</Label>);
      const label = container.querySelector('label');
      expect(label).toHaveClass('custom-label');
    });

    it('maintains base classes with custom className', () => {
      const { container } = render(<Label className="custom-class">Label</Label>);
      const label = container.querySelector('label');
      expect(label).toHaveClass('custom-class');
      expect(label).toHaveClass('text-sm', 'font-medium');
    });
  });

  describe('Disabled state styling', () => {
    it('applies peer-disabled styles', () => {
      const { container } = render(<Label>Disabled Label</Label>);
      const label = container.querySelector('label');
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70');
    });

    it('works with disabled input using peer classes', () => {
      render(
        <>
          <input id="disabled-input" type="text" disabled className="peer" />
          <Label htmlFor="disabled-input">Disabled Field</Label>
        </>
      );

      const label = screen.getByText('Disabled Field');
      expect(label).toHaveClass('peer-disabled:opacity-70');
    });
  });

  describe('Accessibility', () => {
    it('announces correctly to screen readers', () => {
      render(
        <>
          <Label htmlFor="accessible-input">Accessible Label</Label>
          <input id="accessible-input" type="text" />
        </>
      );

      const input = document.getElementById('accessible-input');
      expect(input).toBeInTheDocument();
      expect(screen.getByLabelText('Accessible Label')).toBe(input);
    });

    it('supports aria-label on label itself', () => {
      render(<Label aria-label="Custom aria label">Visible text</Label>);
      const label = screen.getByLabelText('Custom aria label');
      expect(label).toBeInTheDocument();
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<Label ref={ref}>Label</Label>);
      expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    });

    it('allows programmatic access via ref', () => {
      const ref = { current: null as HTMLLabelElement | null };
      render(<Label ref={ref}>Test Label</Label>);

      expect(ref.current?.textContent).toBe('Test Label');
    });
  });

  describe('Form integration', () => {
    it('works within form context', () => {
      render(
        <form>
          <Label htmlFor="form-input">Form Input</Label>
          <input id="form-input" name="formField" type="text" />
        </form>
      );

      const input = screen.getByLabelText('Form Input') as HTMLInputElement;
      expect(input).toHaveAttribute('name', 'formField');
    });

    it('handles required field indication', () => {
      render(
        <>
          <Label htmlFor="required-field">
            Required Field <span aria-label="required">*</span>
          </Label>
          <input id="required-field" type="text" required />
        </>
      );

      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });
  });

  describe('Complex content', () => {
    it('renders with nested elements', () => {
      render(
        <Label htmlFor="complex">
          <span>Email</span> <span className="text-red-500">*</span>
        </Label>
      );

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('handles onClick event', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Label htmlFor="clickable" onClick={handleClick}>
          Click me
        </Label>
      );

      await user.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('renders without htmlFor attribute', () => {
      render(<Label>Standalone Label</Label>);
      const label = screen.getByText('Standalone Label');
      expect(label).not.toHaveAttribute('for');
    });

    it('renders with empty children', () => {
      const { container } = render(<Label htmlFor="empty"></Label>);
      const label = container.querySelector('label');
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toBe('');
    });

    it('supports data attributes', () => {
      render(<Label data-testid="test-label">Test</Label>);
      expect(screen.getByTestId('test-label')).toBeInTheDocument();
    });
  });

  describe('Semantic token usage', () => {
    it('uses semantic text color classes', () => {
      const { container } = render(<Label>Label</Label>);
      const label = container.querySelector('label');

      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('font-medium');
      expect(label).toHaveClass('leading-none');
    });
  });

  describe('Multiple labels pattern', () => {
    it('supports multiple labels for same input (accessibility)', () => {
      render(
        <>
          <Label htmlFor="multi-input">Primary Label</Label>
          <Label htmlFor="multi-input">Secondary Label</Label>
          <input id="multi-input" type="text" />
        </>
      );

      const labels = screen.getAllByText(/Label/);
      expect(labels).toHaveLength(2);
      labels.forEach((label) => {
        expect(label).toHaveAttribute('for', 'multi-input');
      });
    });
  });
});
