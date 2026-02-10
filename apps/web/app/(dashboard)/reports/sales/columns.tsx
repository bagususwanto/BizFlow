'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SalesOrder } from '@/services/reports.service';
import { Badge, formatCurrency, formatDate } from '@bizflow/ui';
import { BadgeCheck, XCircle, Clock } from 'lucide-react';

export const columns: ColumnDef<SalesOrder>[] = [
  {
    accessorKey: 'orderNumber',
    header: 'No. Pesanan',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('orderNumber')}</span>
    ),
  },
  {
    accessorKey: 'orderDate',
    header: 'Tanggal',
    cell: ({ row }) => formatDate(row.getValue('orderDate')),
  },
  {
    accessorKey: 'customerName',
    header: 'Pelanggan',
    cell: ({ row }) => row.getValue('customerName') || 'Umum',
  },
  {
    accessorKey: 'outletName',
    header: 'Outlet',
  },
  {
    accessorKey: 'items',
    header: 'Produk',
    cell: ({ row }) => {
      const items = row.original.items;
      if (!items || items.length === 0) return '-';

      const firstItem = items[0];
      if (!firstItem) return '-';

      const count = items.length;

      return (
        <div className="flex flex-col text-sm">
          <span>
            {firstItem.productName} {count > 1 ? `+${count - 1} lainnya` : ''}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'paymentStatus',
    header: 'Status Pembayaran',
    cell: ({ row }) => {
      const status = row.getValue('paymentStatus') as string;

      if (status === 'paid') {
        return (
          <Badge
            variant="outline"
            className="gap-1 border-green-600 text-green-600 bg-green-50 dark:bg-green-900/20"
          >
            <BadgeCheck className="h-3 w-3" />
            Lunas
          </Badge>
        );
      }

      if (status === 'unpaid') {
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Belum Lunas
          </Badge>
        );
      }

      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'total',
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue('total'))}
        </div>
      );
    },
  },
];
