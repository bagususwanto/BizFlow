'use client';

import { useState } from 'react';
import { StockAlertStats } from '@/components/dashboard/stock-alerts/stock-alert-stats';
import { StockAlertTable } from '@/components/dashboard/stock-alerts/stock-alert-table';
import { useLowStockProducts } from '@/hooks/use-products';
import {
  Button,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bizflow/ui';
import { RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function StockAlertPage() {
  const t = useTranslations('dashboard');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, refetch, isRefetching } = useLowStockProducts({
    page,
    pageSize,
  });

  const products = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages || 1;
  const totalItems = meta?.totalItems || 0;

  // Compute stats from current page data (note: for accurate totals, backend could return these)
  const outOfStockCount = products.filter((p) => p.currentStock <= 0).length;
  const criticalStockCount = products.filter(
    (p) => p.currentStock > 0 && p.currentStock <= p.minStock * 0.5,
  ).length;
  const lowStockCount = products.filter(
    (p) => p.currentStock > p.minStock * 0.5 && p.currentStock <= p.minStock,
  ).length;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1); // Reset to first page
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('stockAlertsPage.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('stockAlertsPage.description')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
          />
          {t('refresh')}
        </Button>
      </div>

      <StockAlertStats
        lowStockCount={lowStockCount}
        criticalStockCount={criticalStockCount}
        outOfStockCount={outOfStockCount}
        isLoading={isLoading}
      />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {t('stockAlertsPage.table.title')}
        </h2>
        <StockAlertTable data={products} isLoading={isLoading} />

        {/* Pagination */}
        {meta && (
          <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              {t('stockAlertsPage.table.showing')} {products.length}{' '}
              {t('stockAlertsPage.table.of')} {totalItems}{' '}
              {t('stockAlertsPage.table.products')}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                  {t('stockAlertsPage.table.rowsPerPage')}
                </span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 50].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Pagination className="justify-end w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page - 1);
                      }}
                      className={
                        page <= 1 ? 'pointer-events-none opacity-50' : ''
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="flex h-9 items-center justify-center px-4 text-sm">
                      {t('stockAlertsPage.table.page')} {page}{' '}
                      {t('stockAlertsPage.table.of')} {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page + 1);
                      }}
                      className={
                        page >= totalPages
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
