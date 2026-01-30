'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@bizflow/ui';
import { AuditLogDetailSheet } from '@/components/audit-logs/audit-log-detail-sheet';
import { ErrorState } from '@/components/common/error-state';
import { useAuditLogs, useDebounce } from '@/hooks';
import { AuditLog } from '@/services/audit-logs.service';
import { Download, Loader2 } from 'lucide-react';
import { SettingsPage } from '@/components/settings/settings-page';
import { getColumns } from '@/components/audit-logs/columns';
import { AVAILABLE_MODULES, AVAILABLE_ACTIONS } from '@bizflow/types';

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

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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

  if (isError) {
    return (
      <ErrorState title="Gagal memuat audit logs" onRetry={() => refetch()} />
    );
  }

  const columns = useMemo(
    () =>
      getColumns({
        onViewDetail: (log) => {
          setSelectedLog(log);
          setIsDetailOpen(true);
        },
      }),
    [],
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
      <SettingsPage
        title="Audit Logs"
        description="Monitor dan pelacakan aktivitas pengguna dalam sistem."
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
        summaryLabels={{
          total: 'Total Log:',
        }}
        summary={
          summary
            ? {
                total: summary.totalLogs,
                'Log Hari Ini': summary.logsToday,
                'Pengguna Unik': summary.uniqueUsers,
                'Modul Teratas': summary.topModules?.[0]
                  ? `${summary.topModules[0].module} (${summary.topModules[0].count})`
                  : '-',
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
        searchPlaceholder="Cari ID Entity..."
        // Filters
        filterValues={{ module: moduleFilter, action: actionFilter }}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        filters={[
          {
            key: 'module',
            label: 'Module',
            options: AVAILABLE_MODULES.map((module) => ({
              value: module,
              label: module.charAt(0).toUpperCase() + module.slice(1),
            })),
            width: 'w-[150px]',
          },
          {
            key: 'action',
            label: 'Aksi',
            options: AVAILABLE_ACTIONS.map((action) => ({
              value: action,
              label: action.charAt(0).toUpperCase() + action.slice(1),
            })),
            width: 'w-[150px]',
          },
        ]}
        // Date Range
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
        // Reset
        onReset={() => router.push(pathname)}
        // Extra Actions
        headerAction={
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Log
          </Button>
        }
        onRefresh={refetch}
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
