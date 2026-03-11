'use client';

import { Suspense, useCallback } from 'react';
import { useStockLots } from '@/hooks/use-stock-lots';
import { useWarehouses } from '@/hooks/use-warehouses';
import { useActiveCategories } from '@/hooks/use-categories';
import { useDebounce } from '@/hooks/use-debounce';
import { DataListPage } from '@/components/shared/data-list-page';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LotsSummary } from './components/lots-summary';
import { LotsTable } from './components/lots-table';
import { getColumns } from './columns';
import { useFormatDate } from '@/hooks';

function LotsContent() {
  const t = useTranslations('inventory.lots');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const warehouseId = searchParams.get('warehouseId') || 'all';
  const categoryId = searchParams.get('categoryId') || 'all';
  const status = searchParams.get('status') || 'all';
  const expiryDateStatus = searchParams.get('expiryDateStatus') || 'all';
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

  const debouncedSearch = useDebounce(search, 500);

  const { warehouses } = useWarehouses({ isActive: true });
  const { data: categories } = useActiveCategories();

  // Fetch Lots Data
  const { data, isLoading, refetch } = useStockLots({
    page,
    pageSize,
    search: debouncedSearch,
    warehouseId: warehouseId !== 'all' ? warehouseId : undefined,
    sortBy: sortBy as any,
    sortOrder,
  });

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
    [searchParams]
  );

  const updateUrl = (params: Record<string, string | number | null>) => {
    const queryString = handleCreateQueryString(params);
    router.push(`${pathname}?${queryString}`);
  };

  const totalPages = data?.meta?.totalPages || 1;
  const totalItems = data?.meta?.totalItems || 0;
  const summary = data?.summary;
  const formatters = useFormatDate();

  return (
    <DataListPage
      title={t('title')}
      description={t('description')}
      data={data?.data || []}
      columns={getColumns(formatters, t as any)}
      isLoading={isLoading}
      // Pagination
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      totalItems={totalItems}
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
      // Filters
      filterValues={{ warehouseId, categoryId, status, expiryDateStatus }}
      onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
      onReset={() => router.push(pathname)}
      filters={[
        {
          key: 'status',
          label: t('filter.statusLabel'),
          options: [
            { label: t('status.ACTIVE'), value: 'ACTIVE' },
            { label: t('status.EXPIRED'), value: 'EXPIRED' },
            { label: t('status.DEPLETED'), value: 'DEPLETED' },
            { label: t('status.QUARANTINED'), value: 'QUARANTINED' },
          ],
          width: 'w-full md:w-[150px]',
        },
        {
          key: 'expiryDateStatus',
          label: t('filter.expiryDateLabel'),
          options: [
            { label: t('tabs.expiringSoon'), value: 'EXPIRING_SOON' },
            { label: t('tabs.expired'), value: 'EXPIRED' },
          ],
          width: 'w-full md:w-[180px]',
        },
        {
          key: 'warehouseId',
          label: t('filter.warehouseLabel'),
          options: warehouses?.map((w) => ({ label: w.name, value: w.id })) || [],
          width: 'w-full md:w-[180px]',
        },
        {
          key: 'categoryId',
          label: t('filter.categoryLabel'),
          options: categories?.map((c) => ({ label: c.name, value: c.id })) || [],
          width: 'w-full md:w-[180px]',
        },
      ]}
      // Actions
      onRefresh={refetch}
      createButton={{
        label: t('createLabel'),
        href: '/inventory/lots/new',
      } as any}
    >
      {/* Summary Cards */}
      <div className="mb-6">
        <LotsSummary summary={summary} isLoading={isLoading} />
      </div>
    </DataListPage>
  );
}

export default function LotsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LotsContent />
    </Suspense>
  );
}
