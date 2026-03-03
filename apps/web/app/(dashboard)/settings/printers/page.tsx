'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { usePrinters } from '@/hooks';
import { getColumns } from '@/components/core/printers/columns';
import { DataListPage } from '@/components/shared/data-list-page';
import { Printer } from '@/services/printers.service';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useTranslations } from 'next-intl';

function PrintersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('printers');
  const tCommon = useTranslations('common');

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const sortBy =
    (searchParams.get('sortBy') as 'name' | 'createdAt' | 'updatedAt') ||
    undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;
  // const type = searchParams.get('type') || 'all'; // TODO: Enable if backend supports filtering by type

  const {
    printers,
    meta,
    summary,
    isLoading,
    deletePrinter,
    isDeleting,

    bulkDeletePrinters,
    isBulkDeleting,
    testPrint,
    isTesting,
    refetch,
    isError,
  } = usePrinters({
    page,
    pageSize,
    search,
    isActive:
      status === 'active' ? true : status === 'inactive' ? false : undefined,
    sortBy,
    sortOrder,
    // type: type !== 'all' ? (type as 'network' | 'usb') : undefined,
  });

  // Local state
  const [printerToDelete, setPrinterToDelete] = useState<Printer | null>(null);

  const createQueryString = useCallback(
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const queryString = createQueryString(params);
    router.push(`${pathname}?${queryString}`);
  };

  const handleTestPrint = (printer: Printer) => {
    testPrint(printer.id);
  };

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: setPrinterToDelete,
        onTestPrint: handleTestPrint,
        t,
      }),
    [setPrinterToDelete, t],
  );

  const data = printers || [];
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
        createLink="/settings/printers/create"
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
          // Toggle sort order if clicking the same field
          const newOrder =
            field === sortBy && sortOrder === 'asc' ? 'desc' : 'asc';
          updateUrl({ sortBy: field, sortOrder: newOrder, page: 1 });
        }}
        // Search
        search={search}
        onSearchChange={(v) => updateUrl({ search: v, page: 1 })}
        searchPlaceholder={t('searchPlaceholder')}
        // Actions
        onBulkDelete={(ids) => {
          bulkDeletePrinters(ids, {
            onSuccess: () => refetch(),
          });
        }}
        isBulkDeleting={isBulkDeleting}
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
        onRefresh={refetch}
        isError={isError}
        onDelete={(id) => {
          const printer = data.find((p) => p.id === id);
          if (printer) setPrinterToDelete(printer);
        }}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={!!printerToDelete}
        onOpenChange={(open) => !open && setPrinterToDelete(null)}
        title={
          printerToDelete?.isActive
            ? t('delete.titleActive')
            : t('delete.titlePermanent')
        }
        description={
          printerToDelete?.isActive ? (
            t.rich('delete.descActive', {
              name: printerToDelete?.name || '',
              bold: (chunks) => (
                <span key="bold1" className="font-medium text-foreground">
                  {chunks}
                </span>
              ),
            })
          ) : (
            <>
              <p>
                {t.rich('delete.descPermanent1', {
                  name: printerToDelete?.name || '',
                  bold: (chunks) => (
                    <span key="bold2" className="font-medium text-foreground">
                      {chunks}
                    </span>
                  ),
                })}
              </p>
              <p className="mt-2 text-sm text-warning">
                {t('delete.descPermanent2')}
              </p>
            </>
          )
        }
        confirmLabel={
          printerToDelete?.isActive
            ? t('delete.btnDeactivate')
            : t('delete.btnDeletePermanent')
        }
        isDeleting={isDeleting}
        onConfirm={() => {
          if (printerToDelete) {
            deletePrinter(printerToDelete.id, {
              onSuccess: () => setPrinterToDelete(null),
            });
          }
        }}
      />
    </>
  );
}

export default function PrintersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PrintersContent />
    </Suspense>
  );
}
