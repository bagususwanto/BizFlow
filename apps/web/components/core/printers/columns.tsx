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
  t: any;
}

export const getColumns = ({
  onDelete,
  onTestPrint,
  t,
}: PrintersColumnsProps): ColumnDef<Printer>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.name')} />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        {row.original.isDefault && (
          <span className="text-xs text-muted-foreground">
            {t('columns.mainPrinter')}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'outlet',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.outlet')} />
    ),
    cell: ({ row }) => <span>{row.original.outlet?.name || '-'}</span>,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.type')} />
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge variant={'secondary'}>
          {type === 'network' ? 'Network' : 'USB'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.address')} />
    ),
    cell: ({ row }) => (
      <div
        className="max-w-[200px] truncate"
        title={row.original.address || ''}
      >
        {row.original.address || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'width',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.width')} />
    ),
    cell: ({ row }) => <span>{row.original.width}mm</span>,
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('columns.status')} />
    ),
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
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
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/settings/printers/${printer.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                {t('columns.actions.edit')}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => onTestPrint(printer)}
              disabled={!printer.isActive}
            >
              <PrinterIcon className="mr-2 h-4 w-4" />
              {t('columns.actions.testPrint')}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(printer)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('columns.actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
