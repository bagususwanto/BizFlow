'use client';

import { ColumnDef } from '@tanstack/react-table';
import { StockOpname } from '@bizflow/types';
import { Badge } from '@bizflow/ui';
import { MoreHorizontal, Eye, Trash, Edit } from 'lucide-react';
import { DateFormatters } from '@/hooks';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
} from '@bizflow/ui';
import { ColumnDef as TTableColumnDef } from '@tanstack/react-table';

interface ColumnsProps {
  onDelete: (opname: StockOpname) => void;
  formatters: DateFormatters;
  t: (key: string) => string;
}

export const getColumns = ({
  onDelete,
  formatters,
  t,
}: ColumnsProps): TTableColumnDef<StockOpname>[] => [
  {
    accessorKey: 'opnameNumber',
    header: t('columns.opnameNumber'),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('opnameNumber')}</div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: t('columns.date'),
    cell: ({ row }) => (
      <div>{formatters.formatDate(row.getValue('createdAt'))}</div>
    ),
  },
  {
    accessorKey: 'warehouse',
    header: t('columns.warehouse'),
    cell: ({ row }) => {
      const warehouseId = row.original.warehouseId;
      // Note: We'd typically expand this in the query to get the warehouse name
      // but without populated warehouse, we fallback to ID or use relation
      const warehouse = (row.original as any).warehouse;
      return <div>{warehouse?.name || warehouseId}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: t('columns.status'),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

      const variant =
        status === 'in_progress'
          ? 'outline'
          : status === 'finalized'
            ? 'default'
            : 'destructive';

      const badgeClass =
        status === 'finalized' ? 'bg-success hover:bg-success/90' : '';
      const label = t(`status.${status}`);

      return (
        <Badge variant={variant} className={`whitespace-nowrap ${badgeClass}`}>
          {label.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdBy',
    header: t('columns.createdBy'),
    cell: ({ row }) => {
      const creator = (row.original as any).creator;
      return <div>{creator?.name || '-'}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const opname = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{t('actions.viewMenu')}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/inventory/opname/${opname.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                {t('actions.viewDetails')}
              </Link>
            </DropdownMenuItem>

            {(opname.status === 'in_progress' ||
              opname.status === 'cancelled') && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(opname)}
              >
                <Trash className="mr-2 h-4 w-4" />
                {t('actions.delete')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
