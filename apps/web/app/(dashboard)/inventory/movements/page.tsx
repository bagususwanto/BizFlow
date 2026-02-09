'use client';

import { useState, useMemo, Suspense } from 'react';
import { useStockMovements } from '@/hooks/use-stock-movements';
import { useWarehouses } from '@/hooks/use-warehouses';
import { columns } from './columns';
import { useDebounce } from '@/hooks/use-debounce';
import { DataListPage } from '@/components/shared/data-list-page';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Loader2, Download, History } from 'lucide-react';
import { Button } from '@bizflow/ui';
import { StockCardDialog } from './stock-card-dialog';
import { toast } from 'sonner';

function StockMovementsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const warehouseId = searchParams.get('warehouseId') || 'all';
  const type = searchParams.get('type') || 'all';
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const debouncedSearch = useDebounce(search, 500);

  const { warehouses } = useWarehouses({ isActive: true });

  const { data, isLoading, refetch } = useStockMovements({
    page,
    pageSize,
    search: debouncedSearch,
    warehouseId: warehouseId !== 'all' ? warehouseId : undefined,
    type: type !== 'all' ? type : undefined,
    dateFrom,
    dateTo,
    sortBy: sortBy as any,
    sortOrder,
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

  const movementTypes = [
    { label: 'Penjualan (POS)', value: 'SALE' },
    { label: 'Pembelian', value: 'PURCHASE' },
    { label: 'Transfer Masuk', value: 'TRANSFER_IN' },
    { label: 'Transfer Keluar', value: 'TRANSFER_OUT' },
    { label: 'Adjustment', value: 'ADJUSTMENT' },
    { label: 'Opname', value: 'OPNAME' },
    { label: 'Retur', value: 'RETURN' },
  ];

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

    // Remove existing actions column if any before adding ours
    const baseColumns = columns.filter((c) => c.id !== 'actions');
    return [...baseColumns, actionColumn];
  }, []);

  const handleExport = () => {
    toast.info('Fitur export akan segera hadir!');
  };

  return (
    <>
      <DataListPage
        title="Riwayat Stok"
        description="Monitor pergerakan stok masuk dan keluar"
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
        searchPlaceholder="Cari produk, SKU, atau no. referensi..."
        // Filters
        filterValues={{ warehouseId, type }}
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
            key: 'type',
            label: 'Tipe Pergerakan',
            options: movementTypes,
            width: 'w-full md:w-[200px]',
          },
        ]}
        // Actions
        onRefresh={refetch}
        headerAction={
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
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

export default function StockMovementsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <StockMovementsContent />
    </Suspense>
  );
}
