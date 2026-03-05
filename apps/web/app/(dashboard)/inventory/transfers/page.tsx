'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, FileText, Send, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import {
  useStockTransfers,
  useDeleteStockTransfer,
  useBulkDeleteStockTransfers,
} from '@/hooks/use-stock-transfers';
import { useWarehouses } from '@/hooks/use-warehouses';
import { QueryStockTransfersValues, StockTransfer } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/inventory/transfers/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useFormatDate } from '@/hooks';
import { useTranslations } from 'next-intl';

function StockTransfersContent() {
  const t = useTranslations('transfers');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const warehouseId = searchParams.get('warehouseId') || 'all';
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const queryParams: QueryStockTransfersValues = {
    page,
    pageSize,
    search,
    status: status !== 'all' ? (status as any) : undefined,
    fromWarehouseId: warehouseId !== 'all' ? warehouseId : undefined,
    sortBy: sortBy as any,
    sortOrder,
    startDate,
    endDate,
  };

  const {
    data: transfersData,
    isLoading,
    isError,
    refetch,
  } = useStockTransfers(queryParams);

  // Fetch warehouses for the filter dropdown
  const { warehouses: warehousesData } = useWarehouses({ pageSize: 100 });
  const warehouses = warehousesData || [];

  const deleteMutation = useDeleteStockTransfer();
  const bulkDeleteMutation = useBulkDeleteStockTransfers();

  // Delete Dialog State (Local to Page to handle confirmation)
  const [transferToDelete, setTransferToDelete] =
    useState<StockTransfer | null>(null);
  const formatters = useFormatDate();

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

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (trf) => setTransferToDelete(trf),
        formatters,
        t: t as any,
      }),
    [formatters, t],
  );

  const transfers = transfersData?.data || [];
  const meta = transfersData?.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };
  const summary = transfersData?.summary;

  return (
    <DataListPage
      title={t('title')}
      description={t('description')}
      createLink="/inventory/transfers/new"
      createLabel={t('createLabel')}
      data={transfers}
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
      searchPlaceholder={t('searchPlaceholder')}
      filterValues={{ status, warehouseId: warehouseId || 'all' }}
      onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
      onReset={() => router.push(pathname)}
      showDateRange={true}
      startDate={startDate ? new Date(startDate) : undefined}
      endDate={endDate ? new Date(endDate) : undefined}
      onDateRangeChange={(start, end) =>
        updateUrl({
          startDate: start?.toISOString() || null,
          endDate: end?.toISOString() || null,
          page: 1,
        })
      }
      filters={[
        {
          key: 'status',
          label: t('filters.status.label'),
          options: [
            { label: t('filters.status.draft'), value: 'draft' },
            { label: t('filters.status.sent'), value: 'sent' },
            { label: t('filters.status.received'), value: 'received' },
            { label: t('filters.status.cancelled'), value: 'cancelled' },
          ],
          width: 'w-full md:w-[150px]',
        },
        {
          key: 'warehouseId',
          label: t('filters.warehouse.label'),
          type: 'combobox',
          options: warehouses.map((warehouse: any) => ({
            label: warehouse.name,
            value: warehouse.id,
          })),
          width: 'w-full md:w-[200px]',
          searchPlaceholder: t('filters.warehouse.searchPlaceholder'),
        },
      ]}
      // Actions
      onRefresh={refetch}
      isError={isError}
      onBulkDelete={(ids) => bulkDeleteMutation.mutate(ids)}
      isBulkDeleting={bulkDeleteMutation.isPending}
    >
      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('summary.total.title')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.total.desc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('summary.draft.title')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.draft}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.draft.desc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('summary.sent.title')}
              </CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.sent}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.sent.desc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('summary.received.title')}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.received}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.received.desc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('summary.cancelled.title')}
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.cancelled}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.cancelled.desc')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!transferToDelete}
        onOpenChange={(open) => !open && setTransferToDelete(null)}
        title={t('delete.title')}
        description={
          <>
            {t('delete.desc1')}
            <span className="font-semibold">
              {transferToDelete?.transferNumber}
            </span>
            {t('delete.desc2')}
          </>
        }
        onConfirm={() => {
          if (transferToDelete) {
            deleteMutation.mutate(transferToDelete.id, {
              onSuccess: () => setTransferToDelete(null),
            });
          }
        }}
        isDeleting={deleteMutation.isPending}
        confirmLabel={t('delete.confirmBtn')}
      />
    </DataListPage>
  );
}

export default function StockTransfersListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <StockTransfersContent />
    </Suspense>
  );
}
