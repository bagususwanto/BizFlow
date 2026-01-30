'use client';

import {
  Box,
  CheckCircle2,
  LayoutGrid,
  Shield,
  UserCog,
  Users,
} from 'lucide-react';

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

export interface PaginationSummary {
  total: number;
  active?: number;
  inactive?: number;
  service?: number;
  systemRoles?: number;
  customRoles?: number;
  totalUsersAssigned?: number;
  // Add more generic keys as needed
  [key: string]: string | number | undefined;
}

interface SettingsPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  summary?: PaginationSummary;
  summaryLabels?: {
    total?: string;
    active?: string;
    inactive?: string;
    [key: string]: string | undefined;
  };
}

export function SettingsPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
  pageSize,
  onPageSizeChange,
  summary,
  summaryLabels,
}: SettingsPaginationProps) {
  return (
    <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
      {/* Summary Section - Bottom Left */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {summary ? (
          <>
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              <span>
                {summaryLabels?.total || 'Total:'}{' '}
                <span className="font-medium text-foreground">
                  {summary.total ?? totalItems}
                </span>
              </span>
            </div>
            {summary.systemRoles !== undefined && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>
                    Sistem:{' '}
                    <span className="font-medium text-foreground">
                      {summary.systemRoles}
                    </span>
                  </span>
                </div>
              </>
            )}
            {summary.customRoles !== undefined && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-orange-500" />
                  <span>
                    Kustom:{' '}
                    <span className="font-medium text-foreground">
                      {summary.customRoles}
                    </span>
                  </span>
                </div>
              </>
            )}
            {summary.totalUsersAssigned !== undefined && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span>
                    Pengguna Terkait:{' '}
                    <span className="font-medium text-foreground">
                      {summary.totalUsersAssigned}
                    </span>
                  </span>
                </div>
              </>
            )}
            {summary.active !== undefined && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>
                    {summaryLabels?.active || 'Aktif:'}{' '}
                    <span className="font-medium text-foreground">
                      {summary.active}
                    </span>
                  </span>
                </div>
              </>
            )}
            {summary.inactive !== undefined && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-500" />
                  <span>
                    {summaryLabels?.inactive || 'Non-aktif:'}{' '}
                    <span className="font-medium text-foreground">
                      {summary.inactive}
                    </span>
                  </span>
                </div>
              </>
            )}
            {summary.service !== undefined && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-purple-500" />
                  <span>
                    Jasa:{' '}
                    <span className="font-medium text-foreground">
                      {summary.service}
                    </span>
                  </span>
                </div>
              </>
            )}
            {/* Render other keys dynamically */}
            {Object.entries(summary)
              .filter(
                ([key]) =>
                  ![
                    'total',
                    'total',
                    'active',
                    'inactive',
                    'service',
                    'systemRoles',
                    'customRoles',
                    'totalUsersAssigned',
                  ].includes(key),
              )
              .map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Separator orientation="vertical" className="h-4" />
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:{' '}
                    <span className="font-medium text-foreground">{value}</span>
                  </span>
                </div>
              ))}
          </>
        ) : (
          <span>
            {summaryLabels?.total || 'Total:'}{' '}
            <span className="font-medium text-foreground">{totalItems}</span>
          </span>
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
