'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge, Button } from '@bizflow/ui';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useFormatDate, DateFormatters } from '@/hooks';

export interface ReturnItem {
  id: string;
  returnNumber: string;
  status: string;
  refundAmount: number | string;
  createdAt: string;
  order?: {
    orderNumber: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'destructive';
    case 'pending':
      return 'warning';
    case 'completed':
      return 'default';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Menunggu Approval';
    case 'approved':
      return 'Disetujui';
    case 'rejected':
      return 'Ditolak';
    case 'completed':
      return 'Selesai';
    default:
      return status;
  }
};

export const getColumns = (
  formatters: DateFormatters,
  formatMessage?: any,
): ColumnDef<ReturnItem>[] => {
  const { formatDateTime } = formatters;
  const t = formatMessage || ((id: string) => id); // Use id if formatting function not provided

  const getStatusLabelText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('returns.status.pending') || 'Menunggu Approval';
      case 'approved':
        return t('returns.status.approved') || 'Disetujui';
      case 'rejected':
        return t('returns.status.rejected') || 'Ditolak';
      case 'completed':
        return t('returns.status.completed') || 'Selesai';
      default:
        return status;
    }
  };

  return [
    {
      accessorKey: 'returnNumber',
      header: t('returns.columns.returnNumber') || 'No. Retur',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.returnNumber}</span>
      ),
      meta: { title: t('returns.columns.returnNumber') || 'No. Retur' },
    },
    {
      id: 'orderNumber',
      header: t('returns.columns.orderNumber') || 'No. Order',
      cell: ({ row }) => row.original.order?.orderNumber || '-',
      meta: { title: t('returns.columns.orderNumber') || 'No. Order' },
    },
    {
      accessorKey: 'createdAt',
      header: t('returns.columns.date') || 'Tanggal',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
      meta: { title: t('returns.columns.date') || 'Tanggal' },
    },
    {
      accessorKey: 'status',
      header: t('returns.columns.status') || 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusColor(row.original.status) as any}>
          {getStatusLabelText(row.original.status)}
        </Badge>
      ),
      meta: { title: t('returns.columns.status') || 'Status' },
    },
    {
      accessorKey: 'refundAmount',
      header: () => (
        <div className="text-right">
          {t('returns.columns.totalRefund') || 'Total Refund'}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(Number(row.original.refundAmount || 0))}
        </div>
      ),
      meta: { title: t('returns.columns.totalRefund') || 'Total Refund' },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Link href={`/pos/returns/${row.original.id}`}>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
      enableHiding: false,
    },
  ];
};
