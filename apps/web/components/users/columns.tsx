'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Lock,
  RotateCcw,
} from 'lucide-react';

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@bizflow/ui';
import type { User } from '@bizflow/types';

interface UsersColumnsProps {
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
  onChangePin: (user: User) => void;
}

export const getColumns = ({
  onDelete,
  onResetPassword,
  onChangePin,
}: UsersColumnsProps): ColumnDef<User>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        aria-label="Select all"
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        aria-label="Select row"
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'username',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Username
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.username}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.email}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Nama Lengkap
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
  },
  {
    accessorKey: 'role.name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Role
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.role?.name || '-'}
      </Badge>
    ),
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Status
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'lastLogin',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Login Terakhir
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      if (!row.original.lastLogin) return '-';
      return new Date(row.original.lastLogin).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      // Prevent deleting owner or active admin check should be in logic, but here we can just show/hide based on user
      // Simpler to just show all and let backend reject if invalid

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/settings/users/${user.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onResetPassword(user)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangePin(user)}>
              <Lock className="mr-2 h-4 w-4" />
              Ganti PIN
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.isActive ? (
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(user)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Nonaktifkan
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled // Reactivation not in requirement yet
              >
                <Lock className="mr-2 h-4 w-4" />
                Sudah Nonaktif
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
