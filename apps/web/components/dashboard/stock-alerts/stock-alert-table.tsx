'use client';

import { Badge, Button, Checkbox } from '@bizflow/ui';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';

interface StockAlertItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  currentStock: number;
}

interface StockAlertTableProps {
  data: StockAlertItem[];
  isLoading?: boolean;
}

// Helper to determine status based on logic
type StockStatus = 'out_of_stock' | 'critical' | 'low';

function getStockStatus(current: number, min: number): StockStatus {
  if (current <= 0) return 'out_of_stock';
  if (current <= min * 0.5) return 'critical';
  return 'low';
}

function StatusBadge({ status }: { status: StockStatus }) {
  switch (status) {
    case 'out_of_stock':
      return <Badge variant="destructive">Out of Stock</Badge>;
    case 'critical':
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600">Critical</Badge>
      );
    case 'low':
      return (
        <Badge className="bg-warning hover:bg-warning/90 text-warning-foreground">
          Low Stock
        </Badge>
      );
  }
}

export function StockAlertTable({ data, isLoading }: StockAlertTableProps) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo<ColumnDef<StockAlertItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              className="translate-y-[2px]"
            />
            {/* Added explicit text as per wireframe implication, standard DataTable usually just has checkbox */}
            {/* <span className="text-sm font-medium">Pilih Semua</span> */}
          </div>
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = getStockStatus(
            row.original.currentStock,
            row.original.minStock,
          );
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: 'name',
        header: 'Produk',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'sku',
        header: 'SKU',
      },
      {
        accessorKey: 'currentStock',
        header: () => <div className="text-right">Stok</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.currentStock} {row.original.unit}
          </div>
        ),
      },
      {
        accessorKey: 'minStock',
        header: () => <div className="text-right">Min</div>,
        cell: ({ row }) => (
          <div className="text-right">{row.original.minStock}</div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() =>
                router.push(
                  `/purchases/orders/create?productId=${row.original.id}`,
                )
              }
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              PO
            </Button>
          </div>
        ),
      },
    ],
    [router],
  );

  const selectedCount = Object.keys(rowSelection).length;

  const handleBulkPO = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    // TODO: Implement actual bulk PO logic or redirect with multiple IDs
    // For now, toast and log.
    console.log('Selected for PO:', selectedIds);
    toast.success(
      `Membuat PO untuk ${selectedCount} produk terpilih (Feature Coming Soon)`,
    );
    // router.push(`/purchases/orders/create?productIds=${selectedIds.join(',')}`);
  };

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar matches: [ ☐ Pilih Semua ] [ 🛒 Buat Purchase Order untuk yang dipilih ] 
          We use DataTable header for "Pilih Semua" (Select All) checkbox.
          Here we show the Action Button when items are selected.
      */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-4 rounded-md bg-muted px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{selectedCount} Dipilih</span>
          </div>
          <Button size="sm" className="ml-auto h-8" onClick={handleBulkPO}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Buat Purchase Order
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(row) => row.id}
      />
    </div>
  );
}
