'use client';

import { ColumnDef } from '@tanstack/react-table';
import { StockMovement } from '@/services/stock.service';
import { Badge } from '@bizflow/ui';
import { ArrowDown, ArrowUp, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const columns: ColumnDef<StockMovement>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Tanggal',
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {format(new Date(row.original.createdAt), 'dd MMM yyyy', {
              locale: id,
            })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(row.original.createdAt), 'HH:mm', { locale: id })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'type',
    header: 'Tipe',
    cell: ({ row }) => {
      const type = row.original.type;
      let color: 'default' | 'secondary' | 'destructive' | 'outline' =
        'default';
      let icon = null;

      switch (type) {
        case 'SALE':
        case 'TRANSFER_OUT':
        case 'USAGE':
          color = 'destructive';
          icon = <ArrowUp className="mr-1 h-3 w-3" />;
          break;
        case 'PURCHASE':
        case 'TRANSFER_IN':
        case 'RETURN':
          color = 'default';
          icon = <ArrowDown className="mr-1 h-3 w-3" />;
          break;
        case 'ADJUSTMENT':
        case 'OPNAME':
          color = 'secondary';
          icon = <ArrowRight className="mr-1 h-3 w-3" />;
          break;
        default:
          color = 'outline';
      }

      return (
        <Badge variant={color} className="flex w-fit items-center text-xs">
          {icon}
          {type.replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    id: 'product',
    header: 'Produk',
    cell: ({ row }) => {
      const variant = row.original.variant;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{variant.product.name}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {variant.name && variant.name !== 'Default' ? (
              <>
                <span>{variant.sku}</span>
                <span>•</span>
                <span>{variant.name}</span>
              </>
            ) : (
              <span>{variant.sku}</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'warehouse',
    header: 'Gudang',
    cell: ({ row }) => row.original.warehouse.name,
  },
  {
    accessorKey: 'reference',
    header: 'Referensi',
    cell: ({ row }) => {
      const refId = row.original.referenceId;
      const refType = row.original.referenceType;

      if (!refId && !refType)
        return <span className="text-muted-foreground">-</span>;

      return (
        <div className="flex flex-col text-sm">
          <span className="font-medium">{refId || '-'}</span>
          <span className="text-xs text-muted-foreground">
            {refType || '-'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'quantity',
    header: () => <div className="text-right">Jumlah</div>,
    cell: ({ row }) => {
      const qty = row.original.quantity;
      const isPositive = qty > 0;
      const variant = row.original.variant;

      return (
        <div
          className={`font-medium text-right ${
            isPositive ? 'text-success' : 'text-destructive'
          }`}
        >
          {isPositive ? '+' : ''}
          {qty} {variant.product.unit.symbol}
        </div>
      );
    },
  },
  {
    accessorKey: 'notes',
    header: 'Catatan',
    cell: ({ row }) => (
      <span
        className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]"
        title={row.original.notes || ''}
      >
        {row.original.notes || '-'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // This will be handled by the DataListPage's onRowClick or we can add a button here
      // But since we want to open a dialog, we need to pass the handler or use a global state/event
      // For now, let's keep it clean. The page will add the action column or handle row click.
      return null;
    },
  },
];
