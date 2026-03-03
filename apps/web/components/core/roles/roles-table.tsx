import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  SortingState,
  OnChangeFn,
  RowSelectionState,
} from '@tanstack/react-table';
import { Button } from '@bizflow/ui';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Role, rolesService } from '@/services/roles.service';
import { DeleteConfirmDialog } from '../../shared/delete-confirm-dialog';
import { DataTable } from '../../ui/data-table';
import { getColumns } from './columns';

interface RolesTableProps {
  data: Role[];
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: OnChangeFn<Record<string, boolean>>;
  onRefresh: () => void;
}

export function RolesTable({
  data,
  onDelete,
  isDeleting = false,
  sortBy,
  sortOrder,
  onSortChange,
  columnVisibility,
  onColumnVisibilityChange,
  onRefresh,
}: RolesTableProps) {
  const t = useTranslations('roles');
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const columns = useMemo(
    () => getColumns({ onDelete: setRoleToDelete, t }),
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
      await rolesService.bulkDelete(ids);
      toast.success(`${ids.length} role berhasil dihapus`);
      setRowSelection({});
      setShowBulkDeleteDialog(false);
      onRefresh();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menghapus role',
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
            {selectedCount} role dipilih
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

      {/* Single Delete Dialog */}
      <DeleteConfirmDialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
        title={
          (roleToDelete?.userCount || 0) > 0 ? 'Gagal Menghapus' : 'Hapus Role?'
        }
        description={
          (roleToDelete?.userCount || 0) > 0 ? (
            <>
              Role{' '}
              <span className="font-medium text-foreground">
                {roleToDelete?.name}
              </span>{' '}
              sedang digunakan oleh {roleToDelete?.userCount} user. Silakan
              ganti role user terlebih dahulu.
            </>
          ) : (
            <>
              Role{' '}
              <span className="font-medium text-foreground">
                {roleToDelete?.name}
              </span>{' '}
              akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </>
          )
        }
        onConfirm={() => {
          if (roleToDelete && (roleToDelete.userCount || 0) === 0) {
            onDelete(roleToDelete.id);
            setRoleToDelete(null);
          } else {
            setRoleToDelete(null);
          }
        }}
        isDeleting={isDeleting}
        confirmLabel={(roleToDelete?.userCount || 0) > 0 ? 'Tutup' : 'Hapus'}
        variant={(roleToDelete?.userCount || 0) > 0 ? 'default' : 'destructive'}
        cancelLabel={(roleToDelete?.userCount || 0) > 0 ? undefined : 'Batal'}
      />

      {/* Bulk Delete Dialog */}
      <DeleteConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        title={`Hapus ${selectedCount} role?`}
        description="Tindakan ini tidak dapat dibatalkan. Role yang dipilih akan dihapus secara permanen. Role sistem atau role dengan pengguna aktif tidak akan dihapus."
        onConfirm={handleBulkDelete}
        isDeleting={isBulkDeleting}
      />
    </div>
  );
}
