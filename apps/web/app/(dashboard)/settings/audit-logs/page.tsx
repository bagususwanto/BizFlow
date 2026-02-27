'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@bizflow/ui';
import { AuditLogDetailSheet } from '@/components/audit-logs/audit-log-detail-sheet';
import { ErrorState } from '@/components/common/error-state';
import { useAuditLogs, useDebounce, useFormatDate } from '@/hooks';
import { AuditLog, auditLogService } from '@/services/audit-logs.service';
import { Download, Loader2, Box } from 'lucide-react';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/audit-logs/columns';
import { AVAILABLE_MODULES, AVAILABLE_ACTIONS } from '@bizflow/types';
import {
  exportToExcel,
  generateFilename,
  formatDateForExport,
} from '@/lib/export';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

function AuditLogsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const moduleFilter = searchParams.get('module') || 'all';
  const actionFilter = searchParams.get('action') || 'all';
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const sortBy =
    (searchParams.get('sortBy') as
      | 'createdAt'
      | 'action'
      | 'module'
      | 'user.name') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

  const startDate = startDateStr ? new Date(startDateStr) : undefined;
  const endDate = endDateStr ? new Date(endDateStr) : undefined;

  const t = useTranslations('auditLogs');

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const formatters = useFormatDate();

  const debouncedSearch = useDebounce(search, 500);

  const { auditLogs, meta, summary, isLoading, isError, refetch } =
    useAuditLogs({
      page,
      limit: pageSize,
      search: debouncedSearch,
      module: moduleFilter === 'all' ? undefined : moduleFilter,
      action: actionFilter === 'all' ? undefined : actionFilter,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      sortBy,
      sortOrder,
    });

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

  const handleDateRangeChange = (start?: Date, end?: Date) => {
    updateUrl({
      startDate: start ? start.toISOString() : null,
      endDate: end ? end.toISOString() : null,
      page: 1,
    });
  };

  const handleExportLogs = async () => {
    try {
      setIsExporting(true);
      toast.info(t('exportInfo'));

      const logs = await auditLogService.exportAll({
        search: debouncedSearch,
        module: moduleFilter === 'all' ? undefined : moduleFilter,
        action: actionFilter === 'all' ? undefined : actionFilter,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });

      exportToExcel(
        logs,
        [
          { key: 'id', label: 'ID', width: 30 },
          {
            key: 'createdAt',
            label: t('columns.time'),
            format: formatDateForExport,
            width: 20,
          },
          { key: 'user.name', label: t('columns.user'), width: 20 },
          { key: 'user.username', label: t('columns.username'), width: 15 },
          { key: 'module', label: t('columns.module'), width: 15 },
          { key: 'action', label: t('columns.action'), width: 12 },
          { key: 'entityType', label: t('columns.entityType'), width: 15 },
          { key: 'entityId', label: t('columns.entityId'), width: 30 },
          { key: 'ipAddress', label: t('columns.ipAddress'), width: 15 },
          { key: 'userAgent', label: t('columns.userAgent'), width: 40 },
        ],
        generateFilename('audit-logs'),
        t('title'),
      );
      toast.success(t('exportSuccess', { count: logs.length }));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  const columns = useMemo(
    () =>
      getColumns({
        t,
        onViewDetail: (log) => {
          setSelectedLog(log);
          setIsDetailOpen(true);
        },
        formatters,
      }),
    [t, formatters],
  );

  const data = auditLogs || [];
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
                total: summary.totalLogs,
                [t('summary.today')]: summary.logsToday,
                [t('summary.uniqueUsers')]: summary.uniqueUsers,
                [t('summary.topModule')]: summary.topModules?.[0]
                  ? `${summary.topModules[0].module} (${summary.topModules[0].count})`
                  : '-',
              }
            : undefined
        }
        summaryConfig={[{ key: 'total', label: t('summary.total'), icon: Box }]}
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
        filterValues={{ module: moduleFilter, action: actionFilter }}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        filters={[
          {
            key: 'module',
            label: t('filters.module'),
            options: AVAILABLE_MODULES.map((module) => ({
              value: module,
              label: module.charAt(0).toUpperCase() + module.slice(1),
            })),
            width: 'w-[150px]',
          },
          {
            key: 'action',
            label: t('filters.action'),
            options: AVAILABLE_ACTIONS.map((action) => ({
              value: action,
              label: action.charAt(0).toUpperCase() + action.slice(1),
            })),
            width: 'w-[150px]',
          },
        ]}
        // Date Range
        showDateRange={true}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
        // Reset
        onReset={() => router.push(pathname)}
        // Extra Actions
        headerAction={
          <Button onClick={handleExportLogs} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isExporting ? t('exporting') : t('exportExcel')}
          </Button>
        }
        onRefresh={refetch}
        isError={isError}
      />

      <AuditLogDetailSheet
        log={selectedLog}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </>
  );
}

export default function AuditLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AuditLogsContent />
    </Suspense>
  );
}
