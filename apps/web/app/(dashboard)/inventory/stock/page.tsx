'use client';

import { Suspense, useMemo, useState } from 'react';
import { useStocks } from '@/hooks/use-stock';
import { useWarehouses } from '@/hooks/use-warehouses';
import { useActiveCategories } from '@/hooks/use-categories';
import { columns } from './columns';
import { useDebounce } from '@/hooks/use-debounce';
import { DataListPage } from '@/components/shared/data-list-page';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Loader2, Box, Layers, Warehouse, History } from 'lucide-react';
import { Button } from '@bizflow/ui';
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

  const updateUrl = (params: Record<string, string | number | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === '' || value === 'all') {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
    }

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const totalPages = data?.meta?.totalPages || 1;
  const totalItems = data?.meta?.totalItems || 0;

  // Custom Summary Configuration
  const summaryConfig = useMemo(
    () => [
      {
        key: 'totalStockRecords',
        label: 'Total Record',
        icon: Box,
        value: data?.summary?.totalStockRecords || 0,
      },
      {
        key: 'totalVariantsWithStock',
        label: 'Varian Stok',
        icon: Layers,
        value: data?.summary?.totalVariantsWithStock || 0,
      },
      {
        key: 'totalWarehouses',
        label: 'Gudang',
        icon: Warehouse,
        value: data?.summary?.totalWarehouses || 0,
      },
    ],
    [data?.summary],
  );

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
        // Summary
        summary={data?.summary}
        summaryConfig={summaryConfig}
        // Actions
        onRefresh={refetch}
      />

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
