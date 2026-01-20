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
import { UnitOfMeasure } from '@bizflow/types';

import { unitsService } from '@/services/units.service';
import { DataTable } from '@/components/ui/data-table';
import { getColumns } from './columns';

interface UnitsTableProps {
  data: UnitOfMeasure[];
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: OnChangeFn<Record<string, boolean>>;
  onRefresh: () => void;
}

export function UnitsTable({
  data,
  onDelete,
  isDeleting = false,
  sortBy,
  sortOrder,
  onSortChange,
  columnVisibility,
  onColumnVisibilityChange,
  onRefresh,
}: UnitsTableProps) {
  const [unitToDelete, setUnitToDelete] = useState<UnitOfMeasure | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: setUnitToDelete,
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
      await unitsService.bulkDelete(ids);
      toast.success(`${ids.length} satuan berhasil dihapus`);
      setRowSelection({});
      setShowBulkDeleteDialog(false);
      onRefresh();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menghapus satuan',
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
            {selectedCount} item dipilih
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="ml-auto h-8"
            onClick={() => setShowBulkDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Terpilih
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
        open={!!unitToDelete}
        onOpenChange={(open) => !open && setUnitToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Satuan?</AlertDialogTitle>
            <AlertDialogDescription>
              Satuan{' '}
              <span className="font-medium text-foreground">
                {unitToDelete?.name}
              </span>{' '}
              akan dihapus secara permanen. Pastikan satuan ini tidak digunakan
              oleh produk manapun.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/80 "
              onClick={(e) => {
                e.preventDefault();
                if (unitToDelete) {
                  onDelete(unitToDelete.id);
                  setUnitToDelete(null);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Memproses...' : 'Hapus'}
            </AlertDialogAction>
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
            <AlertDialogTitle>Hapus {selectedCount} Satuan?</AlertDialogTitle>
            <AlertDialogDescription>
              Satuan yang dipilih akan dihapus secara permanen. Pastikan satuan
              ini tidak digunakan oleh produk manapun.
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
              {isBulkDeleting ? 'Memproses...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
