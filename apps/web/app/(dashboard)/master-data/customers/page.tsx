'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useCustomers } from '@/hooks/use-customers';
import { CustomersQuery } from '@/services/customers.service';
import { Customer } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/master-data/customers/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

function CustomersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;
  const status = searchParams.get('status') || 'all';

  const queryParams: CustomersQuery = {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    isActive: status === 'all' ? undefined : status === 'active',
  };

  const {
    customers,
    meta,
    summary,
    isLoading,
    isError,
    deleteCustomer,
    isDeleting,
    bulkDeleteCustomers,
    isBulkDeleting,
    refetch,
  } = useCustomers(queryParams);

  // Delete Dialog State
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
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
    <ErrorState title={t('failedLoad')} onRetry={() => refetch()} />
  );

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteCustomers(ids, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (customer) => setCustomerToDelete(customer),
        t,
        tCommon,
      }),
    [t, tCommon],
  );

  const data = customers || [];
  const metaData = meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  return (
    <>
      <DataListPage
        title={t('title')}
        description={t('description')}
        createLink="/master-data/customers/create"
        createLabel={t('createLabel')}
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
                total: summary.totalCustomers,
                active: summary.activeCustomers,
                inactive: summary.inactiveCustomers,
              }
            : undefined
        }
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
        searchPlaceholder={t('searchPlaceholder')}
        // Filters
        filterValues={{ status }}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        onReset={() => router.push(pathname)}
        filters={[
          {
            key: 'status',
            label: tCommon('status.label'),
            options: [
              { label: tCommon('status.active'), value: 'active' },
              { label: tCommon('status.inactive'), value: 'inactive' },
            ],
            width: 'w-[150px]',
          },
        ]}
        // Actions
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        onRefresh={refetch}
        isError={isError}
      />

      {/* Single Delete Dialog */}
      <DeleteConfirmDialog
        open={!!customerToDelete}
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
        title={
          customerToDelete?.isActive
            ? t('delete.titleActive')
            : t('delete.titlePermanent')
        }
        description={
          customerToDelete?.isActive
            ? t.rich('delete.descActive', {
                name: customerToDelete?.name || '',
                bold: (chunks) => (
                  <span className="font-medium text-foreground">{chunks}</span>
                ),
              })
            : t.rich('delete.descPermanent1', {
                name: customerToDelete?.name || '',
                bold: (chunks) => (
                  <span className="font-medium text-foreground">{chunks}</span>
                ),
              })
        }
        onConfirm={() => {
          if (customerToDelete) {
            deleteCustomer(customerToDelete.id, {
              onSuccess: () => setCustomerToDelete(null),
            });
          }
        }}
        isDeleting={isDeleting}
        confirmLabel={
          customerToDelete?.isActive
            ? t('delete.btnDeactivate')
            : t('delete.btnDeletePermanent')
        }
        cancelLabel={tCommon('cancel')}
      />
    </>
  );
}

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CustomersContent />
    </Suspense>
  );
}
