'use client';

import { Suspense, useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { AuditLogsTable } from '@/components/audit-logs/audit-logs-table';
import { AuditLogsToolbar } from '@/components/audit-logs/audit-logs-toolbar';
import { AuditLogsPagination } from '@/components/audit-logs/audit-logs-pagination';
import { AuditLogDetailSheet } from '@/components/audit-logs/audit-log-detail-sheet';
import { ErrorState } from '@/components/common/error-state';
import { LoadingState } from '@/components/common/loading-state';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import { useDebounce } from '@/hooks/use-debounce';
import { AuditLog } from '@/services/audit-logs.service';
import { Download } from 'lucide-react';

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
      | 'user.name') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const startDate = startDateStr ? new Date(startDateStr) : undefined;
  const endDate = endDateStr ? new Date(endDateStr) : undefined;

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Local state for column visibility
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({
    time: true,
    user: true,
    module: true,
    action: true,
    entity: true,
    ipAddress: true,
  });

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

  const handleSearchChange = (value: string) => {
    updateUrl({ search: value, page: 1 });
  };

  const handleModuleFilterChange = (value: string) => {
    updateUrl({ module: value, page: 1 });
  };

  const handleActionFilterChange = (value: string) => {
    updateUrl({ action: value, page: 1 });
  };

  const handleDateRangeChange = (start?: Date, end?: Date) => {
    updateUrl({
      startDate: start ? start.toISOString() : null,
      endDate: end ? end.toISOString() : null,
      page: 1,
    });
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      updateUrl({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateUrl({ sortBy: field, sortOrder: 'asc' });
    }
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    updateUrl({ pageSize: newSize, page: 1 });
  };

  const handleReset = () => {
    router.push(pathname);
    setColumnVisibility({
      time: true,
      user: true,
      module: true,
      action: true,
      entity: true,
      ipAddress: true,
    });
  };

  if (isError) {
    return (
      <ErrorState title="Gagal memuat audit logs" onRetry={() => refetch()} />
    );
  }

  const totalPages = meta?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">
            Monitor dan pelacakan aktivitas pengguna dalam sistem.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Log
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Aktivitas</CardTitle>
          <CardDescription>
            Menampilkan daftar lengkap aktivitas yang tercatat oleh sistem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AuditLogsToolbar
            search={search}
            onSearchChange={handleSearchChange}
            moduleFilter={moduleFilter}
            onModuleFilterChange={handleModuleFilterChange}
            actionFilter={actionFilter}
            onActionFilterChange={handleActionFilterChange}
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
            onReset={handleReset}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
          />

          {isLoading ? (
            <div className="flex justify-center p-8">
              <LoadingState />
            </div>
          ) : (
            <>
              <AuditLogsTable
                data={auditLogs || []}
                onViewDetail={(log) => {
                  setSelectedLog(log);
                  setIsDetailOpen(true);
                }}
                columnVisibility={columnVisibility}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
              />

              <AuditLogsPagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                summary={summary}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      <AuditLogDetailSheet
        log={selectedLog}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuditLogsContent />
    </Suspense>
  );
}
