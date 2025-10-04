import { describe, it, expect } from 'vitest';
import { render, screen } from '../../helpers/test-utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@ui/components';

describe('Card Component', () => {
  it('renders with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Footer')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    render(
      <Card data-testid="card">
        <CardContent>Default card</CardContent>
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('shadow-sm');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border');
  });

  it('renders with elevated variant', () => {
    render(
      <Card variant="elevated" data-testid="card">
        <CardContent>Elevated card</CardContent>
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('shadow-md');
    expect(card).toHaveClass('hover:shadow-lg');
  });

  it('renders with outlined variant', () => {
    render(
      <Card variant="outlined" data-testid="card">
        <CardContent>Outlined card</CardContent>
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('shadow-none');
    expect(card).toHaveClass('border-2');
  });

  it('uses semantic design tokens', () => {
    render(
      <Card data-testid="card">
        <CardContent>Semantic tokens</CardContent>
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-card');
    expect(card).toHaveClass('text-card-foreground');
  });

  it('CardTitle uses proper heading element', () => {
    render(
      <CardHeader>
        <CardTitle>Card Heading</CardTitle>
      </CardHeader>
    );

    const heading = screen.getByText('Card Heading');
    expect(heading.tagName).toBe('H3');
  });

  it('CardDescription uses muted foreground', () => {
    render(
      <CardHeader>
        <CardDescription>Muted description</CardDescription>
      </CardHeader>
    );

    const description = screen.getByText('Muted description');
    expect(description).toHaveClass('text-muted-foreground');
  });
});