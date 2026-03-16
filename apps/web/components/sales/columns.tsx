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
  SalesOrder,
  PaymentStatus,
} from '@bizflow/types';
import { formatCurrency } from '@bizflow/ui';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DateFormatters } from '@/hooks';

interface GetColumnsProps {
  onDelete: (order: SalesOrder) => void;
  formatters: DateFormatters;
  t: (key: string) => string;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'draft':
      return 'secondary';
    case 'confirmed':
    case 'invoiced':
      return 'default';
    case 'completed':
      return 'success';
    case 'cancelled':
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
  formatters,
  t,
}: GetColumnsProps): ColumnDef<SalesOrder>[] => {
  const { formatDate: formatDateShort } = formatters;

  return [
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
        <DataTableColumnHeader column={column} title={t('columns.soNumber')} />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('orderNumber')}</span>
        </div>
      ),
      meta: {
        title: t('columns.soNumber'),
      },
    },
    {
      accessorKey: 'orderDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.date')} />
      ),
      cell: ({ row }) => {
        const date = row.getValue('orderDate');
        return date ? formatDateShort(date as string) : '-';
      },
      meta: {
        title: t('columns.date'),
      },
    },
    {
      accessorKey: 'customer.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.customer')} />
      ),
      meta: {
        title: t('columns.customer'),
      },
    },
    {
      accessorKey: 'dueDate',
      header: t('columns.dueDate'),
      cell: ({ row }) => {
        const date = row.getValue('dueDate');
        return date ? formatDateShort(date as string) : '-';
      },
    },
    {
      accessorKey: 'total',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.total')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.getValue('total'))}
        </div>
      ),
      meta: {
        title: t('columns.total'),
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
            {t(`status.${status}`)}
          </Badge>
        );
      },
      meta: {
        title: t('columns.status'),
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.payment')} />
      ),
      cell: ({ row }) => {
        const status = row.getValue('paymentStatus') as string;
        return (
          <Badge variant={paymentBadgeVariant(status) as any}>
            {t(`paymentStatus.${status}`)}
          </Badge>
        );
      },
      meta: {
        title: t('columns.payment'),
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
                <Link href={`/sales/orders/${order.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> {t('actions.detail')}
                </Link>
              </DropdownMenuItem>
              {order.status === 'draft' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/sales/orders/${order.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> {t('actions.edit')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(order)}
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
