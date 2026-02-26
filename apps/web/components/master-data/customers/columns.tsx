'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Customer } from '@bizflow/types';
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
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

interface ColumnsProps {
  onDelete: (customer: Customer) => void;
  t: (key: string) => string;
  tCommon: (key: string) => string;
}

export const getColumns = ({
  onDelete,
  t,
  tCommon,
}: ColumnsProps): ColumnDef<Customer>[] => [
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
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.code')} />
    ),
    meta: {
      title: 'Kode',
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.name')} />
    ),
    meta: {
      title: 'Nama Pelanggan',
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
    accessorKey: 'creditLimit',
    header: t('columns.creditLimit'),
    cell: ({ row }) => {
      const amount = parseFloat(firstString(row.original.creditLimit));
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
      }).format(amount);
    },
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
      const customer = row.original;

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
              <Link href={`/master-data/customers/${customer.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(customer)}
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

// Helper to handle Decimal type which might be string or number in frontend
function firstString(val: any): string {
  if (typeof val === 'number') return String(val);
  return String(val || 0);
}
