'use client';

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { cva, type VariantProps } from 'class-variance-authority';
import { useEffect, useState } from 'react';
import { cn } from '../../../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';

/**
 * DataTable component variants using CVA (Class Variance Authority)
 * Provides consistent styling with semantic design tokens
 */
const dataTableVariants = cva('w-full', {
  variants: {
    size: {
      sm: '',
      md: '',
      lg: '',
    },
    density: {
      compact: '',
      comfortable: '',
      spacious: '',
    },
  },
  defaultVariants: {
    size: 'md',
    density: 'comfortable',
  },
});

/**
 * Cell variants based on size and density
 */
const cellVariants = cva('align-middle', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
    density: {
      compact: 'p-2',
      comfortable: 'p-4',
      spacious: 'p-6',
    },
  },
  defaultVariants: {
    size: 'md',
    density: 'comfortable',
  },
});

/**
 * Header cell variants
 */
const headerCellVariants = cva('text-left align-middle font-medium text-muted-foreground', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
    density: {
      compact: 'h-10 px-2',
      comfortable: 'h-12 px-4',
      spacious: 'h-14 px-6',
    },
  },
  defaultVariants: {
    size: 'md',
    density: 'comfortable',
  },
});

export interface DataTableProps<TData, TValue> extends VariantProps<typeof dataTableVariants> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /**
   * Provide a stable row id resolver to preserve selection across reordering.
   */
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  /**
   * Enable sorting functionality
   * @default true
   */
  enableSorting?: boolean;
  /**
   * Enable filtering functionality
   * @default false
   */
  enableFiltering?: boolean;
  /**
   * Enable pagination
   * @default false
   */
  enablePagination?: boolean;
  /**
   * Enable row selection
   * @default false
   */
  enableRowSelection?: boolean;
  /**
   * Initial page size for pagination
   * @default 10
   */
  pageSize?: number;
  /**
   * Custom className for the table container
   */
  className?: string;
  /**
   * Custom className for the table element
   */
  tableClassName?: string;
  /**
   * Callback when row selection changes
   */
  onRowSelectionChange?: (selectedRows: TData[]) => void;
}

