'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit, Trash2, Users } from 'lucide-react';

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
import type { Role } from '@/services/roles.service';

interface RolesColumnsProps {
  onDelete: (role: Role) => void;
  t: (key: string) => string;
}

export const getColumns = ({
  onDelete,
  t,
}: RolesColumnsProps): ColumnDef<Role>[] => [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.name')} />
    ),
    cell: ({ row }) => {
      const role = row.original;
      return (
        <div className="flex items-center gap-2 font-medium">
          {role.name}
          {role.isSystemRole && (
            <Badge variant="secondary" className="text-xs">
              {t('columns.systemBadge')}
            </Badge>
          )}
        </div>
      );
    },
    meta: {
      title: t('columns.name'),
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.description')} />
    ),
    cell: ({ row }) => row.getValue('description') || '-',
    meta: {
      title: t('columns.description'),
    },
  },
  {
    accessorKey: 'userCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.users')} />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Users className="h-3 w-3" />
        {row.original.userCount}
      </div>
    ),
    meta: {
      title: t('columns.users'),
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.lastUpdate')} />
    ),
    cell: ({ row }) => {
      return new Date(row.original.updatedAt).toLocaleDateString();
    },
    meta: {
      title: t('columns.lastUpdate'),
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const role = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{t('actions.viewMenu')}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('columns.actions')}</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/settings/roles/${role.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                {t('actions.edit')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(role)}
              disabled={role.isSystemRole}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
