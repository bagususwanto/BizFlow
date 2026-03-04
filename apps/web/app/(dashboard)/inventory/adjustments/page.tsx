'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import {
  useStockAdjustments,
  useDeleteStockAdjustment,
  useBulkDeleteStockAdjustments,
} from '@/hooks/use-stock-adjustments';
import { useWarehouses } from '@/hooks/use-warehouses';
import { QueryStockAdjustmentsValues, StockAdjustment } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/inventory/adjustments/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useFormatDate } from '@/hooks';
import { useTranslations } from 'next-intl';

function StockAdjustmentsContent() {
  const t = useTranslations('adjustments');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const type = searchParams.get('type') || 'all';
  const warehouseId = searchParams.get('warehouseId') || 'all';
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const queryParams: QueryStockAdjustmentsValues = {
    page,
    pageSize,
    search,
    status: status !== 'all' ? (status as any) : undefined,
    type: type !== 'all' ? (type as any) : undefined,
    warehouseId: warehouseId !== 'all' ? warehouseId : undefined,
    sortBy: sortBy as any,
    sortOrder,
    startDate,
    endDate,
  };

  const {
    data: adjustmentsData,
    isLoading,
    isError,
    refetch,
  } = useStockAdjustments(queryParams);

  // Fetch warehouses for the filter dropdown
  const { warehouses: warehousesData } = useWarehouses({ pageSize: 100 });
  const warehouses = warehousesData || [];

  const deleteMutation = useDeleteStockAdjustment();
  const bulkDeleteMutation = useBulkDeleteStockAdjustments();

  // Delete Dialog State (Local to Page to handle confirmation)
  const [adjustmentToDelete, setAdjustmentToDelete] =
    useState<StockAdjustment | null>(null);
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

  const handleError = () => (
    <ErrorState title={t('failedLoad')} onRetry={() => refetch()} />
  );

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (adj) => setAdjustmentToDelete(adj),
        formatters,
        t: t as any,
      }),
    [formatters, t],
  );

  const adjustments = adjustmentsData?.data || [];
  const meta = adjustmentsData?.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };
  const summary = adjustmentsData?.summary;

  return (
    <DataListPage
      title={t('title')}
      description={t('description')}
      createLink="/inventory/adjustments/new"
      createLabel={t('createLabel')}
      data={adjustments}
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
      filterValues={{ status, type, warehouseId: warehouseId || 'all' }}
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
            { label: t('filters.status.pending'), value: 'pending' },
            { label: t('filters.status.approved'), value: 'approved' },
            { label: t('filters.status.rejected'), value: 'rejected' },
          ],
          width: 'w-full md:w-[150px]',
        },
        {
          key: 'type',
          label: t('filters.type.label'),
          options: [
            { label: t('filters.type.increase'), value: 'increase' },
            { label: t('filters.type.decrease'), value: 'decrease' },
            { label: t('filters.type.correction'), value: 'correction' },
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
              <div className="text-2xl font-bold">
                {summary.totalAdjustments}
              </div>
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
              <div className="text-2xl font-bold">
                {summary.draftAdjustments}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('summary.draft.desc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('summary.pending.title')}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.pendingAdjustments}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('summary.pending.desc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('summary.approved.title')}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.approvedAdjustments}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('summary.approved.desc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('summary.rejected.title')}
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.rejectedAdjustments}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('summary.rejected.desc')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!adjustmentToDelete}
        onOpenChange={(open) => !open && setAdjustmentToDelete(null)}
        title={t('delete.title')}
        description={
          <>
            {t('delete.desc1')}
            <span className="font-semibold">
              {adjustmentToDelete?.adjustmentNumber}
            </span>
            {t('delete.desc2')}
          </>
        }
        onConfirm={() => {
          if (adjustmentToDelete) {
            deleteMutation.mutate(adjustmentToDelete.id, {
              onSuccess: () => setAdjustmentToDelete(null),
            });
          }
        }}
        isDeleting={deleteMutation.isPending}
        confirmLabel={t('delete.confirmBtn')}
      />
    </DataListPage>
  );
}

export default function StockAdjustmentListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <StockAdjustmentsContent />
    </Suspense>
  );
}
