'use client';

import { useState, ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from '@bizflow/ui';
import { Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  ColumnDef,
  SortingState,
  RowSelectionState,
  OnChangeFn,
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SettingsToolbar, FilterConfig } from './settings-toolbar';
import { SettingsPagination, PaginationSummary } from './settings-pagination';

interface SettingsPageProps<TData> {
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

  // Date Range
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
  summary?: PaginationSummary; // Generic Summary

  // Actions
  createLink?: string;
  createLabel?: string;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  onBulkDelete?: (ids: string[]) => void;
  isBulkDeleting?: boolean;
  onRefresh?: () => void;
  extraActions?: ReactNode;

  headerAction?: ReactNode;

  // Custom Rendering (Optional)
  renderCustomView?: (props: any) => ReactNode;
}

export function SettingsPage<
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
  createLink,
  createLabel,
  onDelete,
  isDeleting,
  onBulkDelete,
  isBulkDeleting,
  onRefresh,
  extraActions,
  headerAction,
  renderCustomView,
}: SettingsPageProps<TData>) {
  // Local State for interactive table features
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [itemToDelete, setItemToDelete] = useState<TData | null>(null);
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

  // Single Delete Wrapper
  const handleDelete = () => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete.id);
      setItemToDelete(null);
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

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Daftar {title}</CardTitle>
          {/* <CardDescription>Manajemen data {title}</CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-6">
          <SettingsToolbar
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPlaceholder}
            filters={filters}
            filterValues={filterValues}
            onFilterChange={onFilterChange}
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

          {renderCustomView ? (
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

              <SettingsPagination
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                summary={summary}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Bulk Delete Dialog */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={(open) => !open && setShowBulkDeleteDialog(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus {Object.keys(rowSelection).length} item?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data yang dipilih akan
              dihapus permanen atau dinonaktifkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/80"
              onClick={(e) => {
                e.preventDefault();
                handleBulkDelete();
              }}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? 'Memproses...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
