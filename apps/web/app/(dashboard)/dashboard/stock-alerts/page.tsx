'use client';

import { StockAlertStats } from '@/components/dashboard/stock-alerts/stock-alert-stats';
import { StockAlertTable } from '@/components/dashboard/stock-alerts/stock-alert-table';
import { useLowStockProducts } from '@/hooks/use-products';
import { Button } from '@bizflow/ui';
import { RefreshCw } from 'lucide-react';

export default function StockAlertPage() {
  const { data = [], isLoading, refetch, isRefetching } = useLowStockProducts();

  // Compute stats
  const outOfStockCount = data.filter((p) => p.currentStock <= 0).length;
  const criticalStockCount = data.filter(
    (p) => p.currentStock > 0 && p.currentStock <= p.minStock * 0.5,
  ).length;
  const lowStockCount = data.filter(
    (p) => p.currentStock > p.minStock * 0.5 && p.currentStock <= p.minStock,
  ).length;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Stock Alert Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor produk dengan stok menipis dan perlu restock.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      <StockAlertStats
        lowStockCount={lowStockCount}
        criticalStockCount={criticalStockCount}
        outOfStockCount={outOfStockCount}
        isLoading={isLoading}
      />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Daftar Peringatan Stok</h2>
        <StockAlertTable data={data} isLoading={isLoading} />
      </div>
    </div>
  );
}
