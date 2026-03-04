'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Trash, Edit } from 'lucide-react';
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
import { StockAdjustment } from '@bizflow/types';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DateFormatters } from '@/hooks';

interface GetColumnsProps {
  onDelete: (adjustment: StockAdjustment) => void;
  formatters: DateFormatters;
  t: (key: string) => string;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'draft':
      return 'outline';
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

const typeBadgeVariant = (type: string) => {
  switch (type) {
    case 'increase':
      return 'secondary';
    case 'decrease':
      return 'warning';
    case 'correction':
      return 'default';
    default:
      return 'outline';
  }
};

export const getColumns = ({
  onDelete,
  formatters,
  t,
}: GetColumnsProps): ColumnDef<StockAdjustment>[] => {
  const { formatDate } = formatters;

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t('columns.selectAll') || 'Pilih semua'}
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t('columns.selectRow') || 'Pilih baris'}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'adjustmentNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('columns.adjustmentNumber')}
        />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('adjustmentNumber')}</div>
      ),
    },
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.date')} />
      ),
      cell: ({ row }) => formatDate(row.getValue('date')),
    },
    {
      id: 'warehouse',
      header: t('columns.warehouse'),
      cell: ({ row }) => row.original.warehouse?.name || '-',
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.type')} />
      ),
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return (
          <Badge variant={typeBadgeVariant(type) as any}>
            {t(`typeEnums.${type}`) || type.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'reason',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.reason')} />
      ),
      cell: ({ row }) => {
        const reason = row.getValue('reason') as string;
        return t(`reasonEnums.${reason}`) || reason;
      },
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
        const adjustment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">
                  {t('actions.viewMenu') || 'Buka menu'}
                </span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('columns.actions')}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/inventory/adjustments/${adjustment.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> {t('actions.viewDetails')}
                </Link>
              </DropdownMenuItem>
              {adjustment.status === 'draft' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(adjustment)}
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
