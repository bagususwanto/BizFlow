'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import {
  useSalesReturns,
  useDeleteSalesReturn,
  useBulkDeleteSalesReturns,
} from '@/hooks/use-sales-returns';
import { useCustomers } from '@/hooks/use-customers';
import { QuerySalesReturnsValues, SalesReturn } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/sales/returns/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useFormatDate } from '@/hooks';
import { useTranslations } from 'next-intl';

function SalesReturnsContent() {
  const t = useTranslations('sales.returns');
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
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const customerId = searchParams.get('customerId') || undefined;

  const queryParams: QuerySalesReturnsValues = {
    page,
    pageSize,
    search,
    status: status !== 'all' ? (status as any) : undefined,
    sortBy: sortBy as any,
    sortOrder,
    startDate,
    endDate,
    customerId,
  };

  const {
    data: returnsData,
    isLoading,
    isError,
    refetch,
  } = useSalesReturns(queryParams);

  // Fetch customers for the filter dropdown
  const { customers: customersData } = useCustomers({ pageSize: 100 });
  const customers = customersData || [];

  const deleteMutation = useDeleteSalesReturn();
  const bulkDeleteMutation = useBulkDeleteSalesReturns();

  // Delete Dialog State (Local to Page to handle confirmation)
  const [returnToDelete, setReturnToDelete] = useState<SalesReturn | null>(null);
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
        onDelete: (ret) => setReturnToDelete(ret),
        formatters,
        t: t as any,
      }),
    [formatters, t],
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
      title={t('title')}
      description={t('description')}
      createLink="/sales/returns/new"
      createLabel={t('createLabel')}
      data={returns}
      columns={columns as any}
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
      filterValues={{ status, customerId: customerId || 'all' }}
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
            { label: t('filters.status.pending'), value: 'pending' },
            { label: t('filters.status.approved'), value: 'approved' },
            { label: t('filters.status.rejected'), value: 'rejected' },
          ],
          width: 'w-full md:w-[200px]',
        },
        {
          key: 'customerId',
          label: t('filters.customer.label'),
          type: 'combobox',
          options: customers.map((customer: any) => ({
            label: customer.name,
            value: customer.id,
          })),
          width: 'w-full md:w-[250px]',
          searchPlaceholder: t('filters.customer.searchPlaceholder'),
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('summary.total.title')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalReturns}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.total.desc')}
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
              <div className="text-2xl font-bold">{summary.pendingReturns}</div>
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
                {summary.approvedReturns}
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
                {summary.rejectedReturns}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('summary.rejected.desc')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!returnToDelete}
        onOpenChange={(open) => !open && setReturnToDelete(null)}
        title={t('delete.title')}
        description={
          <>
            {t('delete.desc1')}
            <span className="font-semibold">
              {returnToDelete?.returnNumber}
            </span>
            {t('delete.desc2')}
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
        confirmLabel={t('delete.confirmBtn')}
      />
    </DataListPage>
  );
}

export default function SalesReturnListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SalesReturnsContent />
    </Suspense>
  );
}
