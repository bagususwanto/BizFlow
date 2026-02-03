'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import { AlertCircle, PackageX, AlertTriangle } from 'lucide-react';

interface StockAlertStatsProps {
  lowStockCount: number;
  criticalStockCount: number;
  outOfStockCount: number;
  isLoading?: boolean;
}

export function StockAlertStats({
  lowStockCount,
  criticalStockCount,
  outOfStockCount,
  isLoading,
}: StockAlertStatsProps) {
  if (isLoading) {
    return <StatsSkeleton />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          <AlertTriangle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
          <p className="text-xs text-muted-foreground">Stok &le; Minimum</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
          <AlertCircle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">
            {criticalStockCount}
          </div>
          <p className="text-xs text-muted-foreground">Stok &lt; 50% Minimum</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          <PackageX className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {outOfStockCount}
          </div>
          <p className="text-xs text-muted-foreground">Stok Habis (0)</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
