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
import { User } from '@bizflow/types';

import { usersService } from '@/services/users.service';
import { DataTable } from '../ui/data-table';
import { getColumns } from './columns';

interface UsersTableProps {
  data: User[];
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: OnChangeFn<Record<string, boolean>>;
  onRefresh: () => void;
}

export function UsersTable({
  data,
  onDelete,
  isDeleting = false,
  sortBy,
  sortOrder,
  onSortChange,
  columnVisibility,
  onColumnVisibilityChange,
  onRefresh,
}: UsersTableProps) {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: setUserToDelete,
        onResetPassword: setUserToReset,
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
      await usersService.bulkDelete(ids);
      toast.success(`${ids.length} user berhasil dinonaktifkan`);
      setRowSelection({});
      setShowBulkDeleteDialog(false);
      onRefresh();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menonaktifkan user',
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!userToReset) return;
    try {
      setIsResetting(true);
      // Generate random password
      const newPassword = Math.random().toString(36).slice(-8) + '1A';

      await usersService.resetPassword(userToReset.id, {
        newPassword,
      });

      // Show new password in success toast or separate dialog
      // For security, ideally we show it in a dialog/modal one time
      // But for simplicity in this step, let's use a persistent toast or we need a dialog
      // Actually, better to just show it in a toast for now as per requirements

      // Let's use a nice toast that stays
      toast.success(
        <div className="flex flex-col gap-1">
          <span>Password berhasil direset</span>
          <span className="font-mono bg-muted p-1 rounded select-all">
            {newPassword}
          </span>
          <span className="text-xs text-muted-foreground">
            Salin password ini sekarang.
          </span>
        </div>,
        { duration: 10000 },
      );

      setUserToReset(null);
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal reset password',
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-4">
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-muted px-4 py-2">
          <span className="text-sm font-medium">
            {selectedCount} user dipilih
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
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nonaktifkan User?</AlertDialogTitle>
            <AlertDialogDescription>
              User{' '}
              <span className="font-medium text-foreground">
                {userToDelete?.username}
              </span>{' '}
              akan dinonaktifkan dan tidak dapat login kembali. Data user tetap
              tersimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={(e) => {
                e.preventDefault();
                if (userToDelete) {
                  onDelete(userToDelete.id);
                  setUserToDelete(null);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Memproses...' : 'Nonaktifkan'}
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
            <AlertDialogTitle>
              Nonaktifkan {selectedCount} User?
            </AlertDialogTitle>
            <AlertDialogDescription>
              User yang dipilih akan dinonaktifkan dan tidak dapat login
              kembali. Akun anda sendiri atau admin terakhir tidak akan
              dinonaktifkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
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

      {/* Reset Password Dialog */}
      <AlertDialog
        open={!!userToReset}
        onOpenChange={(open) => !open && setUserToReset(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password?</AlertDialogTitle>
            <AlertDialogDescription>
              Password untuk user{' '}
              <span className="font-medium text-foreground">
                {userToReset?.username}
              </span>{' '}
              akan direset menjadi password acak baru.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleResetPassword();
              }}
              disabled={isResetting}
            >
              {isResetting ? 'Memproses...' : 'Reset Password'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
