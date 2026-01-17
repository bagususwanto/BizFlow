'use client';

import { useState } from 'react';
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

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
    });

  if (isError) {
    return (
      <ErrorState title="Gagal memuat audit logs" onRetry={() => refetch()} />
    );
  }

  const totalPages = meta?.totalPages || 1;

  const handleReset = () => {
    setSearch('');
    setModuleFilter('all');
    setActionFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
    setColumnVisibility({
      time: true,
      user: true,
      module: true,
      action: true,
      entity: true,
      ipAddress: true,
    });
  };

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
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            moduleFilter={moduleFilter}
            onModuleFilterChange={(val) => {
              setModuleFilter(val);
              setPage(1);
            }}
            actionFilter={actionFilter}
            onActionFilterChange={(val) => {
              setActionFilter(val);
              setPage(1);
            }}
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
              setPage(1);
            }}
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
              />

              <AuditLogsPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                summary={summary}
                pageSize={pageSize}
                onPageSizeChange={(val) => {
                  setPageSize(val);
                  setPage(1);
                }}
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
