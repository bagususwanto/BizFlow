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
import { formatCurrency } from '@bizflow/ui';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DateFormatters } from '@/hooks';

interface GetColumnsProps {
  onDelete: (quotation: any) => void;
  formatters: DateFormatters;
  t: (key: string) => string;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'draft':
      return 'secondary';
    case 'sent':
      return 'default';
    case 'accepted':
      return 'success';
    case 'rejected':
    case 'expired':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getColumns = ({
  onDelete,
  formatters,
  t,
}: GetColumnsProps): ColumnDef<any>[] => {
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
      accessorKey: 'quotationNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('columns.quotationNumber')}
        />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('quotationNumber')}</span>
        </div>
      ),
      meta: {
        title: t('columns.quotationNumber'),
      },
    },
    {
      accessorKey: 'quotationDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.date')} />
      ),
      cell: ({ row }) => {
        const date = row.getValue('quotationDate');
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
      accessorKey: 'validUntil',
      header: t('columns.validUntil'),
      cell: ({ row }) => {
        const date = row.getValue('validUntil');
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
      id: 'actions',
      cell: ({ row }) => {
        const quotation = row.original;

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
                <Link href={`/sales/quotations/${quotation.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> {t('actions.detail')}
                </Link>
              </DropdownMenuItem>
              {['draft'].includes(quotation.status) && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/sales/quotations/${quotation.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> {t('actions.edit')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(quotation)}
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
