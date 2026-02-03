'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useWarehouses } from '@/hooks/use-warehouses';
import { WarehousesQuery } from '@/services/warehouses.service';
import { Warehouse } from '@bizflow/types';
import { MasterDataPage } from '@/components/master-data/master-data-page';
import { getColumns } from '@/components/master-data/warehouses/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

function WarehousesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;
  const status = searchParams.get('status') || 'all';

  const queryParams: WarehousesQuery = {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    isActive: status === 'all' ? undefined : status === 'active',
  };

  const {
    warehouses,
    meta,
    summary,
    isLoading,
    isError,
    deleteWarehouse,
    isDeleting,
    bulkDeleteWarehouses,
    isBulkDeleting,
    refetch,
  } = useWarehouses(queryParams);

  // Delete Dialog State
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(
    null,
  );

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

  const handleError = () => (
    <ErrorState title="Gagal memuat data gudang" onRetry={() => refetch()} />
  );

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteWarehouses(ids, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (warehouse) => setWarehouseToDelete(warehouse),
      }),
    [],
  );

  if (isError) return handleError();

  const data = warehouses || [];
  const metaData = meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  return (
    <>
      <MasterDataPage
        title="Gudang"
        description="Manajemen data gudang penyimpanan."
        createLink="/master-data/warehouses/create"
        createLabel="Tambah Gudang"
        data={data}
        columns={columns}
        isLoading={isLoading}
        // Pagination
        page={page}
        pageSize={pageSize}
        totalPages={metaData.totalPages}
        totalItems={metaData.totalItems}
        onPageChange={(p) => updateUrl({ page: p })}
        onPageSizeChange={(s) => updateUrl({ pageSize: s, page: 1 })}
        summary={
          summary
            ? {
                total: summary.totalWarehouses,
                active: summary.activeWarehouses,
                inactive: summary.inactiveWarehouses,
              }
            : undefined
        }
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
        searchPlaceholder="Cari gudang..."
        // Filters
        filterValues={{ status }}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        onReset={() => router.push(pathname)}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Aktif', value: 'active' },
              { label: 'Non-aktif', value: 'inactive' },
            ],
            width: 'w-[150px]',
          },
        ]}
        // Actions
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        onRefresh={refetch}
      />

      {/* Single Delete Dialog */}
      <DeleteConfirmDialog
        open={!!warehouseToDelete}
        onOpenChange={(open) => !open && setWarehouseToDelete(null)}
        title={
          warehouseToDelete?.isActive
            ? 'Nonaktifkan Gudang?'
            : 'Hapus Gudang Permanen?'
        }
        description={
          warehouseToDelete?.isActive ? (
            <>
              Gudang{' '}
              <span className="font-medium text-foreground">
                {warehouseToDelete?.name}
              </span>{' '}
              akan dinonaktifkan. Data gudang tetap tersimpan tapi tidak bisa
              digunakan untuk transaksi baru.
            </>
          ) : (
            <>
              <p>
                Gudang{' '}
                <span className="font-medium text-foreground">
                  {warehouseToDelete?.name}
                </span>{' '}
                akan dihapus secara permanen.
              </p>
              <p className="mt-2 text-sm text-warning">
                Peringatan: Jika gudang masih memiliki riwayat transaksi (stok,
                mutasi, dll), sistem akan menolak penghapusan permanen.
              </p>
            </>
          )
        }
        onConfirm={() => {
          if (warehouseToDelete) {
            deleteWarehouse(warehouseToDelete.id, {
              onSuccess: () => setWarehouseToDelete(null),
            });
          }
        }}
        isDeleting={isDeleting}
        confirmLabel={
          warehouseToDelete?.isActive ? 'Nonaktifkan' : 'Hapus Permanen'
        }
        cancelLabel="Batal"
      />
    </>
  );
}

export default function WarehousesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <WarehousesContent />
    </Suspense>
  );
}
