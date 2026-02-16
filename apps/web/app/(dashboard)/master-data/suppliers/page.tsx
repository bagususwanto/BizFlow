'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useSuppliers } from '@/hooks/use-suppliers';
import { SuppliersQuery } from '@/services/suppliers.service';
import { Supplier } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/master-data/suppliers/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

function SuppliersContent() {
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

  const queryParams: SuppliersQuery = {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    isActive: status === 'all' ? undefined : status === 'active',
  };

  const {
    suppliers,
    meta,
    summary,
    isLoading,
    isError,
    deleteSupplier,
    isDeleting,
    bulkDeleteSuppliers,
    isBulkDeleting,
    refetch,
  } = useSuppliers(queryParams);

  // Delete Dialog State
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
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
    <ErrorState title="Gagal memuat data pemasok" onRetry={() => refetch()} />
  );

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteSuppliers(ids, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (supplier) => setSupplierToDelete(supplier),
      }),
    [],
  );

  if (isError) return handleError();

  const data = suppliers || [];
  const metaData = meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  return (
    <>
      <DataListPage
        title="Pemasok"
        description="Manajemen data pemasok dan pembelian."
        createLink="/master-data/suppliers/create"
        createLabel="Tambah Pemasok"
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
                total: summary.totalSuppliers,
                active: summary.activeSuppliers,
                inactive: summary.inactiveSuppliers,
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
        searchPlaceholder="Cari pemasok..."
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
        open={!!supplierToDelete}
        onOpenChange={(open) => !open && setSupplierToDelete(null)}
        title={
          supplierToDelete?.isActive
            ? 'Nonaktifkan Pemasok?'
            : 'Hapus Pemasok Permanen?'
        }
        description={
          supplierToDelete?.isActive ? (
            <>
              Pemasok{' '}
              <span className="font-medium text-foreground">
                {supplierToDelete?.name}
              </span>{' '}
              akan dinonaktifkan. Data pemasok tetap tersimpan.
            </>
          ) : (
            <>
              <p>
                Pemasok{' '}
                <span className="font-medium text-foreground">
                  {supplierToDelete?.name}
                </span>{' '}
                akan dihapus secara permanen. Tindakan ini tidak dapat
                dibatalkan.
              </p>
              <p className="mt-2 text-sm text-warning">
                Peringatan: Jika pemasok masih memiliki riwayat transaksi
                (pembelian, pembayaran, dll), sistem akan menolak penghapusan
                permanen.
              </p>
            </>
          )
        }
        onConfirm={() => {
          if (supplierToDelete) {
            deleteSupplier(supplierToDelete.id, {
              onSuccess: () => setSupplierToDelete(null),
            });
          }
        }}
        isDeleting={isDeleting}
        confirmLabel={
          supplierToDelete?.isActive ? 'Nonaktifkan' : 'Hapus Permanen'
        }
        cancelLabel="Batal"
      />
    </>
  );
}

export default function SuppliersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SuppliersContent />
    </Suspense>
  );
}
