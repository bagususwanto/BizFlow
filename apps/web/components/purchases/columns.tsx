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
import { useFormatDate, DateFormatters } from '@/hooks';

interface GetColumnsProps {
  onDelete: (order: PurchaseOrder) => void;
  formatters: DateFormatters;
  t: (key: string) => string;
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
  formatters,
  t,
}: GetColumnsProps): ColumnDef<PurchaseOrder>[] => {
  const { formatDate: formatDateShort } = formatters;

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
      accessorKey: 'orderNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.poNumber')} />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('orderNumber')}</span>
        </div>
      ),
      meta: {
        title: t('columns.poNumber'),
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.date')} />
      ),
      cell: ({ row }) => formatDateShort(row.getValue('createdAt')),
      meta: {
        title: t('columns.date'),
      },
    },
    {
      accessorKey: 'supplier.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.supplier')} />
      ),
      meta: {
        title: t('columns.supplier'),
      },
    },
    {
      accessorKey: 'expectedDate',
      header: t('columns.expectedDate'),
      cell: ({ row }) => {
        const date = row.getValue('expectedDate');
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
                <span className="sr-only">{t('common.openMenu') || 'Buka menu'}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('common.actions') || 'Aksi'}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/purchases/orders/${order.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> {t('actions.detail')}
                </Link>
              </DropdownMenuItem>
              {order.status === 'draft' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/purchases/orders/${order.id}/edit`}>
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
