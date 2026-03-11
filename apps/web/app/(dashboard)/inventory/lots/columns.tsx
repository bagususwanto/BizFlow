'use client';

import { ColumnDef } from '@tanstack/react-table';
import { StockLot } from '@/services/stock-lots.service';
import { Badge } from '@bizflow/ui';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormatDate, DateFormatters } from '@/hooks';

export function getColumns(
  formatters: DateFormatters,
  t: (key: string) => string
): ColumnDef<StockLot>[] {
  const { formatDate } = formatters;
  return [
    {
      id: 'lotNumber',
      accessorKey: 'lotNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.lotNumber')} />
      ),
      cell: ({ row }) => {
        const lotNumber = row.original.lotNumber;
        return <span className="font-semibold">{lotNumber || '-'}</span>;
      },
    },
    {
      id: 'name',
      accessorKey: 'variant.product.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.product')} />
      ),
      cell: ({ row }) => {
        const variant = row.original.variant;
        const product = variant.product;
        const isVariant = variant.name !== 'Default';

        return (
          <div className="flex flex-col">
            <span className="font-medium">{product.name}</span>
            {isVariant && (
              <span className="text-xs text-muted-foreground">{variant.name}</span>
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
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.variant.sku}</span>
      ),
    },
    {
      id: 'warehouse',
      accessorKey: 'warehouse.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.warehouse')} />
      ),
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
          <DataTableColumnHeader column={column} title={t('columns.stock')} />
        </div>
      ),
      cell: ({ row }) => {
        const unit = row.original.variant.product.unit.symbol;
        const quantity = row.original.quantity;
        return (
          <div className="text-right font-medium">
            {quantity} {unit}
          </div>
        );
      },
    },
    {
      id: 'manufacturedAt',
      accessorKey: 'manufacturedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.manufacturingDate')} />
      ),
      cell: ({ row }) => {
        const mfgDate = row.original.manufacturedAt;
        return (
          <span className="text-muted-foreground">
            {mfgDate ? formatDate(mfgDate) : '-'}
          </span>
        );
      },
    },
    {
      id: 'expiredAt',
      accessorKey: 'expiredAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.expirationDate')} />
      ),
      cell: ({ row }) => {
        const expDate = row.original.expiredAt;
        const isExpired = row.original.status === 'EXPIRED';

        return (
          <span className={isExpired ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
            {expDate ? formatDate(expDate) : '-'}
          </span>
        );
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.status')} />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: 'default' | 'destructive' | 'outline' | 'secondary' = 'default';

        if (status === 'EXPIRED') variant = 'destructive';
        if (status === 'DEPLETED') variant = 'secondary';
        if (status === 'QUARANTINED') variant = 'outline'; // Or warning if you have a custom badge

        return (
          <Badge variant={variant}>
            {t(`status.${status}`)}
          </Badge>
        );
      },
    },
  ];
}
