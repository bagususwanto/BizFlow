'use client';

import {
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
import { useState, useMemo } from 'react';
import {
  SortingState,
  OnChangeFn,
  RowSelectionState,
} from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { categoriesService } from '@/services/categories.service';
import { DataTable } from '../../ui/data-table';
import { getColumns } from './columns';
import type { CategoryWithRelations } from '@bizflow/types';

interface CategoriesTableProps {
  data: CategoryWithRelations[];
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: OnChangeFn<Record<string, boolean>>;
  onRefresh: () => void;
}

export function CategoriesTable({
  data,
  onDelete,
  isDeleting = false,
  sortBy,
  sortOrder,
  onSortChange,
  columnVisibility,
  onColumnVisibilityChange,
  onRefresh,
}: CategoriesTableProps) {
  const [categoryToDelete, setCategoryToDelete] =
    useState<CategoryWithRelations | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: setCategoryToDelete,
      }),
    [],
  );

  const sorting: SortingState = useMemo(
    () => [{ id: sortBy, desc: sortOrder === 'desc' }],
    [sortBy, sortOrder],
  );

  const selectedCount = Object.keys(rowSelection).length;

  const handleBulkDelete = async () => {
    try {
      setIsBulkDeleting(true);
      const ids = Object.keys(rowSelection);
      const response = await categoriesService.bulkDelete(ids);
      const message =
        (response as any).data?.message ||
        `${ids.length} kategori berhasil dinonaktifkan`;
      toast.success(message);
      setRowSelection({});
      setShowBulkDeleteDialog(false);
      onRefresh();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menonaktifkan kategori',
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-muted px-4 py-2">
          <span className="text-sm font-medium">
            {selectedCount} kategori dipilih
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="ml-auto h-8"
            onClick={() => setShowBulkDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Nonaktifkan Terpilih
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        sorting={sorting}
        onSortingChange={(updaterOrValue) => {
          const newSorting =
            typeof updaterOrValue === 'function'
              ? updaterOrValue(sorting)
              : updaterOrValue;

          const firstSort = newSorting[0];
          if (firstSort) {
            onSortChange(firstSort.id);
          }
        }}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(row) => row.id}
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {(categoryToDelete?.childrenCount || 0) > 0
                ? 'Gagal Menghapus'
                : (categoryToDelete?.productCount || 0) > 0
                  ? 'Nonaktifkan Kategori?'
                  : 'Hapus Kategori?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(categoryToDelete?.childrenCount || 0) > 0 ? (
                <>
                  Kategori{' '}
                  <span className="font-medium text-foreground">
                    {categoryToDelete?.name}
                  </span>{' '}
                  memiliki {categoryToDelete?.childrenCount} sub-kategori.
                  Silakan hapus sub-kategori terlebih dahulu.
                </>
              ) : (
                <>
                  Kategori{' '}
                  <span className="font-medium text-foreground">
                    {categoryToDelete?.name}
                  </span>{' '}
                  akan{' '}
                  {(categoryToDelete?.productCount || 0) > 0
                    ? 'dinonaktifkan karena memiliki produk terkait.'
                    : 'dihapus secara permanen.'}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {(categoryToDelete?.childrenCount || 0) > 0 ? 'Tutup' : 'Batal'}
            </AlertDialogCancel>
            {(categoryToDelete?.childrenCount || 0) === 0 && (
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/80 "
                onClick={(e) => {
                  e.preventDefault();
                  if (categoryToDelete) {
                    onDelete(categoryToDelete.id);
                    setCategoryToDelete(null);
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting
                  ? 'Memproses...'
                  : (categoryToDelete?.productCount || 0) > 0
                    ? 'Nonaktifkan'
                    : 'Hapus'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={(open) => !open && setShowBulkDeleteDialog(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Nonaktifkan {selectedCount} Kategori?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Kategori yang dipilih akan dinonaktifkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/80 "
              onClick={(e) => {
                e.preventDefault();
                handleBulkDelete();
              }}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? 'Memproses...' : 'Nonaktifkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
