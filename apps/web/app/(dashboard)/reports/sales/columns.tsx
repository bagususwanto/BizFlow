'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SalesOrder } from '@/services/reports.service';
import { Badge, formatCurrency, formatDate } from '@bizflow/ui';
import { BadgeCheck, XCircle, Clock } from 'lucide-react';

export const getColumns = (t: any): ColumnDef<SalesOrder>[] => [
  {
    accessorKey: 'orderNumber',
    header: t('columns.orderNumber'),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('orderNumber')}</span>
    ),
  },
  {
    accessorKey: 'orderDate',
    header: t('columns.date'),
    cell: ({ row }) => formatDate(row.getValue('orderDate')),
  },
  {
    accessorKey: 'customerName',
    header: t('columns.customer.label'),
    cell: ({ row }) =>
      row.getValue('customerName') || t('columns.customer.general'),
  },
  {
    accessorKey: 'outletName',
    header: t('columns.outlet'),
  },
  {
    accessorKey: 'items',
    header: t('columns.product.label'),
    cell: ({ row }) => {
      const items = row.original.items;
      if (!items || items.length === 0) return '-';

      const firstItem = items[0];
      if (!firstItem) return '-';

      const count = items.length;

      return (
        <div className="flex flex-col text-sm">
          <span>
            {firstItem.productName}{' '}
            {count > 1 ? `+${count - 1} ${t('columns.product.others')}` : ''}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'paymentStatus',
    header: t('columns.status.label'),
    cell: ({ row }) => {
      const status = row.getValue('paymentStatus') as string;

      if (status === 'paid') {
        return (
          <Badge
            variant="outline"
            className="gap-1 border-green-600 text-green-600 bg-green-50 dark:bg-green-900/20"
          >
            <BadgeCheck className="h-3 w-3" />
            {t('columns.status.paid')}
          </Badge>
        );
      }

      if (status === 'unpaid') {
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t('columns.status.unpaid')}
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
    header: () => <div className="text-right">{t('columns.total')}</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue('total'))}
        </div>
      );
    },
  },
];
