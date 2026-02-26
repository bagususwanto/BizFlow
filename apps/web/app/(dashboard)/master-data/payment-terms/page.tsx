'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { usePaymentTerms } from '@/hooks/master-data/use-payment-terms';
import { PaymentTermsQuery, PaymentTerm } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/master-data/payment-terms/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useTranslations } from 'next-intl';

function PaymentTermsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('paymentTerms');
  const tCommon = useTranslations('common');

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;
  const status = searchParams.get('status') || 'all';

  const queryParams: PaymentTermsQuery = {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    isActive: status === 'all' ? undefined : status === 'active',
  };

  const {
    paymentTerms,
    meta,
    summary,
    isLoading,
    isError,
    deletePaymentTerm,
    isDeleting,
    bulkDeletePaymentTerms,
    isBulkDeleting,
    refetch,
  } = usePaymentTerms(queryParams);

  // Delete Dialog State
  const [termToDelete, setTermToDelete] = useState<PaymentTerm | null>(null);

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
    bulkDeletePaymentTerms(ids, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (term) => setTermToDelete(term),
        t,
        tCommon,
      }),
    [t, tCommon],
  );

  const data = paymentTerms || [];
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
        createLink="/master-data/payment-terms/create"
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
                total: summary.total,
                active: summary.active,
                inactive: summary.inactive,
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
            label: 'Status',
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
        open={!!termToDelete}
        onOpenChange={(open) => !open && setTermToDelete(null)}
        title={
          termToDelete?.isActive
            ? t('delete.titleActive')
            : t('delete.titlePermanent')
        }
        description={
          termToDelete?.isActive
            ? t.rich('delete.descActive', {
                name: termToDelete?.name || '',
                bold: (chunks) => (
                  <span className="font-medium text-foreground">{chunks}</span>
                ),
              })
            : t.rich('delete.descPermanent1', {
                name: termToDelete?.name || '',
                bold: (chunks) => (
                  <span className="font-medium text-foreground">{chunks}</span>
                ),
              })
        }
        onConfirm={() => {
          if (termToDelete) {
            deletePaymentTerm(termToDelete.id, {
              onSuccess: () => setTermToDelete(null),
            });
          }
        }}
        isDeleting={isDeleting}
        confirmLabel={
          termToDelete?.isActive
            ? t('delete.btnDeactivate')
            : t('delete.btnDeletePermanent')
        }
        cancelLabel={tCommon('cancel')}
      />
    </>
  );
}

export default function PaymentTermsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PaymentTermsContent />
    </Suspense>
  );
}
