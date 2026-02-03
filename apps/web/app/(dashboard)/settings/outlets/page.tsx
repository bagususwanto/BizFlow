'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useOutlets } from '@/hooks';
import { getColumns } from '@/components/core/outlets/columns';
import { DataListPage } from '@/components/shared/data-list-page';
import { Outlet } from '@/services/outlets.service';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

function OutletsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const sortBy =
    (searchParams.get('sortBy') as
      | 'code'
      | 'name'
      | 'createdAt'
      | 'updatedAt'
      | 'userCount') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

  // Debounce search input would be better but keeping simple for now
  const {
    outlets,
    meta,
    summary,
    isLoading,
    deleteOutlet,
    isDeleting,
    bulkDeleteOutlets,
    isBulkDeleting,
    refetch,
  } = useOutlets({
    page,
    pageSize,
    search,
    isActive:
      status === 'active' ? true : status === 'inactive' ? false : undefined,
    sortBy,
    sortOrder,
  });

  // Local state
  const [outletToDelete, setOutletToDelete] = useState<Outlet | null>(null);

  const createQueryString = useCallback(
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
    const queryString = createQueryString(params);
    router.push(`${pathname}?${queryString}`);
  };

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteOutlets(ids, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: setOutletToDelete,
      }),
    [],
  );

  const data = outlets || [];
  const metaData = meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  return (
    <>
      <DataListPage
        title="Outlet"
        description="Kelola data outlet dan cabang perusahaan."
        createLink="/settings/outlets/create"
        createLabel="Tambah Outlet"
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
                total: summary.totalOutlets,
                active: summary.activeOutlets,
                inactive: summary.inactiveOutlets,
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
        searchPlaceholder="Cari outlet..."
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
        onDelete={(id) => {
          const outlet = data.find((o) => o.id === id);
          if (outlet) setOutletToDelete(outlet);
        }}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={!!outletToDelete}
        onOpenChange={(open) => !open && setOutletToDelete(null)}
        title={
          outletToDelete?.isActive
            ? 'Nonaktifkan Outlet?'
            : 'Hapus Outlet Permanen?'
        }
        description={
          outletToDelete?.isActive ? (
            <>
              Outlet{' '}
              <span className="font-medium text-foreground">
                {outletToDelete?.name}
              </span>{' '}
              akan dinonaktifkan. Data outlet tetap tersimpan.
            </>
          ) : (
            <>
              <p>
                Outlet{' '}
                <span className="font-medium text-foreground">
                  {outletToDelete?.name}
                </span>{' '}
                akan dihapus secara permanen. Tindakan ini tidak dapat
                dibatalkan.
              </p>
              <p className="mt-2 text-sm text-warning">
                Peringatan: Jika outlet masih memiliki riwayat transaksi (stok,
                penjualan, dll), sistem akan menolak penghapusan permanen.
              </p>
            </>
          )
        }
        confirmLabel={
          outletToDelete?.isActive ? 'Nonaktifkan' : 'Hapus Permanen'
        }
        isDeleting={isDeleting}
        onConfirm={() => {
          if (outletToDelete) {
            deleteOutlet(outletToDelete.id, {
              onSuccess: () => setOutletToDelete(null),
            });
          }
        }}
      />
    </>
  );
}

export default function OutletsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <OutletsContent />
    </Suspense>
  );
}
