'use client';

import { FileText, Users, Activity, BarChart } from 'lucide-react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bizflow/ui';
import type { AuditLogSummary } from '@/services/audit-logs.service';

interface AuditLogsPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  summary?: AuditLogSummary;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

export function AuditLogsPagination({
  page,
  totalPages,
  onPageChange,
  summary,
  pageSize,
  onPageSizeChange,
}: AuditLogsPaginationProps) {
  return (
    <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
      {/* Summary Section - Bottom Left */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {summary && (
          <>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>
                Total Log:{' '}
                <span className="font-medium text-foreground">
                  {summary.totalLogs}
                </span>
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span>
                Hari Ini:{' '}
                <span className="font-medium text-foreground">
                  {summary.logsToday}
                </span>
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span>
                Pengguna Aktif:{' '}
                <span className="font-medium text-foreground">
                  {summary.uniqueUsers}
                </span>
              </span>
            </div>
            {summary.topModules.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-orange-500" />
                  <span>
                    Modul Teratas:{' '}
                    <span className="font-medium text-foreground capitalize">
                      {summary.topModules[0]?.module} (
                      {summary.topModules[0]?.count})
                    </span>
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground hidden sm:block">
            Baris per halaman
          </p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
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

        {/* Pagination - Bottom Right */}
        <Pagination className="justify-end w-auto mx-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) onPageChange(page - 1);
                }}
                className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            <PaginationItem>
              <span className="flex h-9 items-center justify-center px-4 text-sm">
                Halaman {page} dari {totalPages}
              </span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) onPageChange(page + 1);
                }}
                className={
                  page >= totalPages ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
