'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Supplier } from '@bizflow/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Button,
  Badge,
  Checkbox,
} from '@bizflow/ui';
import { MoreHorizontal, Edit, Trash2, History } from 'lucide-react';
import Link from 'next/link';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

interface ColumnsProps {
  onDelete: (supplier: Supplier) => void;
  t: (key: string) => string;
  tCommon: (key: string) => string;
}

export const getColumns = ({
  onDelete,
  t,
  tCommon,
}: ColumnsProps): ColumnDef<Supplier>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={tCommon('selectAll') || 'Pilih semua'}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={tCommon('selectRow') || 'Pilih baris'}
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
    meta: {
      title: t('columns.code'),
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.name')} />
    ),
    meta: {
      title: t('columns.name'),
    },
  },
  {
    accessorKey: 'phone',
    header: t('columns.phone'),
    cell: ({ row }) => row.original.phone || '-',
  },
  {
    accessorKey: 'email',
    header: t('columns.email'),
    cell: ({ row }) => row.original.email || '-',
  },
  {
    accessorKey: 'paymentTerm',
    header: t('form.paymentTermLabel'),
    cell: ({ row }) => {
      const term = row.original.paymentTerm;
      return term ? term.name : '-';
    },
  },
  {
    accessorKey: 'address',
    header: t('columns.address'),
    cell: ({ row }) => (
      <span
        className="truncate max-w-[200px] block"
        title={row.original.address || ''}
      >
        {row.original.address || '-'}
      </span>
    ),
  },
  {
    accessorKey: 'isActive',
    header: t('columns.isActive'),
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? tCommon('status.active') : tCommon('status.inactive')}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const supplier = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{tCommon('openMenu')}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{tCommon('actions')}</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/purchases/orders?supplierId=${supplier.id}`}>
                <History className="mr-2 h-4 w-4" />
                {tCommon('historyPurchase')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/master-data/suppliers/${supplier.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(supplier)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {tCommon('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
