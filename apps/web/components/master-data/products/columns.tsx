'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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
import { ProductWithRelations } from '@/services/products.service';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

interface GetColumnsProps {
  onDelete: (product: ProductWithRelations) => void;
}

export const getColumns = ({
  onDelete,
}: GetColumnsProps): ColumnDef<ProductWithRelations>[] => [
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
    accessorKey: 'images',
    header: 'Gambar',
    cell: ({ row }) => {
      const images = row.original.images || [];
      const mainImage = images[0]?.url;
      const imageUrl = getImageUrl(mainImage);
      return (
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted relative">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={row.getValue('name')}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center text-center justify-center bg-secondary text-muted-foreground">
              <span className="text-xs">No img</span>
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'sku',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SKU" />
    ),
    cell: ({ row }) => (
      <span className="font-mono font-medium">{row.getValue('sku')}</span>
    ),
  },
  {
    accessorKey: 'barcode',
    header: 'Barcode',
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground">
        {row.getValue('barcode') || '-'}
      </span>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Produk" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="font-medium">{row.getValue('name')}</span>
        <div className="flex items-center gap-2">
          {row.original.isService && (
            <span className="text-xs text-muted-foreground">(Jasa)</span>
          )}
          {(row.original.variantCount || 0) > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {row.original.variantCount} Varian
            </Badge>
          )}
          {(row.original.priceLevelCount || 0) > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {row.original.priceLevelCount} Level Harga
            </Badge>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Kategori',
    cell: ({ row }) => {
      const category = row.original.category;
      return category ? category.name : '-';
    },
    enableSorting: false,
  },
  {
    accessorKey: 'unit',
    header: 'Satuan',
    cell: ({ row }) => {
      const unit = row.original.unit;
      return unit ? unit.symbol : '-';
    },
    enableSorting: false,
  },
  {
    accessorKey: 'sellPrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Harga Jual" />
    ),
    cell: ({ row }) => {
      const price = Number(row.getValue('sellPrice'));
      return <div className="font-medium">{formatCurrency(price)}</div>;
    },
  },
  {
    accessorKey: 'minStock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Min. Stok" />
    ),
    cell: ({ row }) => {
      if (row.original.isService)
        return <span className="text-muted-foreground">-</span>;

      const minStock = Number(row.getValue('minStock'));
      return (
        <div
          className={
            minStock > 0
              ? 'font-medium text-amber-600'
              : 'text-muted-foreground'
          }
        >
          {minStock}
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;

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
            <DropdownMenuItem asChild>
              <Link href={`/master-data/products/${product.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(product)}
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
