'use client';

import { ColumnDef } from '@tanstack/react-table';
import { StockData } from '@/services/reports.service';
import { Badge, formatCurrency } from '@bizflow/ui';
import { AlertTriangle, XCircle } from 'lucide-react';

export const columns: ColumnDef<StockData>[] = [
  {
    accessorKey: 'productName',
    header: 'Produk',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue('productName')}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.variantName}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue('sku')}</span>
    ),
  },
  {
    accessorKey: 'categoryName',
    header: 'Kategori',
  },
  {
    accessorKey: 'warehouseName',
    header: 'Gudang',
  },
  {
    accessorKey: 'quantity',
    header: () => <div className="text-right">Stok</div>,
    cell: ({ row }) => {
      const quantity = row.getValue('quantity') as number;
      const minStock = row.original.minStock;
      const isLow = row.original.isLowStock;
      const isOut = row.original.isOutOfStock;

      let badge = null;
      if (isOut) {
        badge = (
          <Badge variant="destructive" className="ml-2 h-5 px-1 text-[10px]">
            Habis
          </Badge>
        );
      } else if (isLow) {
        badge = (
          <Badge
            variant="outline"
            className="ml-2 h-5 px-1 text-[10px] border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
          >
            Menipis
          </Badge>
        );
      }

      return (
        <div className="flex justify-end items-center">
          <span
            className={`font-bold ${isOut ? 'text-red-600' : isLow ? 'text-yellow-600' : ''}`}
          >
            {quantity}
          </span>
          {badge}
        </div>
      );
    },
  },
  {
    accessorKey: 'totalValue',
    header: () => <div className="text-right">Nilai Aset</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue('totalValue'))}
        </div>
      );
    },
  },
];
