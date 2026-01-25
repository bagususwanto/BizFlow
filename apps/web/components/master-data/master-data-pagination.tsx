'use client';

import { Box, CheckCircle2, XCircle, LayoutGrid } from 'lucide-react';

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
  baseUnits?: number;
  derivedUnits?: number;
  // Add more generic keys as needed
  [key: string]: number | undefined;
}

interface MasterDataPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  summary?: PaginationSummary;
}

export function MasterDataPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
  pageSize,
  onPageSizeChange,
  summary,
}: MasterDataPaginationProps) {
  return (
    <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
      {/* Summary Section - Bottom Left */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {summary ? (
          <>
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              <span>
                Total:{' '}
                <span className="font-medium text-foreground">
                  {summary.total ?? totalItems}
                </span>
              </span>
            </div>
            {summary.baseUnits !== undefined && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-blue-500" />
                  <span>
                    Base:{' '}
                    <span className="font-medium text-foreground">
                      {summary.baseUnits}
                    </span>
                  </span>
                </div>
              </>
            )}
            {summary.derivedUnits !== undefined && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-orange-500" />
                  <span>
                    Turunan:{' '}
                    <span className="font-medium text-foreground">
                      {summary.derivedUnits}
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
                    Aktif:{' '}
                    <span className="font-medium text-foreground">
                      {summary.active}
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
                    Service:{' '}
                    <span className="font-medium text-foreground">
                      {summary.service}
                    </span>
                  </span>
                </div>
              </>
            )}
          </>
        ) : (
          <span>
            Total:{' '}
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
