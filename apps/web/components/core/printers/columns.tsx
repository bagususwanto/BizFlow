'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Printer as PrinterIcon,
} from 'lucide-react';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

import {
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@bizflow/ui';
import type { Printer } from '@/services/printers.service';

interface PrintersColumnsProps {
  onDelete: (printer: Printer) => void;
  onTestPrint: (printer: Printer) => void;
}

export const getColumns = ({
  onDelete,
  onTestPrint,
}: PrintersColumnsProps): ColumnDef<Printer>[] => [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Printer" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        {row.original.isDefault && (
          <span className="text-xs text-muted-foreground">Printer Utama</span>
        )}
      </div>
    ),
    meta: {
      title: 'Nama Printer',
    },
  },
  {
    accessorKey: 'outlet',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Outlet" />
    ),
    cell: ({ row }) => <span>{row.original.outlet?.name || '-'}</span>,
    meta: {
      title: 'Outlet',
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipe" />
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge variant={'secondary'}>
          {type === 'network' ? 'Network' : 'USB'}
        </Badge>
      );
    },
    meta: {
      title: 'Tipe',
    },
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alamat / Port" />
    ),
    cell: ({ row }) => (
      <div
        className="max-w-[200px] truncate"
        title={row.original.address || ''}
      >
        {row.original.address || '-'}
      </div>
    ),
    meta: {
      title: 'Alamat / Port',
    },
  },
  {
    accessorKey: 'width',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kertas" />
    ),
    cell: ({ row }) => <span>{row.original.width}mm</span>,
    meta: {
      title: 'Kertas',
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      );
    },
    meta: {
      title: 'Status',
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const printer = row.original;

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
              <Link href={`/settings/printers/${printer.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => onTestPrint(printer)}
              disabled={!printer.isActive}
            >
              <PrinterIcon className="mr-2 h-4 w-4" />
              Test Print
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(printer)}
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
