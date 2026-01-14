'use client';

import { ShieldCheck, UserCog, Users } from 'lucide-react';

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
import type { RolesSummary } from '@bizflow/types';

interface RolesPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  summary?: RolesSummary;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

export function RolesPagination({
  page,
  totalPages,
  onPageChange,
  summary,
  pageSize,
  onPageSizeChange,
}: RolesPaginationProps) {
  return (
    <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
      {/* Summary Section - Bottom Left */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {summary && (
          <>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                Total:{' '}
                <span className="font-medium text-foreground">
                  {summary.totalRoles}
                </span>
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <span>
                System:{' '}
                <span className="font-medium text-foreground">
                  {summary.systemRoles}
                </span>
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-green-500" />
              <span>
                Custom:{' '}
                <span className="font-medium text-foreground">
                  {summary.customRoles}
                </span>
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-muted-foreground" />
              <span>
                Pengguna Aktif:{' '}
                <span className="font-medium text-foreground">
                  {summary.totalUsersAssigned}
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
