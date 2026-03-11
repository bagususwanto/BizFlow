'use client';

import { ColumnDef } from '@tanstack/react-table';
import { StockValuationItem } from '@/services/stock-valuation.service';
import { Badge } from '@bizflow/ui';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

export function getColumns(
  t: (key: string) => string
): ColumnDef<StockValuationItem>[] {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return [
    {
      id: 'product',
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.product')} />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      id: 'sku',
      accessorKey: 'sku',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.sku')} />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.sku}</span>
      ),
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: t('columns.category'),
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.category}</Badge>
      ),
    },
    {
      id: 'warehouse',
      accessorKey: 'warehouseName',
      header: t('columns.warehouse'),
      cell: ({ row }) => (
        <span>{row.original.warehouseName || '-'}</span>
      ),
    },
    {
      id: 'qty',
      accessorKey: 'totalQuantity',
      header: ({ column }) => (
        <div className="flex justify-end pr-2">
          <DataTableColumnHeader column={column} title={t('columns.qty')} />
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {row.original.totalQuantity}
          </div>
        );
      },
    },
    {
      id: 'avgCost',
      accessorKey: 'averageCost',
      header: ({ column }) => (
        <div className="flex justify-end pr-2">
          <DataTableColumnHeader column={column} title={t('columns.avgCost')} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right text-muted-foreground">
          {formatCurrency(row.original.averageCost)}
        </div>
      ),
    },
    {
      id: 'totalValue',
      accessorKey: 'totalValue',
      header: ({ column }) => (
        <div className="flex justify-end pr-2">
          <DataTableColumnHeader column={column} title={t('columns.totalValue')} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-bold text-primary">
          {formatCurrency(row.original.totalValue)}
        </div>
      ),
    },
  ];
}
