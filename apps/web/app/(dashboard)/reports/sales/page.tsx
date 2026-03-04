'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSalesReport } from '@/hooks/use-sales-report';
import { useWarehouses } from '@/hooks/use-warehouses'; // Using warehouses as proxy for outlets or create useOutlets
import { useActiveCategories } from '@/hooks/use-categories';
import { useActiveOutlets } from '@/hooks/use-outlets';
import { getColumns } from './columns';
import { DataListPage } from '@/components/shared/data-list-page'; // Might need custom layout for chart
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Loader2,
  Calendar as CalendarIcon,
  Download,
  FileSpreadsheet,
  FileText,
  DollarSign,
  ShoppingCart,
  Percent,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  formatCurrency,
  formatDate,
} from '@bizflow/ui';
import { reportsService } from '@/services/reports.service';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DataTable } from '@/components/ui/data-table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@bizflow/ui';
import { useTranslations } from 'next-intl';

function SalesReportContent() {
  const t = useTranslations('reports.sales');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const period = searchParams.get('period') || 'today';

  // Handling date range for custom period
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const outletId = searchParams.get('outletId') || 'all';
  const categoryId = searchParams.get('categoryId') || 'all';

  const { data: outlets } = useActiveOutlets();
  const { data: categories } = useActiveCategories();

  // Query
  const { data, isLoading, refetch, isFetching } = useSalesReport({
    page,
    pageSize,
    period: period as any,
    startDate,
    endDate,
    outletId: outletId !== 'all' ? outletId : undefined,
    categoryId: categoryId !== 'all' ? categoryId : undefined,
  });

  const updateUrl = (params: Record<string, string | number | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === '' || value === 'all') {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
    }
    router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
  };

  const isFiltered =
    period !== 'today' || outletId !== 'all' || categoryId !== 'all';

  const onReset = () => {
    updateUrl({
      period: 'today',
      outletId: 'all',
      categoryId: 'all',
      startDate: null,
      endDate: null,
      page: 1,
    });
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      toast.promise(
        reportsService.exportSales(
          {
            period: period as any,
            startDate,
            endDate,
            outletId: outletId !== 'all' ? outletId : undefined,
            categoryId: categoryId !== 'all' ? categoryId : undefined,
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

  const summary = data?.summary;
  const chartData = data?.dailyBreakdown || [];

  // Prepare chart data with formatted date
  const formattedChartData = useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      formattedDate: formatDate(item.date),
    }));
  }, [chartData]);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
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
      </div>
      {/* Filters */}
      <Card>
        <CardContent className="p-4 grid gap-4 grid-cols-1 md:grid-cols-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('filters.period.label')}
            </label>
            <Select
              value={period}
              onValueChange={(v) =>
                updateUrl({
                  period: v,
                  page: 1,
                  startDate: null,
                  endDate: null,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('filters.period.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">
                  {t('filters.period.today')}
                </SelectItem>
                <SelectItem value="week">{t('filters.period.week')}</SelectItem>
                <SelectItem value="month">
                  {t('filters.period.month')}
                </SelectItem>
                <SelectItem value="custom">
                  {t('filters.period.custom')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Outlet Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('filters.outlet.label')}
            </label>
            <Select
              value={outletId}
              onValueChange={(v) => updateUrl({ outletId: v, page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('filters.outlet.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.outlet.all')}</SelectItem>
                {outlets?.map((outlet) => (
                  <SelectItem key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('filters.category.label')}
            </label>
            <Select
              value={categoryId}
              onValueChange={(v) => updateUrl({ categoryId: v, page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('filters.category.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.category.all')}</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset Button */}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={onReset}
              className="w-full md:w-auto"
            >
              {t('filters.reset')}
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('summary.sales')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.totalSales || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('summary.transactions')}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalTransactions || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('summary.average')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.averagePerTransaction || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('summary.discount')}
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              -{formatCurrency(summary?.totalDiscount || 0)}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Charts */}
      {formattedChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('chart.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value?: number) => formatCurrency(value || 0)}
                    labelStyle={{ color: 'black' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="total"
                    name={t('chart.label')}
                    fill="#0ea5e9"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Table */}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t('details.title')}</h3>
        </div>
        <div className="p-0">
          <DataTable
            columns={getColumns(t)}
            data={data?.details || []}
            isLoading={isFetching}
          />
        </div>

        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="p-4 border-t flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) updateUrl({ page: page - 1 });
                    }}
                    className={
                      page <= 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {/* Simple pagination logic for brevity */}
                {Array.from({ length: Math.min(5, data.meta.totalPages) }).map(
                  (_, i) => {
                    const p = i + 1;
                    // Logic to show around current page could be more complex
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={page === p}
                          onClick={(e) => {
                            e.preventDefault();
                            updateUrl({ page: p });
                          }}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  },
                )}

                {data.meta.totalPages > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < data.meta.totalPages)
                        updateUrl({ page: page + 1 });
                    }}
                    className={
                      page >= data.meta.totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SalesReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <SalesReportContent />
    </Suspense>
  );
}
