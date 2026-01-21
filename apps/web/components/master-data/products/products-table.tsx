import { OnChangeFn } from '@tanstack/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { ProductWithRelations } from '@/services/products.service';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Badge,
} from '@bizflow/ui';
import { DataTable } from '@/components/ui/data-table';
import { formatCurrency } from '@/lib/utils';

interface ProductsTableProps {
  data: ProductWithRelations[];
  isLoading: boolean;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: OnChangeFn<Record<string, boolean>>;
  onDelete: (product: ProductWithRelations) => void;
}

export function ProductsTable({
  data,
  isLoading,
  columnVisibility,
  onColumnVisibilityChange,
  onDelete,
}: ProductsTableProps) {
  const columns: ColumnDef<ProductWithRelations>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
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
      header: 'Nama Produk',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('name')}</span>
          {row.original.isService && (
            <span className="text-xs text-muted-foreground">(Jasa)</span>
          )}
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
    },
    {
      accessorKey: 'unit',
      header: 'Satuan',
      cell: ({ row }) => {
        const unit = row.original.unit;
        return unit ? unit.symbol : '-';
      },
    },
    {
      accessorKey: 'sellPrice',
      header: 'Harga Jual',
      cell: ({ row }) => {
        const price = Number(row.getValue('sellPrice'));
        return <div className="font-medium">{formatCurrency(price)}</div>;
      },
    },
    {
      accessorKey: 'minStock',
      header: 'Min. Stok',
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
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className={isActive ? 'bg-green-600 hover:bg-green-700' : ''}
          >
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
              <DropdownMenuItem asChild>
                <Link href={`/master-data/products/${product.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(product)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {product.isActive ? 'Nonaktifkan' : 'Hapus'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
    />
  );
}
