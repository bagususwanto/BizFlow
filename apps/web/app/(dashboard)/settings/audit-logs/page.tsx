'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@bizflow/ui';
import { AuditLogDetailSheet } from '@/components/audit-logs/audit-log-detail-sheet';
import { ErrorState } from '@/components/common/error-state';
import { useAuditLogs, useDebounce } from '@/hooks';
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
  const [isExporting, setIsExporting] = useState(false);

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
      toast.info('Mengekspor data audit log...');

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
            label: 'Waktu',
            format: formatDateForExport,
            width: 20,
          },
          { key: 'user.name', label: 'Pengguna', width: 20 },
          { key: 'user.username', label: 'Username', width: 15 },
          { key: 'module', label: 'Modul', width: 15 },
          { key: 'action', label: 'Aksi', width: 12 },
          { key: 'entityType', label: 'Tipe Entitas', width: 15 },
          { key: 'entityId', label: 'ID Entitas', width: 30 },
          { key: 'ipAddress', label: 'Alamat IP', width: 15 },
          { key: 'userAgent', label: 'User Agent', width: 40 },
        ],
        generateFilename('audit-logs'),
        'Audit Logs',
      );
      toast.success(`Berhasil mengekspor ${logs.length} audit log`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengekspor audit log');
    } finally {
      setIsExporting(false);
    }
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
      <DataListPage
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
        summaryConfig={[{ key: 'total', label: 'Total Log', icon: Box }]}
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
            {isExporting ? 'Mengekspor...' : 'Export Excel'}
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
