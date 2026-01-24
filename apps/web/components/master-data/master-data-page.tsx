'use client';

import { Suspense, useState, ReactNode } from 'react';
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
} from '@bizflow/ui';
import { Loader2, Trash2, Box, CheckCircle2, LayoutGrid } from 'lucide-react';
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

  // Enhance columns with actions if needed (can also be passed in `columns` prop)
  // But usually Delete action is common.
  // For now, we assume `columns` passed in has the actions, OR we rely on `onDelete` to be passed to the columns definition generator.

  // NOTE: For the generic Delete Dialog to work for single items, the Toolbar/Table needs to know about `setItemToDelete`.
  // Since columns are passed in, the `Action` column needs access to `setItemToDelete`.
  // We can't easily inject it into `columns` prop here.
  // PROVIDER PATTERN or passing `setItemToDelete` to the `columns` factory function in the PARENT is better.
  // So the PARENT `page.tsx` will define columns using `(item) => setRowSelection(item)`.

  // Wait, `setItemToDelete` is local state here.
  // OPTION 1: Lift state up to parent? No, we want to hide it.
  // OPTION 2: Expose a helper or context? Overkill.
  // OPTION 3: The parent defines columns, but we don't control the "Delete" button click inside the table cell.

  // Actually, standardizing the Delete Dialog is tricky if the button is inside `columns`.
  // Let's stick to: The Parent handles the "Delete Confirmation" too?
  // NO, the goal is to minimalize.

  // HACK: We can expose `setInternalItemToDelete` via a ref or callback? No.
  // BETTER: `MasterDataPage` exposes a `useMasterData()` hook? No.

  // Let's assume for now the Parent handles the "Delete Item State" if it wants custom columns.
  // OR, we make `columns` a function that receives `{ onDelete: (item) => void }`.

  // COMPROMISE: We will NOT handle the Single Delete Dialog state here for now,
  // UNLESS we want to force a specific "Actions" column.
  // Let's let the parent handle the Single Item Delete Dialog for maximum flexibility in the Actions column,
  // BUT we will handle the BULK DELETE dialog here because that's on the Toolbar.

  // WAIT, the prompt said "minimalist".
  // If I want to clean up the parent, I should probably handle the dialogs here.
  // Let's accept a `renderActions` prop? No.

  // Let's stick to the plan: `MasterDataPage` handles the layout, toolbar, and BULK operations.
  // Single item actions (Edit/Delete) are usually specific (e.g. specialized logic).
  // However, I can provide a `ConfirmationDialog` component helper or similar.

  // Let's assume for this step, I will handle Bulk Delete here.
  // For Single Delete, I will leave it to the parent to pass an `onDelete` which triggers the actual mutation,
  // but the *Confirmation Dialog* state might need to be in the parent to trigger it from the table row.

  // ... Unless I pass `onDeleteItemClick` to the `columns` factory in the parent.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {createLink && (
          <div className="md:hidden">
            {/* Mobile Create Button if needed, or just rely on Toolbar */}
          </div>
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
            columns={columns.map((c) => ({
              id: c.id as string,
              label: String(c.header),
            }))} // Simplified
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            createLink={createLink}
            createLabel={createLabel}
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
