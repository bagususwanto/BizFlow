'use client';

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
import {
  Box,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  LucideIcon,
} from 'lucide-react';
import React from 'react';
import { useTranslations } from 'next-intl';

export interface SummaryItemConfig {
  key: string;
  label?: string;
  icon?: LucideIcon;
  className?: string;
  value?: string | number; // Direct value override
}

export interface DataListPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;

  // Summary Data
  summary?: Record<string, any>;

  // Custom configuration for summary items to display
  // If not provided, it will try to display 'total', 'active', 'inactive', 'service' by default if they exist in summary
  summaryConfig?: SummaryItemConfig[];
}

export function DataListPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
  pageSize,
  onPageSizeChange,
  summary,
  summaryConfig,
}: DataListPaginationProps) {
  const tDataList = useTranslations('dataList');

  // Helper to render a summary item
  const renderSummaryItem = (
    key: string,
    value: any,
    label: string,
    Icon?: LucideIcon,
    className?: string,
  ) => {
    if (value === undefined || value === null) return null;

    return (
      <div key={key} className="flex items-center gap-2">
        {Icon && <Icon className={`h-4 w-4 ${className || ''}`} />}
        <span>
          {label}: <span className="font-medium text-foreground">{value}</span>
        </span>
        <Separator orientation="vertical" className="h-4 mx-2 last:hidden" />
      </div>
    );
  };

  const defaultSummaryItems = [
    { key: 'total', label: tDataList('total'), icon: Box, className: '' },
    {
      key: 'active',
      label: tDataList('active'),
      icon: CheckCircle2,
      className: 'text-success',
    },
    {
      key: 'inactive',
      label: tDataList('inactive'),
      icon: XCircle,
      className: 'text-destructive',
    },
    {
      key: 'service',
      label: tDataList('service'),
      icon: LayoutGrid,
      className: 'text-purple-500',
    },
  ];

  return (
    <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
      {/* Summary Section - Bottom Left */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {summary && (
          <>
            {/* If specific config is provided, use it. Otherwise try default common keys + dynamic remaining */}
            {summaryConfig ? (
              summaryConfig.map((item) => {
                const value = item.value ?? summary[item.key];
                return renderSummaryItem(
                  item.key,
                  value,
                  item.label || item.key,
                  item.icon,
                  item.className,
                );
              })
            ) : (
              <>
                {/* Default handling for common keys if they exist in summary object */}
                {/* Total is special, it might fallback to totalItems */}
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  <span>
                    {tDataList('total')}:{' '}
                    <span className="font-medium text-foreground">
                      {summary.total ?? totalItems}
                    </span>
                  </span>
                  <Separator orientation="vertical" className="h-4 mx-2" />
                </div>

                {defaultSummaryItems
                  .filter((i) => i.key !== 'total')
                  .map((item) =>
                    renderSummaryItem(
                      item.key,
                      summary[item.key],
                      item.label,
                      item.icon,
                      item.className,
                    ),
                  )}

                {/* Render other keys that are not in default list */}
                {Object.entries(summary)
                  .filter(
                    ([key]) =>
                      !['total', 'active', 'inactive', 'service'].includes(
                        key,
                      ) &&
                      !key.startsWith('total') &&
                      typeof summary[key] === 'number',
                  )
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:{' '}
                        <span className="font-medium text-foreground">
                          {value as React.ReactNode}
                        </span>
                      </span>
                      <Separator
                        orientation="vertical"
                        className="h-4 mx-2 last:hidden"
                      />
                    </div>
                  ))}
              </>
            )}

            {/* Fallback if summary prop provided but empty/undefined handled by checks above */}
          </>
        )}

        {!summary && (
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            <span>
              {tDataList('total')}:{' '}
              <span className="font-medium text-foreground">{totalItems}</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground hidden sm:block">
            {tDataList('rowsPerPage')}
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
              >
                {tDataList('previousPage')}
              </PaginationPrevious>
            </PaginationItem>
            <PaginationItem>
              <span className="flex h-9 items-center justify-center px-4 text-sm">
                {tDataList('pageInfo', { page, totalPages })}
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
              >
                {tDataList('nextPage')}
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
