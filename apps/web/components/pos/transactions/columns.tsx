'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge, Button } from '@bizflow/ui';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

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

export const getColumns = (): ColumnDef<TransactionItem>[] => [
  {
    accessorKey: 'orderNumber',
    header: 'No. Order',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.orderNumber}</span>
    ),
    meta: { title: 'No. Order' },
  },
  {
    accessorKey: 'createdAt',
    header: 'Tanggal',
    cell: ({ row }) =>
      format(new Date(row.original.createdAt), 'dd MMM yyyy HH:mm', {
        locale: idLocale,
      }),
    meta: { title: 'Tanggal' },
  },
  {
    id: 'customerName',
    header: 'Pelanggan',
    cell: ({ row }) => row.original.customer?.name || 'Umum',
    meta: { title: 'Pelanggan' },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={getStatusColor(row.original.status) as any}>
        {getStatusLabel(row.original.status)}
      </Badge>
    ),
    meta: { title: 'Status' },
  },
  {
    accessorKey: 'grandTotal',
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(Number(row.original.grandTotal || 0))}
      </div>
    ),
    meta: { title: 'Total' },
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
