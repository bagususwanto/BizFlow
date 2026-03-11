'use client';

import { Suspense, useCallback } from 'react';
import { useStockValuation } from '@/hooks/use-stock-valuation';
import { useWarehouses } from '@/hooks/use-warehouses';
import { useActiveCategories } from '@/hooks/use-categories';
import { useDebounce } from '@/hooks/use-debounce';
import { DataListPage } from '@/components/shared/data-list-page';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Loader2, FileSpreadsheet, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@bizflow/ui';
import { reportsService } from '@/services/reports.service';
import { ValuationSummary } from './components/valuation-summary';
import { getColumns } from './columns';

function ValuationContent() {
  const t = useTranslations('valuation');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const warehouseId = searchParams.get('warehouseId') || 'all';
  const categoryId = searchParams.get('categoryId') || 'all';
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

  const debouncedSearch = useDebounce(search, 500);

  const { warehouses } = useWarehouses({ isActive: true });
  const { data: categories } = useActiveCategories();

  const { data, isLoading, refetch } = useStockValuation({
    page,
    pageSize,
    search: debouncedSearch,
    warehouseId: warehouseId !== 'all' ? warehouseId : undefined,
    categoryId: categoryId !== 'all' ? categoryId : undefined,
    sortBy: sortBy as any,
    sortOrder,
  });

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      toast.promise(
        reportsService.exportValuation(
          {
            page,
            pageSize,
            search: debouncedSearch,
            warehouseId: warehouseId !== 'all' ? warehouseId : undefined,
            categoryId: categoryId !== 'all' ? categoryId : undefined,
            sortBy: sortBy as any,
            sortOrder,
          },
          format,
        ),
        {
          loading: t('export.loading'),
          success: t('export.success'),
          error: t('export.error'),
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

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

  return (
    <DataListPage
      title={t('title')}
      description={t('description')}
      headerAction={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {t('export.excel')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
          >
            <FileText className="mr-2 h-4 w-4" />
            {t('export.pdf')}
          </Button>
        </div>
      }
      data={(data?.data || []) as any[]}
      columns={getColumns(t as any) as any[]}
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
      searchPlaceholder={t('filter.searchWarehouse')} // or generic summary search
      // Filters
      filterValues={{ warehouseId, categoryId }}
      onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
      onReset={() => router.push(pathname)}
      filters={[
        {
          key: 'warehouseId',
          label: t('filter.warehouseLabel'),
          options: warehouses?.map((w) => ({ label: w.name, value: w.id })) || [],
          width: 'w-full md:w-[200px]',
        },
        {
          key: 'categoryId',
          label: t('filter.categoryLabel'),
          options: categories?.map((c) => ({ label: c.name, value: c.id })) || [],
          width: 'w-full md:w-[200px]',
        },
      ]}
      // Actions
      onRefresh={refetch}
    >
      {/* Summary Cards */}
      <div className="mb-6">
        <ValuationSummary summary={summary} isLoading={isLoading} />
      </div>

      {data?.data.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-t">
          <p className="text-lg font-medium">{t('emptyState.title')}</p>
          <p className="text-sm mt-1">{t('emptyState.desc')}</p>
        </div>
      )}
    </DataListPage>
  );
}

export default function ValuationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ValuationContent />
    </Suspense>
  );
}
