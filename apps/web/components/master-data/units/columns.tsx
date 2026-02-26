'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@bizflow/ui';
import type { UnitOfMeasure } from '@bizflow/types';

interface UnitsColumnsProps {
  onDelete: (unit: UnitOfMeasure) => void;
  t: (key: string) => string;
  tCommon: (key: string) => string;
}

export const getColumns = ({
  onDelete,
  t,
  tCommon,
}: UnitsColumnsProps): ColumnDef<UnitOfMeasure>[] => [
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
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
    meta: {
      title: t('columns.name'),
    },
  },
  {
    accessorKey: 'symbol',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.symbol')} />
    ),
    meta: {
      title: t('columns.symbol'),
    },
  },
  {
    id: 'baseUnit',
    accessorFn: (row) => row.baseUnit?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.baseUnit')} />
    ),
    cell: ({ row }) => row.original.baseUnit?.name || '-',
    meta: {
      title: t('columns.baseUnit'),
    },
  },
  {
    accessorKey: 'conversionRate',
    header: t('columns.conversionRate'),
    cell: ({ row }) => row.original.conversionRate || '-',
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const unit = row.original;

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
              <Link href={`/master-data/units/${unit.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(unit)}
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
