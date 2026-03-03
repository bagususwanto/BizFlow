'use client';

import { ColumnDef } from '@tanstack/react-table';
import { StockItem } from '@/services/stock.service';
import { Badge } from '@bizflow/ui';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormatDate, DateFormatters } from '@/hooks';

export function getColumns(
  formatters: DateFormatters,
  t: (key: string) => string,
): ColumnDef<StockItem>[] {
  const { formatDateTime } = formatters;
  return [
    {
      id: 'name',
      accessorKey: 'variant.product.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.product')} />
      ),
      meta: { title: t('columns.product') },
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
        <DataTableColumnHeader column={column} title={t('columns.sku')} />
      ),
      meta: { title: t('columns.sku') },
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.variant.sku}</span>
      ),
    },
    {
      accessorKey: 'variant.product.category.name',
      header: t('columns.category'),
      meta: { title: t('columns.category') },
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
        <DataTableColumnHeader column={column} title={t('columns.warehouse')} />
      ),
      meta: { title: t('columns.warehouse') },
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
          <DataTableColumnHeader
            column={column}
            title={t('columns.totalStock')}
          />
        </div>
      ),
      meta: { title: t('columns.totalStock') },
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
      header: () => <div className="text-right">{t('columns.reserved')}</div>,
      meta: { title: t('columns.reserved') },
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
      header: () => <div className="text-right">{t('columns.available')}</div>,
      meta: { title: t('columns.available') },
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
      header: t('columns.lastUpdate'),
      meta: { title: t('columns.lastUpdate') },
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(row.original.updatedAt)}
        </span>
      ),
    },
  ];
}
