'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  useGoodsReceives,
  useDeleteGoodsReceive,
  useBulkDeleteGoodsReceives,
} from '@/hooks/use-goods-receive';
import { QueryGoodsReceivesValues, GoodsReceive } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/inventory/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useFormatDate } from '@/hooks';
import { useTranslations } from 'next-intl';

function GoodsReceiveContent() {
  const t = useTranslations('purchases.goodsReceive');
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

  const queryParams: QueryGoodsReceivesValues = {
    page,
    pageSize,
    search,
    sortBy: sortBy as any,
    sortOrder,
    startDate,
    endDate,
  };

  const {
    data: goodsReceiveData,
    isLoading,
    isError,
    refetch,
  } = useGoodsReceives(queryParams);

  const deleteMutation = useDeleteGoodsReceive();
  const bulkDeleteMutation = useBulkDeleteGoodsReceives();

  // Delete Dialog State
  const [itemToDelete, setItemToDelete] = useState<GoodsReceive | null>(null);
  const formatters = useFormatDate();

  const handleCreateQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === '') {
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
        onDelete: (item) => setItemToDelete(item),
        formatters,
        t: t as any,
      }),
    [formatters, t],
  );

  const data = goodsReceiveData?.data || [];
  const meta = goodsReceiveData?.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  return (
    <DataListPage
      title={t('title')}
      description={t('description')}
      createLink="/purchases/goods-receive/new"
      createLabel={t('createLabel')}
      data={data}
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
      searchPlaceholder={t('searchPlaceholder')}
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
      // Actions
      onRefresh={refetch}
      isError={isError}
      onBulkDelete={(ids) => bulkDeleteMutation.mutate(ids)}
      isBulkDeleting={bulkDeleteMutation.isPending}
    >
      <DeleteConfirmDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title={t('delete.title')}
        description={
          <>
            {t('delete.desc1')}
            <span className="font-semibold">{itemToDelete?.receiveNumber}</span>
            {t('delete.desc2')}
            <br />
            <br />
            <span className="text-destructive font-semibold">
              {t('delete.warningTitle')}
            </span>
            <ul className="list-disc list-inside text-sm mt-2">
              <li>{t('delete.warning1')}</li>
              <li>{t('delete.warning2')}</li>
            </ul>
          </>
        }
        onConfirm={() => {
          if (itemToDelete) {
            deleteMutation.mutate(itemToDelete.id, {
              onSuccess: () => setItemToDelete(null),
            });
          }
        }}
        isDeleting={deleteMutation.isPending}
        confirmLabel={t('delete.confirmBtn')}
      />
    </DataListPage>
  );
}

export default function GoodsReceiveListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <GoodsReceiveContent />
    </Suspense>
  );
}
