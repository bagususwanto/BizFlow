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
): ColumnDef<ReturnItem>[] => {
  const { formatDateTime } = formatters;

  return [
    {
      accessorKey: 'returnNumber',
      header: 'No. Retur',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.returnNumber}</span>
      ),
      meta: { title: 'No. Retur' },
    },
    {
      id: 'orderNumber',
      header: 'No. Order',
      cell: ({ row }) => row.original.order?.orderNumber || '-',
      meta: { title: 'No. Order' },
    },
    {
      accessorKey: 'createdAt',
      header: 'Tanggal',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
      meta: { title: 'Tanggal' },
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
      accessorKey: 'refundAmount',
      header: () => <div className="text-right">Total Refund</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(Number(row.original.refundAmount || 0))}
        </div>
      ),
      meta: { title: 'Total Refund' },
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
