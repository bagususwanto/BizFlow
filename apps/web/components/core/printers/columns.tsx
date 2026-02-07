'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge, Button, Checkbox } from '@bizflow/ui';
import {
  ArrowUpDown,
  Edit,
  MoreHorizontal,
  Trash,
  Printer as PrinterIcon,
  LayoutTemplate,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@bizflow/ui';
import Link from 'next/link';

import { Printer } from '@/services/printers.service';

interface ColumnsProps {
  onDelete: (printer: Printer) => void;
  onTestPrint: (printer: Printer) => void;
  onOpenDrawer: (printer: Printer) => void;
}

export const getColumns = ({
  onDelete,
  onTestPrint,
  onOpenDrawer,
}: ColumnsProps): ColumnDef<Printer>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nama Printer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue('name')}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.isDefault ? 'Printer Utama' : ''}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'outlet',
    header: 'Outlet',
    cell: ({ row }) => row.original.outlet?.name || '-',
  },
  {
    accessorKey: 'type',
    header: 'Tipe',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <Badge variant={type === 'network' ? 'default' : 'secondary'}>
          {type === 'network' ? 'Network' : 'USB'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'address',
    header: 'Alamat / Port',
    cell: ({ row }) => row.getValue('address') || '-',
  },
  {
    accessorKey: 'width',
    header: 'Kertas',
    cell: ({ row }) => `${row.getValue('width')}mm`,
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant={row.getValue('isActive') ? 'outline' : 'destructive'}
        className={
          row.getValue('isActive') ? 'border-green-600 text-green-600' : ''
        }
      >
        {row.getValue('isActive') ? 'Aktif' : 'Non-aktif'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const printer = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(printer.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/settings/printers/${printer.id}`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTestPrint(printer)}>
              <PrinterIcon className="mr-2 h-4 w-4" /> Test Print
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenDrawer(printer)}>
              <LayoutTemplate className="mr-2 h-4 w-4" /> Buka Laci Uang
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(printer)}
            >
              <Trash className="mr-2 h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
