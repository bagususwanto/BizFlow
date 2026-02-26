'use client';

import { ColumnDef } from '@tanstack/react-table';
import { PaymentTerm } from '@bizflow/types';
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
  onDelete: (term: PaymentTerm) => void;
  t: (key: string) => string;
  tCommon: (key: string) => string;
}

export const getColumns = ({
  onDelete,
  t,
  tCommon,
}: ColumnsProps): ColumnDef<PaymentTerm>[] => [
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
    meta: {
      title: 'Nama Termin',
    },
  },
  {
    accessorKey: 'daysDue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.daysDue')} />
    ),
    cell: ({ row }) => `${row.original.daysDue} ${tCommon('day')}`,
  },
  {
    accessorKey: 'description',
    header: t('columns.description'),
    cell: ({ row }) => (
      <span
        className="truncate max-w-[200px] block text-muted-foreground"
        title={row.original.description || ''}
      >
        {row.original.description || '-'}
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
      const term = row.original;

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
              <Link href={`/master-data/payment-terms/${term.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(term)}
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
