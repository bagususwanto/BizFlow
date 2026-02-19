'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, FileText, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import {
  usePurchaseReturns,
  useDeletePurchaseReturn,
} from '@/hooks/use-purchase-returns';
import { QueryPurchaseReturnsValues, PurchaseReturn } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/purchases/returns/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

function PurchaseReturnsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

  const queryParams: QueryPurchaseReturnsValues = {
    page,
    pageSize,
    search,
    status: status !== 'all' ? (status as any) : undefined,
    sortBy: sortBy as any,
    sortOrder,
  };

  const {
    data: returnsData,
    isLoading,
    isError,
    refetch,
  } = usePurchaseReturns(queryParams);

  const deleteMutation = useDeletePurchaseReturn();

  // Delete Dialog State (Local to Page to handle confirmation)
  const [returnToDelete, setReturnToDelete] = useState<PurchaseReturn | null>(
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
    <ErrorState
      title="Gagal memuat data purchase return"
      onRetry={() => refetch()}
    />
  );

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (ret) => setReturnToDelete(ret),
      }),
    [],
  );

  const returns = returnsData?.data || [];
  const meta = returnsData?.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };
  const summary = returnsData?.summary;

  return (
    <DataListPage
      title="Retur Pembelian"
      description="Kelola pengembalian barang ke pemasok."
      createLink="/purchases/returns/new"
      createLabel="Buat Return Baru"
      data={returns}
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
      // Search & Filters
      search={search}
      onSearchChange={(v) => updateUrl({ search: v, page: 1 })}
      searchPlaceholder="Cari No. Return, PO, atau Pemasok..."
      filterValues={{ status }}
      onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
      onReset={() => router.push(pathname)}
      filters={[
        {
          key: 'status',
          label: 'Status',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Completed', value: 'completed' },
            { label: 'Rejected', value: 'rejected' },
          ],
          width: 'w-full md:w-[200px]',
        },
      ]}
      // Actions
      onRefresh={refetch}
      isError={isError}
    >
      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Return
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalReturns}</div>
              <p className="text-xs text-muted-foreground">
                Semua status return
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pendingReturns}</div>
              <p className="text-xs text-muted-foreground">
                Menunggu persetujuan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.approvedReturns}
              </div>
              <p className="text-xs text-muted-foreground">Siap dikirim</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.completedReturns}
              </div>
              <p className="text-xs text-muted-foreground">
                Barang dikembalikan
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!returnToDelete}
        onOpenChange={(open) => !open && setReturnToDelete(null)}
        title="Hapus Purchase Return?"
        description={
          <>
            Apakah Anda yakin ingin menghapus Purchase Return{' '}
            <span className="font-semibold">
              {returnToDelete?.returnNumber}
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </>
        }
        onConfirm={() => {
          if (returnToDelete) {
            deleteMutation.mutate(returnToDelete.id, {
              onSuccess: () => setReturnToDelete(null),
            });
          }
        }}
        isDeleting={deleteMutation.isPending}
        confirmLabel="Hapus"
      />
    </DataListPage>
  );
}

export default function PurchaseReturnListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PurchaseReturnsContent />
    </Suspense>
  );
}
