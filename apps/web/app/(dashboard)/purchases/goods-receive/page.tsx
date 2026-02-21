'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  useGoodsReceives,
  useDeleteGoodsReceive,
  useBulkDeleteGoodsReceives,
} from '@/hooks/use-goods-receive';
import { QueryGoodsReceivesValues, GoodsReceive } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/inventory/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

function GoodsReceiveContent() {
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

  const queryParams: QueryGoodsReceivesValues = {
    page,
    pageSize,
    search,
    sortBy: sortBy as any,
    sortOrder,
  };

  const {
    data: goodsReceiveData,
    isLoading,
    isError,
    refetch,
  } = useGoodsReceives(queryParams);

  const deleteMutation = useDeleteGoodsReceive();
  const bulkDeleteMutation = useBulkDeleteGoodsReceives();

  // Delete Dialog State
  const [itemToDelete, setItemToDelete] = useState<GoodsReceive | null>(null);

  const handleCreateQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === '') {
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

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (item) => setItemToDelete(item),
      }),
    [],
  );

  const data = goodsReceiveData?.data || [];
  const meta = goodsReceiveData?.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  return (
    <DataListPage
      title="Penerimaan Barang"
      description="Kelola penerimaan barang dari purchase order."
      createLink="/purchases/goods-receive/new"
      createLabel="Terima Barang"
      data={data}
      columns={columns}
      isLoading={isLoading}
      // Pagination
      page={page}
      pageSize={pageSize}
      totalPages={meta.totalPages}
      totalItems={meta.totalItems}
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
      searchPlaceholder="Cari No. Terima atau PO..."
      onReset={() => router.push(pathname)}
      // Actions
      onRefresh={refetch}
      isError={isError}
      onBulkDelete={(ids) => bulkDeleteMutation.mutate(ids)}
      isBulkDeleting={bulkDeleteMutation.isPending}
    >
      <DeleteConfirmDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Hapus Penerimaan Barang?"
        description={
          <>
            Apakah Anda yakin ingin menghapus Penerimaan{' '}
            <span className="font-semibold">{itemToDelete?.receiveNumber}</span>
            ?
            <br />
            <br />
            <span className="text-destructive font-semibold">PERINGATAN:</span>
            <ul className="list-disc list-inside text-sm mt-2">
              <li>Stok yang sudah diterima akan dikurangi kembali.</li>
              <li>Status Purchase Order akan disesuaikan.</li>
            </ul>
          </>
        }
        onConfirm={() => {
          if (itemToDelete) {
            deleteMutation.mutate(itemToDelete.id, {
              onSuccess: () => setItemToDelete(null),
            });
          }
        }}
        isDeleting={deleteMutation.isPending}
        confirmLabel="Hapus & Balikkan Stok"
      />
    </DataListPage>
  );
}

export default function GoodsReceiveListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <GoodsReceiveContent />
    </Suspense>
  );
}
