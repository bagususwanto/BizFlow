'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import {
  useSalesInvoices,
  useDeleteSalesInvoice,
  useBulkDeleteSalesInvoices,
} from '@/hooks/use-sales-invoices';
import { useCustomers } from '@/hooks/use-customers';
import { QueryInvoicesValues, Invoice } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/sales/invoices/columns';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useFormatDate } from '@/hooks';
import { useTranslations } from 'next-intl';

function SalesInvoicesContent() {
  const t = useTranslations('sales.invoices');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const paymentStatus = searchParams.get('paymentStatus') || 'all';
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;
  const customerId = searchParams.get('customerId') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const queryParams: QueryInvoicesValues = {
    page,
    pageSize,
    search,
    status: status !== 'all' ? (status as any) : undefined,
    paymentStatus: paymentStatus !== 'all' ? (paymentStatus as any) : undefined,
    sortBy: sortBy,
    sortOrder,
    customerId,
    startDate,
    endDate,
  };

  const {
    data: invoicesData,
    isLoading,
    isError,
    refetch,
  } = useSalesInvoices(queryParams);

  // Fetch customers for the filter dropdown
  const { customers: customersData } = useCustomers({ pageSize: 100 });
  const customers = customersData || [];

  const deleteMutation = useDeleteSalesInvoice();
  const bulkDeleteMutation = useBulkDeleteSalesInvoices();

  // Delete Dialog State
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(
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
        onDelete: (invoice) => setInvoiceToDelete(invoice),
        formatters,
        t: t as any,
      }),
    [formatters, t],
  );

  const invoices = invoicesData?.data || [];
  const meta = invoicesData?.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };
  const summary = invoicesData?.summary;

  return (
    <DataListPage
      title={t('title')}
      description={t('description')}
      createLink="/sales/invoices/new"
      createLabel={t('createLabel')}
      data={invoices}
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
      filterValues={{ status, paymentStatus, customerId: customerId || 'all' }}
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
            { label: t('status.sent'), value: 'sent' },
            { label: t('status.paid'), value: 'paid' },
            { label: t('status.cancelled'), value: 'cancelled' },
          ],
          width: 'w-full md:w-[150px]',
        },
        {
          key: 'paymentStatus',
          label: t('filter.paymentStatus'),
          options: [
            { label: t('paymentStatus.unpaid'), value: 'unpaid' },
            { label: t('paymentStatus.partial'), value: 'partial' },
            { label: t('paymentStatus.paid'), value: 'paid' },
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
              <div className="text-2xl font-bold">{summary.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.totalDesc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-destructive">
                {t('summary.unpaid')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.draftInvoices + summary.sentInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.unpaidDesc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-warning">
                {t('summary.partial')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.partialInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.partialDesc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-success">
                {t('summary.paid')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.paidInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {t('summary.paidDesc')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!invoiceToDelete}
        onOpenChange={(open) => !open && setInvoiceToDelete(null)}
        title={t('delete.title')}
        description={
          <>
            {t('delete.desc1')}
            <span className="font-semibold">{invoiceToDelete?.invoiceNumber}</span>
            {t('delete.desc2')}
          </>
        }
        onConfirm={() => {
          if (invoiceToDelete) {
            deleteMutation.mutate(invoiceToDelete.id, {
              onSuccess: () => setInvoiceToDelete(null),
            });
          }
        }}
        isDeleting={deleteMutation.isPending}
        confirmLabel={t('actions.delete')}
      />
    </DataListPage>
  );
}

export default function SalesInvoicesListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SalesInvoicesContent />
    </Suspense>
  );
}
