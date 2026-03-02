'use client';

import { Button } from '@bizflow/ui';
import { useState, useMemo } from 'react';
import {
  SortingState,
  OnChangeFn,
  RowSelectionState,
} from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { outletsService } from '@/services/outlets.service';
import { DataTable } from '../../ui/data-table';
import { getColumns } from './columns';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import type { Outlet } from '@/services/outlets.service';

interface OutletsTableProps {
  data: Outlet[];
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: OnChangeFn<Record<string, boolean>>;
  onRefresh: () => void;
}

export function OutletsTable({
  data,
  onDelete,
  isDeleting = false,
  sortBy,
  sortOrder,
  onSortChange,
  columnVisibility,
  onColumnVisibilityChange,
  onRefresh,
}: OutletsTableProps) {
  const [outletToDelete, setOutletToDelete] = useState<Outlet | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const t = useTranslations('outlets');

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: setOutletToDelete,
        t,
      }),
    [t],
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
      await outletsService.bulkDelete(ids);
      toast.success(`${ids.length} outlet berhasil dinonaktifkan`);
      setRowSelection({});
      setShowBulkDeleteDialog(false);
      onRefresh();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menonaktifkan outlet',
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
            {selectedCount} outlet dipilih
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

      <DeleteConfirmDialog
        open={!!outletToDelete}
        onOpenChange={(open) => !open && setOutletToDelete(null)}
        title={
          (outletToDelete?.transactionCount || 0) > 0
            ? 'Nonaktifkan Outlet?'
            : 'Hapus Outlet?'
        }
        description={
          (outletToDelete?.transactionCount || 0) > 0 ? (
            <>
              Outlet{' '}
              <span className="font-medium text-foreground">
                {outletToDelete?.name}
              </span>{' '}
              akan dinonaktifkan karena memiliki riwayat transaksi. Data outlet
              tetap tersimpan.
            </>
          ) : (
            <>
              Outlet{' '}
              <span className="font-medium text-foreground">
                {outletToDelete?.name}
              </span>{' '}
              akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </>
          )
        }
        onConfirm={() => {
          if (outletToDelete) {
            onDelete(outletToDelete.id);
            setOutletToDelete(null);
          }
        }}
        isDeleting={isDeleting}
        confirmLabel={
          (outletToDelete?.transactionCount || 0) > 0 ? 'Nonaktifkan' : 'Hapus'
        }
      />

      {/* Bulk Delete Dialog */}
      <DeleteConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        title={`Nonaktifkan ${selectedCount} Outlet?`}
        description="Outlet yang dipilih akan dinonaktifkan."
        onConfirm={handleBulkDelete}
        isDeleting={isBulkDeleting}
        confirmLabel="Nonaktifkan"
      />
    </div>
  );
}
