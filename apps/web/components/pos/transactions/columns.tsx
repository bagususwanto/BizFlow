'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge, Button } from '@bizflow/ui';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useFormatDate, DateFormatters } from '@/hooks';

export interface TransactionItem {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: number | string;
  createdAt: string;
  customer?: {
    name: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'destructive';
    case 'partially_paid':
      return 'default';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'paid':
      return 'Lunas';
    case 'pending':
      return 'Belum Lunas';
    case 'cancelled':
      return 'Dibatalkan';
    case 'partially_paid':
      return 'Cicilan';
    default:
      return status;
  }
};

export const getColumns = (
  formatters: DateFormatters,
  formatMessage?: any,
): ColumnDef<TransactionItem>[] => {
  const { formatDateTime } = formatters;
  const t = formatMessage || ((id: string) => id); // Use id if formatting function not provided

  const getStatusLabelText = (status: string) => {
    switch (status) {
      case 'paid':
        return t('transactions.status.paid') || 'Lunas';
      case 'pending':
        return t('transactions.status.pending') || 'Belum Lunas';
      case 'cancelled':
        return t('transactions.status.cancelled') || 'Dibatalkan';
      case 'partially_paid':
        return t('transactions.status.partiallyPaid') || 'Cicilan';
      default:
        return status;
    }
  };

  return [
    {
      accessorKey: 'orderNumber',
      header: t('transactions.columns.orderNumber') || 'No. Order',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.orderNumber}</span>
      ),
      meta: { title: t('transactions.columns.orderNumber') || 'No. Order' },
    },
    {
      accessorKey: 'createdAt',
      header: t('transactions.columns.date') || 'Tanggal',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
      meta: { title: t('transactions.columns.date') || 'Tanggal' },
    },
    {
      id: 'customerName',
      header: t('transactions.columns.customer') || 'Pelanggan',
      cell: ({ row }) =>
        row.original.customer?.name ||
        t('transactions.columns.generalCustomer') ||
        'Umum',
      meta: { title: t('transactions.columns.customer') || 'Pelanggan' },
    },
    {
      accessorKey: 'status',
      header: t('transactions.columns.status') || 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusColor(row.original.status) as any}>
          {getStatusLabelText(row.original.status)}
        </Badge>
      ),
      meta: { title: t('transactions.columns.status') || 'Status' },
    },
    {
      accessorKey: 'grandTotal',
      header: () => (
        <div className="text-right">
          {t('transactions.columns.total') || 'Total'}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(Number(row.original.grandTotal || 0))}
        </div>
      ),
      meta: { title: t('transactions.columns.total') || 'Total' },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Link href={`/pos/transactions/${row.original.id}`}>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
      enableHiding: false,
    },
  ];
};
