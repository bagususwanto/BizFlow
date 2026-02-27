'use client';

import { ColumnDef } from '@tanstack/react-table';
import { StockItem } from '@/services/stock.service';
import { Badge } from '@bizflow/ui';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormatDate, DateFormatters } from '@/hooks';

export function getColumns(formatters: DateFormatters): ColumnDef<StockItem>[] {
  const { formatDateTime } = formatters;
  return [
    {
      id: 'name',
      accessorKey: 'variant.product.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Produk" />
      ),
      meta: { title: 'Produk' },
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
      id: 'sku',
      accessorKey: 'variant.sku',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU" />
      ),
      meta: { title: 'SKU' },
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.variant.sku}</span>
      ),
    },
    {
      accessorKey: 'variant.product.category.name',
      header: 'Kategori',
      meta: { title: 'Kategori' },
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.variant.product.category.name}
        </Badge>
      ),
    },
    {
      id: 'warehouse',
      accessorKey: 'warehouse.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gudang" />
      ),
      meta: { title: 'Gudang' },
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
      id: 'quantity',
      accessorKey: 'quantity',
      header: ({ column }) => (
        <div className="flex justify-end pr-2">
          <DataTableColumnHeader column={column} title="Total Stok" />
        </div>
      ),
      meta: { title: 'Total Stok' },
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
      meta: { title: 'Dipesan' },
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
      meta: { title: 'Tersedia' },
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
      meta: { title: 'Update Terakhir' },
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(row.original.updatedAt)}
        </span>
      ),
    },
  ];
}
