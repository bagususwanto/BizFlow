'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useOutlets } from '@/hooks';
import { getColumns } from '@/components/core/outlets/columns';
import { DataListPage } from '@/components/shared/data-list-page';
import { Outlet } from '@/services/outlets.service';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useTranslations } from 'next-intl';

function OutletsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('outlets');
  const tCommon = useTranslations('common');

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const sortBy =
    (searchParams.get('sortBy') as
      | 'code'
      | 'name'
      | 'createdAt'
      | 'updatedAt'
      | 'userCount') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

  // Debounce search input would be better but keeping simple for now
  const {
    outlets,
    meta,
    summary,
    isLoading,
    deleteOutlet,
    isDeleting,
    bulkDeleteOutlets,
    isBulkDeleting,
    refetch,
    isError,
  } = useOutlets({
    page,
    pageSize,
    search,
    isActive:
      status === 'active' ? true : status === 'inactive' ? false : undefined,
    sortBy,
    sortOrder,
  });

  // Local state
  const [outletToDelete, setOutletToDelete] = useState<Outlet | null>(null);

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
    const queryString = createQueryString(params);
    router.push(`${pathname}?${queryString}`);
  };

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteOutlets(ids, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: setOutletToDelete,
        t,
      }),
    [t],
  );

  const data = outlets || [];
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
        createLink="/settings/outlets/create"
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
                total: summary.totalOutlets,
                active: summary.activeOutlets,
                inactive: summary.inactiveOutlets,
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
        isError={isError} // Note: useOutlets didn't return isError in the previous view, checking if I need to add it to destructuring or if it was missed
        onDelete={(id) => {
          const outlet = data.find((o) => o.id === id);
          if (outlet) setOutletToDelete(outlet);
        }}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={!!outletToDelete}
        onOpenChange={(open) => !open && setOutletToDelete(null)}
        title={
          outletToDelete?.isActive
            ? t('delete.titleActive')
            : t('delete.titlePermanent')
        }
        description={
          outletToDelete?.isActive ? (
            t.rich('delete.descActive', {
              name: outletToDelete?.name || '',
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
                  name: outletToDelete?.name || '',
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
          outletToDelete?.isActive
            ? t('delete.btnDeactivate')
            : t('delete.btnDeletePermanent')
        }
        isDeleting={isDeleting}
        onConfirm={() => {
          if (outletToDelete) {
            deleteOutlet(outletToDelete.id, {
              onSuccess: () => setOutletToDelete(null),
            });
          }
        }}
      />
    </>
  );
}

export default function OutletsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <OutletsContent />
    </Suspense>
  );
}
