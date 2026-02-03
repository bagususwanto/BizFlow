'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Box, Loader2 } from 'lucide-react';
import { useUnits } from '@/hooks/use-units';
import { UnitsQuery, UnitOfMeasure } from '@/services/units.service';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/master-data/units/columns';
import { ErrorState } from '@/components/common/error-state';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@bizflow/ui';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

function UnitsContent() {
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

  const queryParams: UnitsQuery = {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
  };

  const {
    units,
    meta,
    summary,
    isLoading,
    isError,
    deleteUnit,
    isDeleting,
    bulkDeleteUnits,
    isBulkDeleting,
    refetch,
  } = useUnits(queryParams);

  // Delete Dialog State (Local to Page to handle confirmation)
  const [unitToDelete, setUnitToDelete] = useState<UnitOfMeasure | null>(null);

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
    <ErrorState title="Gagal memuat data satuan" onRetry={() => refetch()} />
  );

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteUnits(ids, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (unit) => setUnitToDelete(unit),
      }),
    [],
  );

  if (isError) return handleError();

  const data = units || [];
  const metaData = meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  return (
    <>
      <DataListPage
        title="Satuan"
        description="Manajemen satuan produk (Unit of Measure)."
        createLink="/master-data/units/create"
        createLabel="Tambah Satuan"
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
                total: summary.totalUnits,
                baseUnits: summary.baseUnits,
                derivedUnits: summary.derivedUnits,
              }
            : undefined
        }
        summaryConfig={[
          { key: 'total', label: 'Total', icon: Box },
          {
            key: 'baseUnits',
            label: 'Dasar',
            icon: Box,
            className: 'text-info',
          },
          {
            key: 'derivedUnits',
            label: 'Turunan',
            icon: Box,
            className: 'text-warning',
          },
        ]}
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
        searchPlaceholder="Cari satuan..."
        onReset={() => router.push(pathname)}
        // No filters for Units currently based on existing implementation

        // Actions
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        onRefresh={refetch}
      />

      {/* Single Delete Dialog */}
      <DeleteConfirmDialog
        open={!!unitToDelete}
        onOpenChange={(open) => !open && setUnitToDelete(null)}
        title="Hapus Satuan Permanen?"
        description={
          <>
            Satuan{' '}
            <span className="font-medium text-foreground">
              {unitToDelete?.name}
            </span>{' '}
            akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            <p className="mt-2 text-sm text-warning">
              Peringatan: Jika satuan masih digunakan dalam transaksi atau
              produk, sistem akan menolak penghapusan permanen.
            </p>
          </>
        }
        onConfirm={() => {
          if (unitToDelete) {
            deleteUnit(unitToDelete.id, {
              onSuccess: () => setUnitToDelete(null),
            });
          }
        }}
        isDeleting={isDeleting}
        confirmLabel="Hapus Permanen"
        cancelLabel="Batal"
      />
    </>
  );
}

export default function UnitsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <UnitsContent />
    </Suspense>
  );
}
