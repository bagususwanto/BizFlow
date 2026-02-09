'use client';

import { ColumnDef } from '@tanstack/react-table';
import { StockItem } from '@/services/stock.service';
import { Badge } from '@bizflow/ui';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export const columns: ColumnDef<StockItem>[] = [
  {
    accessorKey: 'variant.product.name',
    header: 'Produk',
    cell: ({ row }) => {
      const variant = row.original.variant;
      const product = variant.product;
      const isVariant = variant.name !== 'Default';

      return (
        <div className="flex flex-col">
          <span className="font-medium">{product.name}</span>
          {isVariant && (
            <span className="text-xs text-muted-foreground">
              {variant.name}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'variant.sku',
    header: 'SKU',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.variant.sku}</span>
    ),
  },
  {
    accessorKey: 'variant.product.category.name',
    header: 'Kategori',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.variant.product.category.name}
      </Badge>
    ),
  },
  {
    accessorKey: 'warehouse.name',
    header: 'Gudang',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.warehouse.name}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.warehouse.code}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'quantity',
    header: () => <div className="text-right">Total Stok</div>,
    cell: ({ row }) => {
      const unit = row.original.variant.product.unit.symbol;
      return (
        <div className="text-right font-medium">
          {row.original.quantity} {unit}
        </div>
      );
    },
  },
  {
    accessorKey: 'reservedQty',
    header: () => <div className="text-right">Dipesan</div>,
    cell: ({ row }) => {
      const unit = row.original.variant.product.unit.symbol;
      return (
        <div className="text-right text-muted-foreground">
          {row.original.reservedQty} {unit}
        </div>
      );
    },
  },
  {
    accessorKey: 'availableQty',
    header: () => <div className="text-right">Tersedia</div>,
    cell: ({ row }) => {
      const unit = row.original.variant.product.unit.symbol;
      const available = row.original.availableQty;

      return (
        <div
          className={`text-right font-bold ${available <= 0 ? 'text-destructive' : 'text-primary'}`}
        >
          {available} {unit}
        </div>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Update Terakhir',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {format(new Date(row.original.updatedAt), 'dd MMM yyyy HH:mm', {
          locale: idLocale,
        })}
      </span>
    ),
  },
];
