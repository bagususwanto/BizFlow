'use client';

import { Suspense, useState, ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@bizflow/ui';
import {
  Loader2,
  Trash2,
  Box,
  CheckCircle2,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import {
  ColumnDef,
  SortingState,
  RowSelectionState,
  OnChangeFn,
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table'; // Verify path
import { LoadingState } from '@/components/common/loading-state';
import { MasterDataToolbar, FilterConfig } from './master-data-toolbar';
import {
  MasterDataPagination,
  PaginationSummary,
} from './master-data-pagination';
import { DeleteConfirmDialog } from '../shared/delete-confirm-dialog';

interface MasterDataPageProps<TData> {
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

  // Custom Rendering (Optional)
  renderCustomView?: (props: any) => ReactNode;
}

export function MasterDataPage<
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
  renderCustomView,
}: MasterDataPageProps<TData>) {
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
        {createLink && (
          <Button asChild>
            <Link href={createLink}>
              <Plus className="mr-2 h-4 w-4" />
              {createLabel || 'Tambah Baru'}
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Daftar {title}</CardTitle>
          {/* <CardDescription>Manajemen data {title}</CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-6">
          <MasterDataToolbar
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPlaceholder}
            filters={filters}
            filterValues={filterValues}
            onFilterChange={onFilterChange}
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
            // createLink/createLabel removed from here as we moved it up
            extraActions={
              Object.keys(rowSelection).length > 0 && onBulkDelete ? (
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
              ) : null
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

              <MasterDataPagination
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
      <DeleteConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
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
