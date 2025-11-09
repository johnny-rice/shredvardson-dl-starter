import type { ColumnDef } from '@tanstack/react-table';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from './data-table';

interface TestUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

const testData: TestUser[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
];

const basicColumns: ColumnDef<TestUser>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
];

describe('DataTable Component', () => {
  describe('Basic rendering', () => {
    it('renders table with data', () => {
      render(<DataTable columns={basicColumns} data={testData} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('renders column headers', () => {
      render(<DataTable columns={basicColumns} data={testData} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('renders empty state when no data', () => {
      render(<DataTable columns={basicColumns} data={[]} />);

      expect(screen.getByText('No results.')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      render(<DataTable columns={basicColumns} data={testData} />);

      const rows = screen.getAllByRole('row');
      // +1 for header row
      expect(rows).toHaveLength(testData.length + 1);
    });
  });

  describe('Size variants', () => {
    it('applies small size classes to cells', () => {
      const { container } = render(<DataTable columns={basicColumns} data={testData} size="sm" />);

      const cell = container.querySelector('td');
      expect(cell).toHaveClass('text-xs');
    });

    it('applies medium size classes (default)', () => {
      const { container } = render(<DataTable columns={basicColumns} data={testData} size="md" />);

      const cell = container.querySelector('td');
      expect(cell).toHaveClass('text-sm');
    });

    it('applies large size classes', () => {
      const { container } = render(<DataTable columns={basicColumns} data={testData} size="lg" />);

      const cell = container.querySelector('td');
      expect(cell).toHaveClass('text-base');
    });
  });

  describe('Density variants', () => {
    it('applies compact density padding', () => {
      const { container } = render(
        <DataTable columns={basicColumns} data={testData} density="compact" />
      );

      const cell = container.querySelector('td');
      expect(cell).toHaveClass('p-2');
    });

    it('applies comfortable density padding (default)', () => {
      const { container } = render(
        <DataTable columns={basicColumns} data={testData} density="comfortable" />
      );

      const cell = container.querySelector('td');
      expect(cell).toHaveClass('p-4');
    });

    it('applies spacious density padding', () => {
      const { container } = render(
        <DataTable columns={basicColumns} data={testData} density="spacious" />
      );

      const cell = container.querySelector('td');
      expect(cell).toHaveClass('p-6');
    });
  });

  describe('Sorting', () => {
    it('renders sortable headers when sorting is enabled', () => {
      render(<DataTable columns={basicColumns} data={testData} enableSorting={true} />);

      const nameHeader = screen.getByRole('button', { name: /Sort by name/i });
      expect(nameHeader).toBeInTheDocument();
    });

    it('sorts data when header is clicked', async () => {
      const user = userEvent.setup();
      render(<DataTable columns={basicColumns} data={testData} enableSorting={true} />);

      const nameHeader = screen.getByRole('button', { name: /Sort by name/i });
      await user.click(nameHeader);

      const rows = screen.getAllByRole('row');
      // First data row should be Bob Johnson (alphabetically first)
      expect(within(rows[1]).getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('toggles sort direction on multiple clicks', async () => {
      const user = userEvent.setup();
      render(<DataTable columns={basicColumns} data={testData} enableSorting={true} />);

      const nameHeader = screen.getByRole('button', { name: /Sort by name/i });

      // First click - ascending
      await user.click(nameHeader);
      expect(nameHeader.textContent).toContain('↑');

      // Second click - descending
      await user.click(nameHeader);
      expect(nameHeader.textContent).toContain('↓');
    });

    it('does not render sort buttons when sorting is disabled', () => {
      render(<DataTable columns={basicColumns} data={testData} enableSorting={false} />);

      const sortButtons = screen.queryAllByRole('button', { name: /Sort by/i });
      expect(sortButtons).toHaveLength(0);
    });
  });

  describe('Pagination', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 2 === 0 ? 'Admin' : 'User',
    }));

    it('shows pagination controls when enabled', () => {
      render(<DataTable columns={basicColumns} data={largeData} enablePagination={true} />);

      expect(screen.getByText('Rows per page')).toBeInTheDocument();
      expect(screen.getByLabelText('First page')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Last page')).toBeInTheDocument();
    });

    it('displays correct page info', () => {
      render(
        <DataTable columns={basicColumns} data={largeData} enablePagination={true} pageSize={10} />
      );

      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    });

    it('navigates to next page', async () => {
      const user = userEvent.setup();
      render(
        <DataTable columns={basicColumns} data={largeData} enablePagination={true} pageSize={10} />
      );

      const nextButton = screen.getByLabelText('Next page');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument();
      });
    });

    it('navigates to previous page', async () => {
      const user = userEvent.setup();
      render(
        <DataTable columns={basicColumns} data={largeData} enablePagination={true} pageSize={10} />
      );

      const nextButton = screen.getByLabelText('Next page');
      await user.click(nextButton);

      const prevButton = screen.getByLabelText('Previous page');
      await user.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
      });
    });

    it('navigates to first page', async () => {
      const user = userEvent.setup();
      render(
        <DataTable columns={basicColumns} data={largeData} enablePagination={true} pageSize={10} />
      );

      const lastButton = screen.getByLabelText('Last page');
      await user.click(lastButton);

      const firstButton = screen.getByLabelText('First page');
      await user.click(firstButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
      });
    });

    it('navigates to last page', async () => {
      const user = userEvent.setup();
      render(
        <DataTable columns={basicColumns} data={largeData} enablePagination={true} pageSize={10} />
      );

      const lastButton = screen.getByLabelText('Last page');
      await user.click(lastButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 3 of 3/)).toBeInTheDocument();
      });
    });

    it('changes page size', async () => {
      const user = userEvent.setup();
      render(
        <DataTable columns={basicColumns} data={largeData} enablePagination={true} pageSize={10} />
      );

      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      await waitFor(() => {
        const option20 = screen.getByText('20');
        user.click(option20);
      });

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
      });
    });

    it('respects custom pageSize prop', () => {
      render(
        <DataTable columns={basicColumns} data={largeData} enablePagination={true} pageSize={5} />
      );

      expect(screen.getByText(/Page 1 of 5/)).toBeInTheDocument();
    });
  });

  describe('Row selection', () => {
    it('shows selection checkboxes when enabled', () => {
      render(<DataTable columns={basicColumns} data={testData} enableRowSelection={true} />);

      const checkboxes = screen.getAllByRole('checkbox');
      // 1 for select all + 3 for each row
      expect(checkboxes).toHaveLength(testData.length + 1);
    });

    it('selects individual row', async () => {
      const user = userEvent.setup();
      render(<DataTable columns={basicColumns} data={testData} enableRowSelection={true} />);

      const checkboxes = screen.getAllByRole('checkbox', { name: 'Select row' });
      await user.click(checkboxes[0]);

      expect(checkboxes[0]).toBeChecked();
    });

    it('selects all rows', async () => {
      const user = userEvent.setup();
      render(<DataTable columns={basicColumns} data={testData} enableRowSelection={true} />);

      const selectAllCheckbox = screen.getByRole('checkbox', { name: 'Select all rows' });
      await user.click(selectAllCheckbox);

      const rowCheckboxes = screen.getAllByRole('checkbox', { name: 'Select row' });
      rowCheckboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });

    it('calls onRowSelectionChange callback', async () => {
      const user = userEvent.setup();
      const handleSelectionChange = vi.fn();

      render(
        <DataTable
          columns={basicColumns}
          data={testData}
          enableRowSelection={true}
          onRowSelectionChange={handleSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox', { name: 'Select row' });
      await user.click(checkboxes[0]);

      await waitFor(() => {
        expect(handleSelectionChange).toHaveBeenCalled();
        const selectedRows = handleSelectionChange.mock.calls[0][0];
        expect(selectedRows).toHaveLength(1);
        expect(selectedRows[0]).toMatchObject(testData[0]);
      });
    });

    it('shows selection count with pagination', () => {
      render(
        <DataTable
          columns={basicColumns}
          data={testData}
          enableRowSelection={true}
          enablePagination={true}
        />
      );

      expect(screen.getByText(/0 of 3 row\(s\) selected/)).toBeInTheDocument();
    });
  });

  describe('Custom row ID', () => {
    it('uses custom getRowId function', async () => {
      const user = userEvent.setup();
      const handleSelectionChange = vi.fn();

      render(
        <DataTable
          columns={basicColumns}
          data={testData}
          getRowId={(row) => row.email}
          enableRowSelection={true}
          onRowSelectionChange={handleSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox', { name: 'Select row' });
      await user.click(checkboxes[0]);

      await waitFor(() => {
        expect(handleSelectionChange).toHaveBeenCalled();
      });
    });
  });

  describe('Custom styling', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <DataTable columns={basicColumns} data={testData} className="custom-container" />
      );

      expect(container.querySelector('.custom-container')).toBeInTheDocument();
    });

    it('applies custom className to table', () => {
      render(<DataTable columns={basicColumns} data={testData} tableClassName="custom-table" />);

      const table = screen.getByRole('table');
      expect(table).toHaveClass('custom-table');
    });
  });

  describe('Accessibility', () => {
    it('uses proper table semantics', () => {
      render(<DataTable columns={basicColumns} data={testData} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('uses proper column headers with scope', () => {
      const { container } = render(<DataTable columns={basicColumns} data={testData} />);

      const headers = container.querySelectorAll('th[scope="col"]');
      expect(headers.length).toBeGreaterThan(0);
    });

    it('sets aria-sort on sortable columns', () => {
      const { container } = render(
        <DataTable columns={basicColumns} data={testData} enableSorting={true} />
      );

      const headerCells = container.querySelectorAll('th[aria-sort]');
      expect(headerCells.length).toBeGreaterThan(0);
    });

    it('sets data-state on selected rows', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DataTable columns={basicColumns} data={testData} enableRowSelection={true} />
      );

      const checkboxes = screen.getAllByRole('checkbox', { name: 'Select row' });
      await user.click(checkboxes[0]);

      await waitFor(() => {
        const selectedRow = container.querySelector('tr[data-state="selected"]');
        expect(selectedRow).toBeInTheDocument();
      });
    });

    it('has accessible checkbox labels', () => {
      render(<DataTable columns={basicColumns} data={testData} enableRowSelection={true} />);

      expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
      expect(screen.getAllByLabelText('Select row')).toHaveLength(testData.length);
    });

    it('has accessible pagination button labels', () => {
      render(
        <DataTable columns={basicColumns} data={testData} enablePagination={true} pageSize={2} />
      );

      expect(screen.getByLabelText('First page')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Last page')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles single row of data', () => {
      render(<DataTable columns={basicColumns} data={[testData[0]]} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(2); // header + 1 data row
    });

    it('handles large datasets', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        role: 'User',
      }));

      render(
        <DataTable columns={basicColumns} data={largeData} enablePagination={true} pageSize={10} />
      );

      expect(screen.getByText(/Page 1 of 100/)).toBeInTheDocument();
    });

    it('handles columns with no data', () => {
      const columnsWithExtra: ColumnDef<TestUser>[] = [
        ...basicColumns,
        { accessorKey: 'nonexistent' as any, header: 'Missing' },
      ];

      render(<DataTable columns={columnsWithExtra} data={testData} />);

      expect(screen.getByText('Missing')).toBeInTheDocument();
    });
  });

  describe('Semantic token usage', () => {
    it('uses semantic border colors', () => {
      const { container } = render(<DataTable columns={basicColumns} data={testData} />);

      const table = container.querySelector('.border-border');
      expect(table).toBeInTheDocument();
    });

    it('uses semantic background colors', () => {
      const { container } = render(<DataTable columns={basicColumns} data={testData} />);

      const thead = container.querySelector('thead');
      expect(thead).toHaveClass('bg-muted/50');
    });

    it('uses semantic text colors for headers', () => {
      const { container } = render(<DataTable columns={basicColumns} data={testData} />);

      const headerCell = container.querySelector('th');
      expect(headerCell).toHaveClass('text-muted-foreground');
    });
  });

  describe('Disabled pagination buttons', () => {
    it('disables previous/first buttons on first page', () => {
      render(
        <DataTable columns={basicColumns} data={testData} enablePagination={true} pageSize={1} />
      );

      expect(screen.getByLabelText('First page')).toBeDisabled();
      expect(screen.getByLabelText('Previous page')).toBeDisabled();
    });

    it('disables next/last buttons on last page', async () => {
      const user = userEvent.setup();
      render(
        <DataTable columns={basicColumns} data={testData} enablePagination={true} pageSize={10} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Next page')).toBeDisabled();
        expect(screen.getByLabelText('Last page')).toBeDisabled();
      });
    });
  });
});
