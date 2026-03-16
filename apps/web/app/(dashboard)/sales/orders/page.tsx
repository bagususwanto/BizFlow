'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import {
  useSalesOrders,
  useDeleteSalesOrder,
  useBulkDeleteSalesOrders,
} from '@/hooks/use-sales-orders';
import { useCustomers } from '@/hooks/use-customers';
import { QuerySalesOrdersValues, SalesOrder } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/sales/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useFormatDate } from '@/hooks';
import { useTranslations } from 'next-intl';

function SalesOrdersContent() {
  const t = useTranslations('sales.orders');
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
  const customerId = searchParams.get('customerId') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const queryParams: QuerySalesOrdersValues = {
    page,
    pageSize,
    search,
    status: status !== 'all' ? (status as any) : undefined,
    sortBy: sortBy,
    sortOrder,
    customerId,
    startDate,
    endDate,
  };

  const {
    data: ordersData,
    isLoading,
    isError,
    refetch,
  } = useSalesOrders(queryParams);

  // Fetch customers for the filter dropdown
  const { customers: customersData } = useCustomers({ pageSize: 100 });
  const customers = customersData || [];

  const deleteMutation = useDeleteSalesOrder();
  const bulkDeleteMutation = useBulkDeleteSalesOrders();

  // Delete Dialog State (Local to Page to handle confirmation)
  const [orderToDelete, setOrderToDelete] = useState<SalesOrder | null>(
    null,
  );
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
        onDelete: (order) => setOrderToDelete(order),
        formatters,
        t: t as any,
      }),
    [formatters, t],
  );

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
      title={t('title')}
      description={t('description')}
      createLink="/sales/orders/new"
      createLabel={t('createLabel')}
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
          label: t('filter.status'),
          options: [
            { label: t('status.draft'), value: 'draft' },
            { label: t('status.confirmed'), value: 'confirmed' },
            { label: t('status.invoiced'), value: 'invoiced' },
            { label: t('status.completed'), value: 'completed' },
            { label: t('status.cancelled'), value: 'cancelled' },
          ],
          width: 'w-full md:w-[150px]',
        },
        {
          key: 'customerId',
          label: t('filter.customer'),
          type: 'combobox',
          options: customers.map((customer: any) => ({
            label: customer.name,
            value: customer.id,
          })),
          width: 'w-full md:w-[250px]',
          searchPlaceholder: t('filter.customerPlaceholder'),
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
                {t('summary.total')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.totalDesc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('summary.draft')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.draftOrders}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.draftDesc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('summary.confirmed')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.confirmedOrders}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.confirmedDesc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('summary.completed')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.completedOrders}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.completedDesc')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!orderToDelete}
        onOpenChange={(open) => !open && setOrderToDelete(null)}
        title={t('delete.title')}
        description={
          <>
            {t('delete.desc1')}
            <span className="font-semibold">{orderToDelete?.orderNumber}</span>
            {t('delete.desc2')}
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
        confirmLabel={t('actions.delete')}
      />
    </DataListPage>
  );
}

export default function SalesOrderListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SalesOrdersContent />
    </Suspense>
  );
}
