'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Supplier } from '@bizflow/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Button,
  Badge,
  Checkbox,
} from '@bizflow/ui';
import { MoreHorizontal, Edit, Trash2, History } from 'lucide-react';
import Link from 'next/link';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

interface ColumnsProps {
  onDelete: (supplier: Supplier) => void;
}

export const getColumns = ({
  onDelete,
}: ColumnsProps): ColumnDef<Supplier>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Pilih semua"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Pilih baris"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode" />
    ),
    meta: {
      title: 'Kode',
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Pemasok" />
    ),
    meta: {
      title: 'Nama Pemasok',
    },
  },
  {
    accessorKey: 'phone',
    header: 'Telepon',
    cell: ({ row }) => row.original.phone || '-',
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email || '-',
  },
  {
    accessorKey: 'paymentTerm',
    header: 'Termin',
    cell: ({ row }) => {
      const term = row.original.paymentTerm;
      return term ? term.name : '-';
    },
  },
  {
    accessorKey: 'address',
    header: 'Alamat',
    cell: ({ row }) => (
      <span
        className="truncate max-w-[200px] block"
        title={row.original.address || ''}
      >
        {row.original.address || '-'}
      </span>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Aktif' : 'Non-aktif'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const supplier = row.original;

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
              <Link href={`/purchases/orders?supplierId=${supplier.id}`}>
                <History className="mr-2 h-4 w-4" />
                Riwayat Pembelian
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/master-data/suppliers/${supplier.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(supplier)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
