'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Trash, Edit, Send } from 'lucide-react';
import Link from 'next/link';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Checkbox,
} from '@bizflow/ui';
import { StockTransfer } from '@bizflow/types';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DateFormatters } from '@/hooks';

interface GetColumnsProps {
  onDelete: (transfer: StockTransfer) => void;
  formatters: DateFormatters;
  t: (key: string) => string;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'draft':
      return 'outline';
    case 'sent':
      return 'warning';
    case 'received':
      return 'success';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getColumns = ({
  onDelete,
  formatters,
  t,
}: GetColumnsProps): ColumnDef<StockTransfer>[] => {
  const { formatDate } = formatters;

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t('columns.selectAll')}
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t('columns.selectRow')}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'transferNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('columns.transferNumber')}
        />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('transferNumber')}</div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.date')} />
      ),
      cell: ({ row }) => formatDate(row.getValue('createdAt')),
    },
    {
      id: 'fromWarehouse',
      header: t('columns.fromWarehouse'),
      cell: ({ row }) => row.original.fromWarehouse?.name || '-',
    },
    {
      id: 'toWarehouse',
      header: t('columns.toWarehouse'),
      cell: ({ row }) => row.original.toWarehouse?.name || '-',
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.status')} />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={statusBadgeVariant(status) as any}>
            {t(`status.${status}`) || status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const transfer = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">
                  {t('actions.viewMenu') || 'Open menu'}
                </span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('columns.actions')}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/inventory/transfers/${transfer.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> {t('actions.viewDetails')}
                </Link>
              </DropdownMenuItem>
              {transfer.status === 'draft' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(transfer)}
                  >
                    <Trash className="mr-2 h-4 w-4" /> {t('actions.delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
