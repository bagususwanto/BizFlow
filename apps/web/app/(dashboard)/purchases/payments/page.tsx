'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, FileText, CheckCircle, Clock, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import {
  useSupplierPayments,
  useDeleteSupplierPayment,
  useBulkDeleteSupplierPayments,
} from '@/hooks/use-supplier-payments';
import { useSuppliers } from '@/hooks/use-suppliers';
import { QuerySupplierPaymentsValues, SupplierPayment } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/purchases/payments/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { formatCurrency } from '@bizflow/ui';
import { useFormatDate } from '@/hooks';

function SupplierPaymentsContent() {
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
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const supplierId = searchParams.get('supplierId') || undefined;

  const queryParams: QuerySupplierPaymentsValues = {
    page,
    pageSize,
    search,
    sortBy: sortBy as any,
    sortOrder,
    startDate,
    endDate,
    supplierId,
  };

  const {
    data: paymentsData,
    isLoading,
    isError,
    refetch,
  } = useSupplierPayments(queryParams);

  // Fetch suppliers for the filter dropdown
  const { suppliers: suppliersData } = useSuppliers({ pageSize: 100 });
  const suppliers = suppliersData || [];

  const deleteMutation = useDeleteSupplierPayment();
  const bulkDeleteMutation = useBulkDeleteSupplierPayments();

  // Delete Dialog State
  const [paymentToDelete, setPaymentToDelete] =
    useState<SupplierPayment | null>(null);
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
        onDelete: (payment) => setPaymentToDelete(payment),
        formatters,
      }),
    [formatters],
  );

  const payments = paymentsData?.data || [];
  const meta = paymentsData?.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };
  // Use summary from API if available, otherwise mock or 0
  const summary = (paymentsData as any)?.summary || {
    totalPayments: 0,
    totalAmount: 0,
  };

  return (
    <DataListPage
      title="Pembayaran Pemasok"
      description="Kelola pembayaran utang ke pemasok."
      createLink="/purchases/payments/new"
      createLabel="Buat Pembayaran"
      data={payments}
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
      searchPlaceholder="Cari No. Pembayaran, Pemasok, PO..."
      filterValues={{ supplierId: supplierId || 'all' }}
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
          key: 'supplierId',
          label: 'Pemasok',
          type: 'combobox',
          options: suppliers.map((supplier: any) => ({
            label: supplier.name,
            value: supplier.id,
          })),
          width: 'w-full md:w-[250px]',
          searchPlaceholder: 'Cari pemasok...',
        },
      ]}
      // Actions
      onRefresh={refetch}
      isError={isError}
      onBulkDelete={(ids) => bulkDeleteMutation.mutate(ids)}
      isBulkDeleting={bulkDeleteMutation.isPending}
    >
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pembayaran
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalPayments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Transaksi pembayaran
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keluar</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total nominal dibayarkan
            </p>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmDialog
        open={!!paymentToDelete}
        onOpenChange={(open) => !open && setPaymentToDelete(null)}
        title="Hapus Pembayaran?"
        description={
          <>
            Apakah Anda yakin ingin menghapus Pembayaran{' '}
            <span className="font-semibold">
              {paymentToDelete?.paymentNumber}
            </span>
            ? Tindakan ini akan mengembalikan status pembayaran PO.
          </>
        }
        onConfirm={() => {
          if (paymentToDelete) {
            deleteMutation.mutate(paymentToDelete.id, {
              onSuccess: () => setPaymentToDelete(null),
            });
          }
        }}
        isDeleting={deleteMutation.isPending}
        confirmLabel="Hapus"
      />
    </DataListPage>
  );
}

export default function SupplierPaymentListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SupplierPaymentsContent />
    </Suspense>
  );
}