/**
 * DataTable component using TanStack Table
 *
 * A flexible, accessible data table built on TanStack Table with design system styling.
 * Supports sorting, filtering, pagination, row selection, and responsive layouts.
 *
 * @usageGuidelines
 * - Use for displaying tabular data with 10+ rows
 * - Enable pagination for datasets with 20+ rows
 * - Use sorting for columns users need to compare (numbers, dates, names)
 * - Enable row selection only when bulk actions are needed
 * - Provide stable row IDs via getRowId for consistent selection across re-renders
 * - Keep column count reasonable (5-10 columns ideal on desktop)
 * - Use compact density for dashboards, comfortable for data entry
 *
 * @accessibilityConsiderations
 * - Uses semantic table elements (table, thead, tbody, tr, th, td)
 * - Sortable columns have aria-sort attribute (ascending | descending | none)
 * - Checkboxes have aria-label for screen reader announcements
 * - Row selection state indicated via data-state="selected"
 * - Pagination controls have descriptive aria-labels
 * - Focus management maintained during interactions
 *
 * @param columns - Column definitions (TanStack Table ColumnDef[])
 * @param data - Array of row data objects
 * @param getRowId - Optional function to generate stable row IDs (for selection)
 * @param size - Text size variant (sm | md | lg)
 * @param density - Spacing density (compact | comfortable | spacious)
 * @param enableSorting - Enable column sorting @default true
 * @param enableFiltering - Enable column filtering @default false
 * @param enablePagination - Enable pagination controls @default false
 * @param enableRowSelection - Enable row selection checkboxes @default false
 * @param pageSize - Initial rows per page @default 10
 * @param className - Additional CSS classes for container
 * @param tableClassName - Additional CSS classes for table element
 * @param onRowSelectionChange - Callback when selection changes
 *
 * @example
 * ```tsx
 * // Basic table with sorting
 * const columns: ColumnDef<User>[] = [
 *   { accessorKey: 'name', header: 'Name' },
 *   { accessorKey: 'email', header: 'Email' },
 *   { accessorKey: 'role', header: 'Role' },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={users}
 *   size="md"
 *   density="comfortable"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Table with pagination and row selection
 * <DataTable
 *   columns={columns}
 *   data={largeDataset}
 *   enablePagination
 *   enableRowSelection
 *   pageSize={20}
 *   onRowSelectionChange={(selected) => {
 *     console.log('Selected rows:', selected);
 *   }}
 *   getRowId={(row) => row.id}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Compact table for dashboards
 * <DataTable
 *   columns={columns}
 *   data={metrics}
 *   size="sm"
 *   density="compact"
 *   enableSorting
 *   className="max-w-4xl"
 * />
 * ```
 *
 * @see {@link https://tanstack.com/table/latest | TanStack Table Docs}
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  getRowId,
  size = 'md',
  density = 'comfortable',
  enableSorting = true,
  enableFiltering = false,
  enablePagination = false,
  enableRowSelection = false,
  pageSize = 10,
  className,
  tableClassName,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // Sync internal pagination when prop changes
  useEffect(() => {
    setPagination((prev) => (prev.pageSize === pageSize ? prev : { ...prev, pageSize }));
  }, [pageSize]);

  const table = useReactTable({
    data,
    columns,
    ...(getRowId && { getRowId }),
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && {
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting,
    }),
    ...(enableFiltering && {
      getFilteredRowModel: getFilteredRowModel(),
      onColumnFiltersChange: setColumnFilters,
    }),
    ...(enablePagination && {
      getPaginationRowModel: getPaginationRowModel(),
      onPaginationChange: setPagination,
    }),
    onColumnVisibilityChange: setColumnVisibility,
    ...(enableRowSelection && {
      onRowSelectionChange: setRowSelection,
      enableRowSelection: true,
    }),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(enablePagination && { pagination }),
    },
  });

  // Notify consumer with stable selected row data from table model
  useEffect(() => {
    if (!enableRowSelection || !onRowSelectionChange) return;
    const selected = table.getSelectedRowModel().flatRows.map((r) => r.original as TData);
    onRowSelectionChange(selected);
  }, [enableRowSelection, onRowSelectionChange, table]);

  return (
    <div className={cn(dataTableVariants({ size, density }), 'space-y-4', className)}>
      <div className="rounded-md border border-border">
        <table className={cn('w-full caption-bottom', tableClassName)}>
          <thead className="border-b border-border bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {enableRowSelection && (
                  <th className="w-10 px-4" scope="col">
                    <input
                      type="checkbox"
                      aria-label="Select all rows"
                      checked={table.getIsAllPageRowsSelected()}
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                      className="h-4 w-4 rounded border-border"
                    />
                  </th>
                )}
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className={headerCellVariants({ size, density })}
                    aria-sort={
                      enableSorting && header.column.getCanSort()
                        ? header.column.getIsSorted() === 'asc'
                          ? 'ascending'
                          : header.column.getIsSorted() === 'desc'
                            ? 'descending'
                            : 'none'
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : enableSorting && header.column.getCanSort() ? (
                      <button
                        type="button"
                        className={cn(
                          'flex items-center cursor-pointer select-none border-0 bg-transparent p-0 font-medium text-muted-foreground hover:text-foreground transition-colors'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        aria-label={`Sort by ${String(header.column.id)}`}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <span className="ml-2">
                            {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'border-b border-border transition-colors',
                    'hover:bg-muted/50',
                    row.getIsSelected() && 'bg-muted'
                  )}
                >
                  {enableRowSelection && (
                    <td className={cellVariants({ size, density })}>
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        className="h-4 w-4 rounded border-border"
                      />
                    </td>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cellVariants({ size, density })}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={enableRowSelection ? columns.length + 1 : columns.length}
                  className={cn(
                    cellVariants({ size, density }),
                    'text-center text-muted-foreground',
                    {
                      'h-24': density === 'comfortable',
                      'h-20': density === 'compact',
                      'h-28': density === 'spacious',
                    }
                  )}
                >
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {enablePagination && (
        <div className="flex items-center justify-between px-2">
          <div
            className={cn('flex-1 text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}
          >
            {enableRowSelection && (
              <>
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm')}>
                Rows per page
              </p>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className={cn('w-16', size === 'sm' ? 'h-8 text-xs' : 'h-10')}>
                  <SelectValue placeholder={pagination.pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div
              className={cn(
                'flex min-w-24 items-center justify-center font-medium',
                size === 'sm' ? 'text-xs' : 'text-sm'
              )}
            >
              Page {pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                aria-label="First page"
                className={cn(
                  'rounded-md border border-border bg-background p-0 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50',
                  size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
                )}
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                {'<<'}
              </button>
              <button
                type="button"
                aria-label="Previous page"
                className={cn(
                  'rounded-md border border-border bg-background p-0 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50',
                  size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
                )}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {'<'}
              </button>
              <button
                type="button"
                aria-label="Next page"
                className={cn(
                  'rounded-md border border-border bg-background p-0 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50',
                  size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
                )}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {'>'}
              </button>
              <button
                type="button"
                aria-label="Last page"
                className={cn(
                  'rounded-md border border-border bg-background p-0 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50',
                  size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
                )}
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                {'>>'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
