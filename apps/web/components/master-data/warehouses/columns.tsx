'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Warehouse } from '@bizflow/types';
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
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

interface ColumnsProps {
  onDelete: (warehouse: Warehouse) => void;
}

export const getColumns = ({
  onDelete,
}: ColumnsProps): ColumnDef<Warehouse>[] => [
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
      <DataTableColumnHeader column={column} title="Nama Gudang" />
    ),
    meta: {
      title: 'Nama Gudang',
    },
  },
  {
    accessorKey: 'address',
    header: 'Alamat',
    cell: ({ row }) => row.original.address || '-',
    meta: {
      title: 'Alamat',
    },
  },
  {
    accessorKey: 'isDefault',
    header: 'Default',
    cell: ({ row }) =>
      row.original.isDefault ? <Badge variant="default">Default</Badge> : null,
    meta: {
      title: 'Default',
    },
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
    meta: {
      title: 'Status',
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const warehouse = row.original;

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
              <Link href={`/master-data/warehouses/${warehouse.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(warehouse)}
              disabled={warehouse.isDefault} // Prevent delete from UI for default warehouse
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
