'use client';

import { useEffect, useState } from 'react';

import { useDashboard } from '@/hooks/use-dashboard';
import { usePermissions } from '@/hooks/use-permissions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Skeleton,
  Button,
  formatCurrency,
  formatDate,
} from '@bizflow/ui';
import {
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Package,
  ShoppingCart,
  Receipt,
  AlertTriangle,
  RotateCw,
  Percent,
  TrendingUp,
  Box,
} from 'lucide-react';
import Link from 'next/link';
import { Permission } from '@bizflow/types';

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-[100px]" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-1" />
              <Skeleton className="h-3 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-[150px]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-[150px]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { hasPermission } = usePermissions();
  const { data, isLoading, refetch, isRefetching } = useDashboard();

  // If user doesn't have permission, show access denied or redirect
  // For now, assuming middleware or layout handles major auth blocks,
  // but we can show a friendly message here.
  if (isMounted && !hasPermission(Permission.Reports.Read) && !isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Akses Ditolak</h2>
        <p className="text-muted-foreground">
          Anda tidak memiliki izin untuk melihat dashboard.
        </p>
      </div>
    );
  }

  if (!isMounted || isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  const summary = data?.summary;
  const topProducts = data?.topProducts || [];
  const stockAlerts = data?.stockAlerts;
  const recentTransactions = data?.recentTransactions || [];

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RotateCw
              className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Penjualan Hari Ini
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(summary?.totalSalesToday || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.salesChange ? (
                <span
                  className={`flex items-center ${summary.salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {summary.salesChange >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(summary.salesChange).toFixed(1)}% dari kemarin
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Tidak ada data kemarin
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transaksi Hari Ini
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.transactionCountToday || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.transactionChange ? (
                <span
                  className={`flex items-center ${summary.transactionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {summary.transactionChange >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(summary.transactionChange).toFixed(1)}% dari kemarin
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Tidak ada data kemarin
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Average Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Transaksi
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.averagePerTransaction || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">per transaksi</p>
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card
          className={
            stockAlerts?.count
              ? 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900'
              : ''
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stok Menipis / Habis
            </CardTitle>
            <Package
              className={`h-4 w-4 ${stockAlerts?.count ? 'text-red-600' : 'text-muted-foreground'}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${stockAlerts?.count ? 'text-red-600' : ''}`}
            >
              {stockAlerts?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              item perlu restock
            </p>
            {stockAlerts?.count ? (
              <Link
                href="/dashboard/stock-alerts"
                className="text-xs text-red-600 hover:underline mt-2 inline-block"
              >
                Lihat detail &rarr;
              </Link>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Top Products */}
        <Card className="col-span-4 max-h-[450px] overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Top Produk Hari Ini
            </CardTitle>
            <CardDescription>
              5 produk terlaris berdasarkan kuantitas penjualan
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto">
            {topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <Box className="h-10 w-10 mb-2 opacity-20" />
                <p>Belum ada penjualan hari ini</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Terjual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.variantId}>
                      <TableCell>
                        <div className="font-medium">{product.productName}</div>
                        <div className="text-xs text-muted-foreground">
                          {product.variantName}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{product.sku}</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {product.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="col-span-3 max-h-[450px] overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Transaksi Terakhir
            </CardTitle>
            <CardDescription>10 transaksi terbaru</CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <Receipt className="h-10 w-10 mb-2 opacity-20" />
                <p>Belum ada transaksi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm">
                        {tx.orderNumber}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(tx.orderDate).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {tx.customerName || 'Umum'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-sm text-primary">
                        {formatCurrency(tx.total)}
                      </span>
                      <Badge
                        variant={
                          tx.paymentStatus === 'paid'
                            ? 'outline'
                            : tx.paymentStatus === 'unpaid'
                              ? 'destructive'
                              : 'outline'
                        }
                        className={`text-[10px] h-5 px-1.5 ${
                          tx.paymentStatus === 'paid'
                            ? 'border-green-600 text-green-600 bg-green-50 dark:bg-green-900/20'
                            : ''
                        }`}
                      >
                        {tx.paymentStatus === 'paid'
                          ? 'Lunas'
                          : tx.paymentStatus === 'unpaid'
                            ? 'Belum Lunas'
                            : tx.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {recentTransactions.length > 0 && (
              <div className="mt-4 pt-2 border-t text-center">
                <Link
                  href="/sales/orders"
                  className="text-sm text-primary hover:underline"
                >
                  Lihat semua transaksi &rarr;
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
