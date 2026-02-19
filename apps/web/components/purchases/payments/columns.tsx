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
import { SupplierPayment } from '@bizflow/types';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface GetColumnsProps {
  onDelete: (payment: SupplierPayment) => void;
}

export const getColumns = ({
  onDelete,
}: GetColumnsProps): ColumnDef<SupplierPayment>[] => [
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
    accessorKey: 'paymentNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No. Pembayaran" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('paymentNumber')}</div>
    ),
  },
  {
    accessorKey: 'paymentDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) =>
      format(new Date(row.getValue('paymentDate')), 'dd MMM yyyy', {
        locale: id,
      }),
  },
  {
    id: 'supplier',
    header: 'Pemasok',
    cell: ({ row }) => row.original.supplier?.name,
  },
  {
    id: 'purchaseOrder',
    header: 'Ref. PO',
    cell: ({ row }) => row.original.purchaseOrder?.orderNumber,
  },
  {
    id: 'account',
    header: 'Akun',
    cell: ({ row }) => row.original.account?.name,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jumlah" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {formatCurrency(row.getValue('amount'))}
      </div>
    ),
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Metode',
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
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/purchases/payments/${payment.id}`}>
                <Eye className="mr-2 h-4 w-4" /> Detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/purchases/payments/${payment.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(payment)}
            >
              <Trash className="mr-2 h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
