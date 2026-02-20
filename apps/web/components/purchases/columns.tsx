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
import {
  PurchaseOrder,
  PurchaseOrderStatus,
  PaymentStatus,
} from '@bizflow/types';
import { formatCurrency } from '@bizflow/ui';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface GetColumnsProps {
  onDelete: (order: PurchaseOrder) => void;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case PurchaseOrderStatus.DRAFT:
      return 'secondary';
    case PurchaseOrderStatus.PENDING_APPROVAL:
      return 'warning';
    case PurchaseOrderStatus.APPROVED:
    case PurchaseOrderStatus.CONFIRMED:
    case 'ordered':
      return 'default';
    case PurchaseOrderStatus.PARTIAL:
    case 'received':
      return 'outline'; // Or consider choosing another distinct color for partial/received
    case PurchaseOrderStatus.COMPLETED:
      return 'success';
    case PurchaseOrderStatus.CANCELLED:
      return 'destructive';
    default:
      return 'outline';
  }
};

const paymentBadgeVariant = (status: string) => {
  switch (status) {
    case PaymentStatus.PAID:
      return 'success';
    case PaymentStatus.PARTIAL:
      return 'warning';
    case PaymentStatus.UNPAID:
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getColumns = ({
  onDelete,
}: GetColumnsProps): ColumnDef<PurchaseOrder>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Pilih semua"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Pilih baris"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'orderNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No. PO" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue('orderNumber')}</span>
      </div>
    ),
    meta: {
      title: 'No. PO',
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) =>
      format(new Date(row.getValue('createdAt')), 'dd MMM yyyy', {
        locale: id,
      }),
    meta: {
      title: 'Tanggal',
    },
  },
  {
    accessorKey: 'supplier.name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pemasok" />
    ),
    meta: {
      title: 'Pemasok',
    },
  },
  {
    accessorKey: 'expectedDate',
    header: 'Tgl. Ekspektasi',
    cell: ({ row }) => {
      const date = row.getValue('expectedDate');
      return date
        ? format(new Date(date as string), 'dd MMM yyyy', { locale: id })
        : '-';
    },
  },
  {
    accessorKey: 'total',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{formatCurrency(row.getValue('total'))}</div>
    ),
    meta: {
      title: 'Total',
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={statusBadgeVariant(status) as any}>
          {status.toUpperCase()}
        </Badge>
      );
    },
    meta: {
      title: 'Status',
    },
  },
  {
    accessorKey: 'paymentStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pembayaran" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('paymentStatus') as string;
      return (
        <Badge variant={paymentBadgeVariant(status) as any}>
          {status.toUpperCase()}
        </Badge>
      );
    },
    meta: {
      title: 'Pembayaran',
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/purchases/orders/${order.id}`}>
                <Eye className="mr-2 h-4 w-4" /> Detail
              </Link>
            </DropdownMenuItem>
            {order.status === 'draft' && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={`/purchases/orders/${order.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(order)}
                >
                  <Trash className="mr-2 h-4 w-4" /> Hapus
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
