'use client';

import { Suspense, useState } from 'react';
import { useStockReport } from '@/hooks/use-stock-report';
import { useWarehouses } from '@/hooks/use-warehouses';
import { useActiveCategories } from '@/hooks/use-categories';
import { columns } from './columns';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Loader2,
  FileSpreadsheet,
  FileText,
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  Filter,
  X,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  formatCurrency,
  Switch,
  Label,
  Input,
} from '@bizflow/ui';
import { reportsService } from '@/services/reports.service';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@bizflow/ui';
import { useDebounce } from '@/hooks/use-debounce';

function StockReportContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const warehouseId = searchParams.get('warehouseId') || 'all';
  const categoryId = searchParams.get('categoryId') || 'all';
  const lowStockOnly = searchParams.get('lowStockOnly') === 'true';
  const search = searchParams.get('search') || '';

  const debouncedSearch = useDebounce(search, 500);

  const { warehouses } = useWarehouses({ isActive: true });
  const { data: categories } = useActiveCategories();

  // Query
  const { data, isLoading, isFetching } = useStockReport({
    page,
    pageSize,
    warehouseId: warehouseId !== 'all' ? warehouseId : undefined,
    categoryId: categoryId !== 'all' ? categoryId : undefined,
    lowStockOnly,
  });

  const updateUrl = (
    params: Record<string, string | number | boolean | null>,
  ) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === '' || value === 'all') {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
    }
    router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
  };

  const isFiltered =
    warehouseId !== 'all' ||
    categoryId !== 'all' ||
    lowStockOnly ||
    search !== '';

  const onReset = () => {
    updateUrl({
      warehouseId: 'all',
      categoryId: 'all',
      lowStockOnly: false,
      search: '',
      page: 1,
    });
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      toast.promise(
        reportsService.exportStock(
          {
            warehouseId: warehouseId !== 'all' ? warehouseId : undefined,
            categoryId: categoryId !== 'all' ? categoryId : undefined,
            lowStockOnly,
          },
          format,
        ),
        {
          loading: 'Mengunduh laporan...',
          success: 'Laporan berhasil diunduh',
          error: 'Gagal mengunduh laporan',
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

  const summary = data?.summary;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Stok</h2>
          <p className="text-muted-foreground">
            Monitor sisa stok dan nilai aset barang
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Items (SKU)
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalSku || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nilai Total Aset
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(summary?.totalStockValue || 0)}
            </div>
          </CardContent>
        </Card>
        <Card
          className={
            summary?.lowStockCount
              ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900'
              : ''
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${summary?.lowStockCount ? 'text-yellow-600' : 'text-muted-foreground'}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${summary?.lowStockCount ? 'text-yellow-600' : ''}`}
            >
              {summary?.lowStockCount || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              item di bawah stok minimum
            </p>
          </CardContent>
        </Card>
        <Card
          className={
            summary?.outOfStockCount
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
              : ''
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Habis</CardTitle>
            <XCircle
              className={`h-4 w-4 ${summary?.outOfStockCount ? 'text-red-600' : 'text-muted-foreground'}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${summary?.outOfStockCount ? 'text-red-600' : ''}`}
            >
              {summary?.outOfStockCount || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              item dengan stok 0
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 flex-1 w-full">
            {/* Warehouse Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Gudang</label>
              <Select
                value={warehouseId}
                onValueChange={(v) => updateUrl({ warehouseId: v, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Gudang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Gudang</SelectItem>
                  {warehouses?.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <Select
                value={categoryId}
                onValueChange={(v) => updateUrl({ categoryId: v, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pb-2">
            <Switch
              id="low-stock"
              checked={lowStockOnly}
              onCheckedChange={(checked) =>
                updateUrl({ lowStockOnly: checked, page: 1 })
              }
            />
            <Label htmlFor="low-stock">Hanya Stok Menipis/Habis</Label>
            {isFiltered && (
              <Button
                variant="ghost"
                onClick={onReset}
                className="h-8 px-2 lg:px-3 ml-2"
              >
                Reset
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Detail Stok</h3>
        </div>
        <div className="p-0">
          <DataTable
            columns={columns}
            data={data?.data || []}
            isLoading={isFetching}
          />
        </div>

        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="p-4 border-t flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) updateUrl({ page: page - 1 });
                    }}
                    className={
                      page <= 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, data.meta.totalPages) }).map(
                  (_, i) => {
                    const p = i + 1;
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={page === p}
                          onClick={(e) => {
                            e.preventDefault();
                            updateUrl({ page: p });
                          }}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  },
                )}

                {data.meta.totalPages > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < data.meta.totalPages)
                        updateUrl({ page: page + 1 });
                    }}
                    className={
                      page >= data.meta.totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StockReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <StockReportContent />
    </Suspense>
  );
}
