'use client';

import { useState, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@bizflow/ui';
import { Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  ColumnDef,
  SortingState,
  RowSelectionState,
  OnChangeFn,
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { DataListToolbar, FilterConfig } from './data-list-toolbar';
import { DataListPagination, SummaryItemConfig } from './data-list-pagination';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { ErrorState } from '@/components/common/error-state';

export interface DataListPageProps<TData> {
  title: string;
  description: string;

  // Table Data
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isLoading: boolean;
  getRowId?: (row: TData) => string;

  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (field: string) => void;

  // Filtering & Search
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onReset?: () => void;

  // Date Range (Optional)
  showDateRange?: boolean;
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange?: (startDate?: Date, endDate?: Date) => void;

  // Pagination
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  summary?: Record<string, any>; // Generic Summary Data
  summaryConfig?: SummaryItemConfig[]; // Custom config for summary display

  // Actions
  createLink?: string;
  createLabel?: string;
  onDelete?: (id: string) => void; // Single delete callback (if handling via row action)
  isDeleting?: boolean;
  onBulkDelete?: (ids: string[]) => void;
  isBulkDeleting?: boolean;
  onRefresh?: () => void;
  isError?: boolean;
  onRetry?: () => void;
  extraActions?: ReactNode;

  headerAction?: ReactNode; // Extra actions in the page header (e.g. Sync button)

  // Custom Rendering (Optional)
  renderCustomView?: (props: any) => ReactNode;

  children?: ReactNode;
}

export function DataListPage<
  TData extends { id: string; isActive?: boolean; name?: string },
>({
  title,
  description,
  data,
  columns,
  isLoading,
  getRowId = (row) => row.id,
  sortBy,
  sortOrder,
  onSortChange,
  search,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  filterValues,
  onFilterChange,
  onReset,
  showDateRange,
  startDate,
  endDate,
  onDateRangeChange,
  page,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
  summary,
  summaryConfig,
  createLink,
  createLabel,
  onDelete,
  isDeleting,
  onBulkDelete,
  isBulkDeleting,
  onRefresh,
  isError,
  onRetry,
  extraActions,
  headerAction,
  renderCustomView,
  children,
}: DataListPageProps<TData>) {
  // Local State for interactive table features
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Sorting Logic
  const sorting: SortingState = sortBy
    ? [{ id: sortBy, desc: sortOrder === 'desc' }]
    : [];
  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    if (!onSortChange) return;
    const newSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue;
    const firstSort = newSorting[0];
    if (firstSort) {
      onSortChange(firstSort.id);
    }
  };

  // Bulk Delete Wrapper
  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(Object.keys(rowSelection));
      setShowBulkDeleteDialog(false);
      setRowSelection({});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {headerAction}
          {createLink && (
            <Button asChild>
              <Link href={createLink}>
                <Plus className="mr-2 h-4 w-4" />
                {createLabel || 'Tambah Baru'}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {children}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Daftar {title}</CardTitle>
          {/* <CardDescription>Manajemen data {title}</CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-6">
          <DataListToolbar
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPlaceholder}
            filters={filters}
            filterValues={filterValues}
            onFilterChange={onFilterChange}
            showDateRange={showDateRange}
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={onDateRangeChange}
            onReset={onReset}
            columns={columns
              .filter(
                (c) =>
                  c.id !== 'select' &&
                  c.id !== 'actions' &&
                  (c.enableHiding !== false || c.enableHiding === undefined),
              )
              .map((c) => {
                // Try to get a meaningful label
                let label = c.id;

                if ((c.meta as any)?.title) {
                  label = (c.meta as any).title;
                } else if (typeof c.header === 'string') {
                  label = c.header;
                } else if ('accessorKey' in c) {
                  label = String(c.accessorKey);
                }

                return {
                  id: c.id || (c as any).accessorKey,
                  label: label || 'Column',
                };
              })}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            extraActions={
              <>
                {extraActions}
                {Object.keys(rowSelection).length > 0 && onBulkDelete ? (
                  <div className="flex items-center gap-2 rounded-md bg-muted px-4 py-2">
                    <span className="text-sm font-medium">
                      {Object.keys(rowSelection).length} dipilih
                    </span>
                    <button
                      onClick={() => setShowBulkDeleteDialog(true)}
                      className="text-destructive hover:text-destructive/80 text-sm font-medium flex items-center"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </button>
                  </div>
                ) : null}
              </>
            }
          />

          {isError ? (
            <ErrorState
              title={`Gagal memuat data ${title.toLowerCase()}`}
              onRetry={onRetry || onRefresh}
            />
          ) : renderCustomView ? (
            renderCustomView({
              data,
              isLoading,
              columns,
              sorting,
              columnVisibility,
              rowSelection,
              setRowSelection,
            })
          ) : (
            <>
              <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                sorting={sorting}
                onSortingChange={handleSortingChange}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                enableRowSelection={!!onBulkDelete}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                getRowId={getRowId}
              />

              <DataListPagination
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                summary={summary}
                summaryConfig={summaryConfig}
              />
            </>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={(open) => !open && setShowBulkDeleteDialog(false)}
        title={`Hapus ${Object.keys(rowSelection).length} item?`}
        description={
          <>
            <p>
              Tindakan ini tidak dapat dibatalkan. Data yang dipilih akan
              dihapus permanen atau dinonaktifkan.
            </p>
            <p className="mt-2 text-sm text-yellow-600">
              Peringatan: Data yang sedang digunakan atau memiliki riwayat
              aktivitas mungkin tidak dapat dihapus.
            </p>
          </>
        }
        onConfirm={handleBulkDelete}
        isDeleting={isBulkDeleting}
      />
    </div>
  );
}
