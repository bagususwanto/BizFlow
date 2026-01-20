'use client';

import { Scale, Box, Copy } from 'lucide-react';

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

interface UnitsPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  summary?: {
    totalUnits: number;
    baseUnits: number;
    derivedUnits: number;
  };
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

export function UnitsPagination({
  page,
  totalPages,
  onPageChange,
  summary,
  pageSize,
  onPageSizeChange,
}: UnitsPaginationProps) {
  return (
    <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
      {/* Summary Section - Bottom Left */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {summary && (
          <>
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              <span>
                Total:{' '}
                <span className="font-medium text-foreground">
                  {summary.totalUnits}
                </span>
              </span>
            </div>
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
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-orange-500" />
              <span>
                Turunan:{' '}
                <span className="font-medium text-foreground">
                  {summary.derivedUnits}
                </span>
              </span>
            </div>
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
            {/* Basic Only Page Count for now */}
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
