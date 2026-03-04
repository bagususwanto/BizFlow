'use client';

import { ColumnDef } from '@tanstack/react-table';
import { GoodsReceive } from '@bizflow/types';
import { Button } from '@bizflow/ui';
import { MoreHorizontal, Eye, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Checkbox,
} from '@bizflow/ui';
import Link from 'next/link';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DateFormatters } from '@/hooks';

interface ColumnsProps {
  onDelete: (goodsReceive: GoodsReceive) => void;
  formatters: DateFormatters;
  t: (key: string) => string;
}

export const getColumns = ({
  onDelete,
  formatters,
  t,
}: ColumnsProps): ColumnDef<GoodsReceive>[] => {
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
      accessorKey: 'receiveNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('columns.receiveNumber')}
        />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('receiveNumber')}</div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.date')} />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return <div>{formatDate(date)}</div>;
      },
    },
    {
      accessorKey: 'purchaseOrder.orderNumber',
      header: t('columns.poNumber'),
      cell: ({ row }) => {
        return (
          <Link
            href={`/purchases/orders/${row.original.purchaseOrderId}`}
            className="text-primary hover:underline"
          >
            {row.original.purchaseOrder?.orderNumber}
          </Link>
        );
      },
    },
    {
      accessorKey: 'warehouse.name',
      header: t('columns.warehouse'),
      cell: ({ row }) => <div>{row.original.warehouse?.name}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const goodsReceive = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {t('columns.actions.label') || 'Aksi'}
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/purchases/goods-receive/${goodsReceive.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('columns.actions.detail') || 'Detail'}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(goodsReceive)}
              >
                <Trash className="mr-2 h-4 w-4" />
                {t('columns.actions.delete') || 'Hapus'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
