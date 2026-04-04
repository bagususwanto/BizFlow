'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';

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
import type { Outlet } from '@/services/outlets.service';

interface OutletsColumnsProps {
  onDelete: (outlet: Outlet) => void;
  t: any;
}

export const getColumns = ({
  onDelete,
  t,
}: OutletsColumnsProps): ColumnDef<Outlet>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.code')} />
    ),
    cell: ({ row }) => <span className="font-mono">{row.original.code}</span>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.name')} />
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.address')} />
    ),
    cell: ({ row }) => (
      <div
        className="max-w-[200px] truncate"
        title={row.original.address || ''}
      >
        {row.original.address || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'userCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.users')} />
    ),
    cell: ({ row }) => <span>{row.original.userCount || 0}</span>,
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.status')} />
    ),
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? t('columns.active') : t('columns.inactive')}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const outlet = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{t('common.openMenu')}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/settings/outlets/${outlet.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                {t('common.edit')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(outlet)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
