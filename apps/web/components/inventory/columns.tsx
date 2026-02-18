'use client';

import { ColumnDef } from '@tanstack/react-table';
import { GoodsReceive } from '@bizflow/types';
import { Button } from '@bizflow/ui';
import { ArrowUpDown, MoreHorizontal, Eye, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@bizflow/ui';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ColumnsProps {
  onDelete: (goodsReceive: GoodsReceive) => void;
}

export const getColumns = ({
  onDelete,
}: ColumnsProps): ColumnDef<GoodsReceive>[] => [
  {
    accessorKey: 'receiveNumber',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          No. Penerimaan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('receiveNumber')}</div>
    ),
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Tanggal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return <div>{format(date, 'dd MMM yyyy', { locale: id })}</div>;
    },
  },
  {
    accessorKey: 'purchaseOrder.orderNumber',
    header: 'No. PO',
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
    header: 'Gudang',
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
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/purchases/goods-receive/${goodsReceive.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(goodsReceive)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
