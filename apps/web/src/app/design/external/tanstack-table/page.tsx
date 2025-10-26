/**
 * TanStack Table Component Examples
 *
 * Demonstrates TanStack Table components available via /design import tanstack-table <ComponentName>
 */

'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
} from '@ui/components';
import Link from 'next/link';
import { useState } from 'react';

// Sample data types
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

interface Sale {
  id: string;
  product: string;
  amount: number;
  date: string;
  customer: string;
}

// Sample data
const sampleUsers: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'active' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Editor', status: 'inactive' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'User', status: 'active' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'active' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'User', status: 'inactive' },
  { id: 7, name: 'Grace Wilson', email: 'grace@example.com', role: 'Editor', status: 'active' },
  { id: 8, name: 'Henry Moore', email: 'henry@example.com', role: 'User', status: 'active' },
];

const sampleSales: Sale[] = [
  { id: 'S001', product: 'Laptop Pro', amount: 1299, date: '2025-10-01', customer: 'Tech Corp' },
  { id: 'S002', product: 'Mouse Wireless', amount: 49, date: '2025-10-03', customer: 'Office Inc' },
  { id: 'S003', product: 'Keyboard Mech', amount: 159, date: '2025-10-05', customer: 'Dev Studio' },
  { id: 'S004', product: 'Monitor 27"', amount: 399, date: '2025-10-07', customer: 'Design Co' },
  { id: 'S005', product: 'Webcam HD', amount: 89, date: '2025-10-10', customer: 'Remote LLC' },
  { id: 'S006', product: 'Headset Pro', amount: 199, date: '2025-10-12', customer: 'Audio Labs' },
  { id: 'S007', product: 'Dock Station', amount: 249, date: '2025-10-15', customer: 'Tech Corp' },
  { id: 'S008', product: 'SSD 1TB', amount: 129, date: '2025-10-18', customer: 'Data Systems' },
  { id: 'S009', product: 'Cable USB-C', amount: 19, date: '2025-10-20', customer: 'Office Inc' },
  { id: 'S010', product: 'Stand Laptop', amount: 59, date: '2025-10-22', customer: 'Ergo Space' },
  { id: 'S011', product: 'Light LED', amount: 39, date: '2025-10-24', customer: 'Design Co' },
  { id: 'S012', product: 'Charger 100W', amount: 69, date: '2025-10-25', customer: 'Power Plus' },
];

// Column definitions
const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            status === 'active'
              ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
              : 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-400'
          }`}
        >
          {status}
        </span>
      );
    },
  },
];

const salesColumns: ColumnDef<Sale>[] = [
  {
    accessorKey: 'id',
    header: 'Order ID',
  },
  {
    accessorKey: 'product',
    header: 'Product',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      return `$${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
  },
];

export default function TanStackTableExamplesPage() {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/design"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          ← Back to Design System
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-2">TanStack Table Components</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Advanced table components for sorting, filtering, and pagination
        </p>
        <div className="flex gap-4 text-sm">
          <a
            href="https://tanstack.com/table/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View TanStack Table Docs →
          </a>
          <a
            href="https://github.com/Shredvardson/dl-starter/blob/main/docs/design/EXTERNAL_LIBRARIES.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Integration Guide →
          </a>
        </div>
      </div>

      {/* Import Instructions */}
      <Card className="mb-8 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-lg">How to Import TanStack Table Components</CardTitle>
          <CardDescription>
            Use the /design import command to add TanStack Table components to your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <code className="text-sm bg-white dark:bg-gray-900 px-3 py-1.5 rounded border">
                /design import tanstack-table DataTable
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Installs dependencies and creates component wrapper
              </p>
            </div>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>
                <strong>Features:</strong>
              </p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li>Sorting - Click column headers to sort</li>
                <li>Filtering - Client-side data filtering</li>
                <li>Pagination - Handle large datasets efficiently</li>
                <li>Row Selection - Multi-select with callbacks</li>
                <li>Fully typed with TypeScript</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Examples */}
      <div className="space-y-8">
        {/* Example 1: Basic Table with Sorting */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Table with Sorting</CardTitle>
            <CardDescription>
              Click column headers to sort. Uses default size (md) and density (comfortable).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={userColumns}
              data={sampleUsers}
              enableSorting={true}
              size="md"
              density="comfortable"
            />
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  ✅ Design Token Integration
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Table uses CVA variants with our design tokens. Supports size (sm/md/lg) and
                  density (compact/comfortable/spacious) props. Uses Select component for page size
                  dropdown.
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Import code:</strong>
                </p>
                <code className="text-xs block mt-1">
                  {`import { DataTable } from '@ui/components';
import type { ColumnDef } from '@tanstack/react-table';

<DataTable
  columns={columns}
  data={data}
  size="md"
  density="comfortable"
/>`}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example 2: Size and Density Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Size and Density Variants</CardTitle>
            <CardDescription>
              Compact size with compact density for dense data displays.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={userColumns}
              data={sampleUsers.slice(0, 4)}
              enableSorting={true}
              size="sm"
              density="compact"
            />
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Usage example:</strong>
              </p>
              <code className="text-xs block">
                {`<DataTable
  columns={columns}
  data={data}
  size="sm"
  density="compact"
/>`}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Example 3: Table with Pagination */}
        <Card>
          <CardHeader>
            <CardTitle>Table with Pagination</CardTitle>
            <CardDescription>
              Navigate through large datasets with pagination controls using our Select component.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={salesColumns}
              data={sampleSales}
              enableSorting={true}
              enablePagination={true}
              pageSize={5}
              size="md"
              density="comfortable"
            />
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Usage example:</strong>
              </p>
              <code className="text-xs block">
                {`<DataTable
  columns={columns}
  data={data}
  enablePagination={true}
  pageSize={5}
/>`}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Example 4: Table with Row Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Table with Row Selection</CardTitle>
            <CardDescription>
              Select multiple rows and get callbacks with selected data. Useful for bulk actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={userColumns}
              data={sampleUsers}
              enableSorting={true}
              enableRowSelection={true}
              enablePagination={true}
              pageSize={5}
              size="md"
              density="comfortable"
              onRowSelectionChange={setSelectedUsers}
            />
            {selectedUsers.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                  Selected Users ({selectedUsers.length}):
                </p>
                <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                  {selectedUsers.map((user) => (
                    <li key={user.id}>
                      {user.name} ({user.email})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Usage example:</strong>
              </p>
              <code className="text-xs block">
                {`<DataTable
  columns={columns}
  data={data}
  enableRowSelection={true}
  onRowSelectionChange={(rows) => console.log(rows)}
/>`}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Column Definitions</h3>
              <p className="text-muted-foreground mb-2">
                Define columns using TanStack Table&apos;s type-safe <code>ColumnDef</code>:
              </p>
              <code className="text-xs block bg-muted p-3 rounded">
                {`const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge>{row.getValue('status')}</Badge>
  }
];`}
              </code>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Custom Cell Rendering</h3>
              <p className="text-muted-foreground">
                Use the <code>cell</code> property to customize how data is displayed (badges,
                buttons, links, etc.)
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Server-side Integration</h3>
              <p className="text-muted-foreground">
                For server-side data fetching, disable built-in pagination and handle state
                externally. See TanStack Table docs for examples.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
