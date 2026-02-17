'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import {
  usePurchaseOrders,
  useDeletePurchaseOrder,
} from '@/hooks/use-purchase-orders';
import { QueryPurchaseOrdersValues, PurchaseOrder } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/purchases/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

function PurchaseOrdersContent() {
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

  const queryParams: QueryPurchaseOrdersValues = {
    page,
    pageSize,
    search,
    status: status !== 'all' ? (status as any) : undefined,
    sortBy: sortBy as any,
    sortOrder,
  };

  const {
    data: ordersData,
    isLoading,
    isError,
    refetch,
  } = usePurchaseOrders(queryParams);

  const deleteMutation = useDeletePurchaseOrder();

  // Delete Dialog State (Local to Page to handle confirmation)
  const [orderToDelete, setOrderToDelete] = useState<PurchaseOrder | null>(
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
      title="Gagal memuat data purchase order"
      onRetry={() => refetch()}
    />
  );

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (order) => setOrderToDelete(order),
      }),
    [],
  );

  if (isError) return handleError();

  const orders = ordersData?.data || [];
  const meta = ordersData?.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };
  const summary = ordersData?.summary;

  return (
    <DataListPage
      title="Purchase Orders"
      description="Kelola pesanan pembelian barang ke pemasok."
      createLink="/purchases/orders/new"
      createLabel="Buat PO Baru"
      data={orders}
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
      searchPlaceholder="Cari No. PO atau Supplier..."
      filterValues={{ status }}
      onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
      onReset={() => router.push(pathname)}
      filters={[
        {
          key: 'status',
          label: 'Status',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Ordered', value: 'ordered' },
            { label: 'Received', value: 'received' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
          width: 'w-full md:w-[200px]',
        },
      ]}
      // Actions
      onRefresh={refetch}
    >
      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PO</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Semua status pesanan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.draftOrders}</div>
              <p className="text-xs text-muted-foreground">
                Pesanan belum diproses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dipesan</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.orderedOrders}</div>
              <p className="text-xs text-muted-foreground">
                Menunggu pengiriman
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diterima</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.receivedOrders}</div>
              <p className="text-xs text-muted-foreground">
                Barang sudah diterima
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!orderToDelete}
        onOpenChange={(open) => !open && setOrderToDelete(null)}
        title="Hapus Purchase Order?"
        description={
          <>
            Apakah Anda yakin ingin menghapus Purchase Order{' '}
            <span className="font-semibold">{orderToDelete?.orderNumber}</span>?
            Tindakan ini tidak dapat dibatalkan.
          </>
        }
        onConfirm={() => {
          if (orderToDelete) {
            deleteMutation.mutate(orderToDelete.id, {
              onSuccess: () => setOrderToDelete(null),
            });
          }
        }}
        isDeleting={deleteMutation.isPending}
        confirmLabel="Hapus"
      />
    </DataListPage>
  );
}

export default function PurchaseOrderListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PurchaseOrdersContent />
    </Suspense>
  );
}
