'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { DataTable } from './data-table';

/**
 * Sample user data type
 */
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

/**
 * Sample users dataset
 */
const sampleUsers: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'active' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Developer', status: 'active' },
  { id: '3', name: 'Carol Williams', email: 'carol@example.com', role: 'Designer', status: 'inactive' },
  { id: '4', name: 'David Brown', email: 'david@example.com', role: 'Manager', status: 'active' },
  { id: '5', name: 'Eve Davis', email: 'eve@example.com', role: 'Developer', status: 'active' },
  { id: '6', name: 'Frank Miller', email: 'frank@example.com', role: 'Analyst', status: 'inactive' },
  { id: '7', name: 'Grace Wilson', email: 'grace@example.com', role: 'Developer', status: 'active' },
  { id: '8', name: 'Henry Moore', email: 'henry@example.com', role: 'Designer', status: 'active' },
  { id: '9', name: 'Ivy Taylor', email: 'ivy@example.com', role: 'Manager', status: 'active' },
  { id: '10', name: 'Jack Anderson', email: 'jack@example.com', role: 'Developer', status: 'inactive' },
];

/**
 * Basic column definitions
 */
const basicColumns: ColumnDef<User>[] = [
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
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {status}
        </span>
      );
    },
  },
];

/**
 * Interactive examples demonstrating all DataTable variants and features.
 * Use this as a visual reference or copy examples into your own code.
 */
export function DataTableExamples() {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  return (
    <div className="space-y-12 p-8">
      <section>
        <h3 className="text-lg font-semibold mb-4">Basic Table</h3>
        <DataTable columns={basicColumns} data={sampleUsers.slice(0, 5)} />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">With Pagination</h3>
        <DataTable
          columns={basicColumns}
          data={sampleUsers}
          enablePagination
          pageSize={5}
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">With Row Selection</h3>
        <div className="space-y-2">
          <DataTable
            columns={basicColumns}
            data={sampleUsers.slice(0, 5)}
            enableRowSelection
            getRowId={(row) => row.id}
            onRowSelectionChange={setSelectedUsers}
          />
          {selectedUsers.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedUsers.map((u) => u.name).join(', ')}
            </p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Compact Density</h3>
        <DataTable
          columns={basicColumns}
          data={sampleUsers.slice(0, 5)}
          density="compact"
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Spacious Density</h3>
        <DataTable
          columns={basicColumns}
          data={sampleUsers.slice(0, 5)}
          density="spacious"
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Small Size</h3>
        <DataTable
          columns={basicColumns}
          data={sampleUsers.slice(0, 5)}
          size="sm"
          density="compact"
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Large Size</h3>
        <DataTable
          columns={basicColumns}
          data={sampleUsers.slice(0, 5)}
          size="lg"
          density="spacious"
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">All Features Combined</h3>
        <DataTable
          columns={basicColumns}
          data={sampleUsers}
          enablePagination
          enableRowSelection
          enableSorting
          pageSize={5}
          getRowId={(row) => row.id}
          size="md"
          density="comfortable"
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Custom Styled Table</h3>
        <DataTable
          columns={basicColumns}
          data={sampleUsers.slice(0, 5)}
          className="border-2 border-primary/20 rounded-lg"
          tableClassName="text-sm"
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Empty State</h3>
        <DataTable columns={basicColumns} data={[]} />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">With Custom Cell Renderers</h3>
        <DataTable
          columns={[
            {
              accessorKey: 'name',
              header: 'Name',
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {row.getValue<string>('name').charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium">{row.getValue('name')}</span>
                </div>
              ),
            },
            {
              accessorKey: 'email',
              header: 'Email',
              cell: ({ row }) => (
                <a
                  href={`mailto:${row.getValue('email')}`}
                  className="text-primary hover:underline"
                >
                  {row.getValue('email')}
                </a>
              ),
            },
            {
              accessorKey: 'role',
              header: 'Role',
            },
            {
              id: 'actions',
              header: 'Actions',
              cell: () => (
                <button className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
                  Edit
                </button>
              ),
            },
          ]}
          data={sampleUsers.slice(0, 5)}
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Dashboard Layout (Compact)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Active Users</h4>
            <DataTable
              columns={basicColumns}
              data={sampleUsers.filter((u) => u.status === 'active')}
              size="sm"
              density="compact"
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Inactive Users</h4>
            <DataTable
              columns={basicColumns}
              data={sampleUsers.filter((u) => u.status === 'inactive')}
              size="sm"
              density="compact"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
