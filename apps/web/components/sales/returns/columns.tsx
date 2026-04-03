'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Trash } from 'lucide-react';
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
import { SalesReturn } from '@bizflow/types';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormatDate, DateFormatters } from '@/hooks';

interface GetColumnsProps {
  onDelete: (ret: SalesReturn) => void;
  formatters: DateFormatters;
  t: (key: string) => string;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'secondary';
    case 'completed':
      return 'success';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getColumns = ({
  onDelete,
  formatters,
  t,
}: GetColumnsProps): ColumnDef<SalesReturn>[] => {
  const { formatDate } = formatters;

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'returnNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('columns.returnNumber')}
        />
      ),
      cell: ({ row }) => {
        const orderNumber = row.original.order?.orderNumber;
        const invoiceNumber = (row.original as any).invoice?.invoiceNumber;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-blue-600 hover:underline">
              <Link href={`/sales/returns/${row.original.id}`}>
                {row.getValue('returnNumber')}
              </Link>
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {invoiceNumber ? `INV: ${invoiceNumber}` : `SO: ${orderNumber}`}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.date')} />
      ),
      cell: ({ row }) => formatDate(row.getValue('createdAt')),
    },
    {
      id: 'customer',
      header: t('columns.customer'),
      cell: ({ row }) => row.original.order?.customer?.name || '-',
    },
    {
      accessorKey: 'refundAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.refundAmount')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.getValue('refundAmount'))}
        </div>
      ),
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
            {t(`status.${status}`) || status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const ret = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('actions.viewMenu')}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/sales/returns/${ret.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> {t('actions.viewDetails')}
                </Link>
              </DropdownMenuItem>
              {ret.status === 'pending' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(ret)}
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
