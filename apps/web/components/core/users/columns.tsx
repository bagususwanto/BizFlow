'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit, Trash2, Lock, RotateCcw } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

import {
  Badge,
  Button,
  Checkbox,
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
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Pilih semua"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Pilih baris"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.username}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.email}
        </span>
      </div>
    ),
    meta: {
      title: 'Username',
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Lengkap" />
    ),
    meta: {
      title: 'Nama Lengkap',
    },
  },
  {
    accessorKey: 'role.name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Peran" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.role?.name || '-'}
      </Badge>
    ),
    meta: {
      title: 'Peran',
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      );
    },
    meta: {
      title: 'Status',
    },
  },
  {
    accessorKey: 'lastLogin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Login Terakhir" />
    ),
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
    meta: {
      title: 'Login Terakhir',
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
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/settings/users/${user.id}`}>
                <Edit className="mr-2 h-4 w-4" />
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
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(user as any)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
