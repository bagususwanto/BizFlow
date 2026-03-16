'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Trash, Edit, CheckCircle } from 'lucide-react';
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
  Invoice,
} from '@bizflow/types';
import { formatCurrency } from '@bizflow/ui';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DateFormatters } from '@/hooks';

interface GetColumnsProps {
  onDelete: (invoice: Invoice) => void;
  formatters: DateFormatters;
  t: (key: string) => string;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'draft':
      return 'secondary';
    case 'sent':
      return 'default';
    case 'paid':
      return 'success';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const paymentBadgeVariant = (status: string) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'partial':
      return 'warning';
    case 'unpaid':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getColumns = ({
  onDelete,
  formatters,
  t,
}: GetColumnsProps): ColumnDef<Invoice>[] => {
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
      accessorKey: 'invoiceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.invoiceNumber')} />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('invoiceNumber')}</span>
        </div>
      ),
      meta: {
        title: t('columns.invoiceNumber'),
      },
    },
    {
      accessorKey: 'invoiceDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.date')} />
      ),
      cell: ({ row }) => {
        const date = row.getValue('invoiceDate');
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
        const invoice = row.original;

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
                <Link href={`/sales/invoices/${invoice.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> {t('actions.detail')}
                </Link>
              </DropdownMenuItem>
              {invoice.status === 'draft' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/sales/invoices/${invoice.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> {t('actions.edit')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(invoice)}
                  >
                    <Trash className="mr-2 h-4 w-4" /> {t('actions.delete')}
                  </DropdownMenuItem>
                </>
              )}
              {invoice.paymentStatus !== 'paid' && invoice.status !== 'draft' && invoice.status !== 'cancelled' && (
                 <>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem asChild>
                     <Link href={`/sales/invoices/${invoice.id}/payments/new`}>
                       <CheckCircle className="mr-2 h-4 w-4" /> {t('actions.receivePayment')}
                     </Link>
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
