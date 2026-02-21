'use client';

import { Suspense, useMemo, useState, useCallback } from 'react';
import { useStocks } from '@/hooks/use-stock';
import { useWarehouses } from '@/hooks/use-warehouses';
import { useActiveCategories } from '@/hooks/use-categories';
import { columns } from './columns';
import { useDebounce } from '@/hooks/use-debounce';
import { DataListPage } from '@/components/shared/data-list-page';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Loader2, Box, Layers, Warehouse, History } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import { StockCardDialog } from '../movements/stock-card-dialog';

function StockContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const warehouseId = searchParams.get('warehouseId') || 'all';
  const categoryId = searchParams.get('categoryId') || 'all';
  const sortBy = searchParams.get('sortBy') || 'updatedAt';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const debouncedSearch = useDebounce(search, 500);

  const { warehouses } = useWarehouses({ isActive: true });
  const { data: categories } = useActiveCategories();

  const { data, isLoading, refetch } = useStocks({
    page,
    pageSize,
    search: debouncedSearch,
    warehouseId: warehouseId !== 'all' ? warehouseId : undefined,
    categoryId: categoryId !== 'all' ? categoryId : undefined,
    sortBy: sortBy as any,
    sortOrder,
    hasStock: true,
  });

  const handleCreateQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === '' || value === 'all') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams],
  );

  const updateUrl = (params: Record<string, string | number | null>) => {
    const queryString = handleCreateQueryString(params);
    router.push(`${pathname}?${queryString}`);
  };

  const totalPages = data?.meta?.totalPages || 1;
  const totalItems = data?.meta?.totalItems || 0;
  const summary = data?.summary;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  const columnsWithActions = useMemo(() => {
    const actionColumn = {
      id: 'actions',
      header: '',
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedVariantId(row.original.variantId)}
          title="Lihat Kartu Stok"
        >
          <History className="h-4 w-4" />
        </Button>
      ),
    };
    return [...columns, actionColumn];
  }, []);

  return (
    <>
      <DataListPage
        title="Stok Overview"
        description="Monitor stok barang di semua gudang"
        data={data?.data || []}
        columns={columnsWithActions}
        isLoading={isLoading}
        // Pagination
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={(p) => updateUrl({ page: p })}
        onPageSizeChange={(s) => updateUrl({ pageSize: s, page: 1 })}
        // Sorting
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(field) => {
          if (sortBy === field) {
            updateUrl({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
          } else {
            updateUrl({ sortBy: field, sortOrder: 'asc' });
          }
        }}
        // Search
        search={search}
        onSearchChange={(v) => updateUrl({ search: v, page: 1 })}
        searchPlaceholder="Cari produk atau SKU..."
        // Filters
        filterValues={{ warehouseId, categoryId }}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        onReset={() => router.push(pathname)}
        filters={[
          {
            key: 'warehouseId',
            label: 'Gudang',
            options:
              warehouses?.map((w) => ({ label: w.name, value: w.id })) || [],
            width: 'w-full md:w-[200px]',
          },
          {
            key: 'categoryId',
            label: 'Kategori',
            options:
              categories?.map((c) => ({ label: c.name, value: c.id })) || [],
            width: 'w-full md:w-[200px]',
          },
        ]}
        // Actions
        onRefresh={refetch}
      >
        {/* Summary Cards */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Record
                </CardTitle>
                <Box className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.totalStockRecords || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Semua record stok
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Varian Stok
                </CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.totalVariantsWithStock || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Produk dengan stok
                </p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gudang</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.totalWarehouses || 0}
                </div>
                <p className="text-xs text-muted-foreground">Lokasi gudang</p>
              </CardContent>
            </Card>
          </div>
        )}
      </DataListPage>

      <StockCardDialog
        open={!!selectedVariantId}
        onOpenChange={(open) => !open && setSelectedVariantId(null)}
        variantId={selectedVariantId}
        warehouseId={warehouseId !== 'all' ? warehouseId : undefined}
      />
    </>
  );
}

export default function StockPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <StockContent />
    </Suspense>
  );
}
