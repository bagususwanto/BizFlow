'use client';

// Force type re-evaluation

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
  formatCurrency,
} from '@bizflow/ui';
import { Payment as CustomerPayment } from '@bizflow/types';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormatDate, DateFormatters } from '@/hooks';

interface GetColumnsProps {
  onDelete: (payment: CustomerPayment) => void;
  formatters: DateFormatters;
  t: (key: string) => string;
}

export const getColumns = ({
  onDelete,
  formatters,
  t,
}: GetColumnsProps): ColumnDef<CustomerPayment>[] => {
  const { formatDate } = formatters;

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t('columns.selectAll')}
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t('columns.selectRow')}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'paymentNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('columns.paymentNumber')}
        />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('paymentNumber')}</div>
      ),
    },
    {
      accessorKey: 'paymentDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.date')} />
      ),
      cell: ({ row }) => formatDate(row.getValue('paymentDate')),
    },
    {
      id: 'customer',
      header: t('columns.customer'),
      cell: ({ row }) => (row.original as any).customer?.name,
    },
    {
      id: 'invoice',
      header: t('columns.invoiceRef'),
      cell: ({ row }) => (row.original as any).invoice?.invoiceNumber,
    },
    {
      id: 'account',
      header: t('columns.account'),
      cell: ({ row }) => (row.original as any).account?.name,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.amount')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.getValue('amount'))}
        </div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: t('columns.method'),
      cell: ({ row }) => {
        const method = row.getValue('paymentMethod') as string;
        // Simple mapping or capitalize
        return <Badge variant="outline">{method}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t('columns.actions.openMenu')}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {t('columns.actions.label')}
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/sales/payments/${payment.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> {t('columns.actions.detail')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/sales/payments/${payment.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" /> {t('columns.actions.edit')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(payment)}
              >
                <Trash className="mr-2 h-4 w-4" /> {t('columns.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
