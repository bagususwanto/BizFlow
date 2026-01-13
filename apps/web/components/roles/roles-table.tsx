import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@bizflow/ui';
import { useState, useMemo } from 'react';
import { SortingState } from '@tanstack/react-table';

import type { Role } from '@/services/roles.service';
import { DataTable } from '../ui/data-table';
import { getColumns } from './columns';

interface RolesTableProps {
  data: Role[];
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
}

export function RolesTable({
  data,
  onDelete,
  isDeleting = false,
  sortBy,
  sortOrder,
  onSortChange,
}: RolesTableProps) {
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const columns = useMemo(() => getColumns({ onDelete: setRoleToDelete }), []);

  const sorting: SortingState = useMemo(
    () => [{ id: sortBy, desc: sortOrder === 'desc' }],
    [sortBy, sortOrder],
  );

  return (
    <>
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
            // If the same column is clicked, toggle order is handled by table state,
            // but we need to notify parent.
            // Note: Our parent expects just the field name to toggle, or set.
            // However, Tanstack gives us the final state.
            // We can just pass the ID. The parent 'toggle' logic might interfere if we don't align.
            // Let's look at parent logic:
            // if (sortBy === field) setSortOrder(toggle) else setSortBy(field), setSortOrder('asc')

            // Tanstack `toggleSorting` does: if same -> toggle, if diff -> set new.
            // So `firstSort.id` is the field we want.
            // But valid check: how to communicate 'desc'?
            // The parent `onSortChange` only takes `field`.
            // IF the parent logic handles toggling, we just need to send the field name.
            // BUT, if we click a new header, it sends `desc: false` (asc).
            // If we click existing header (asc), it sends `desc: true` (desc).

            // Wait, the parent `onSortChange` implementation in `page.tsx` is:
            /*
                onSortChange={(field) => {
                  if (sortBy === field) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(field);
                    setSortOrder('asc');
                  }
                }}
             */
            // So simply calling `onSortChange(firstSort.id)` is correct because:
            // 1. If ID refers to current sort, parent toggles.
            // 2. If ID is new, parent sets to New + Asc.
            // This aligns perfectly with TanStack default behavior (click new -> asc, click old -> toggle).

            onSortChange(firstSort.id);
          }
        }}
      />

      <AlertDialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Role{' '}
              <span className="font-medium text-foreground">
                {roleToDelete?.name}
              </span>{' '}
              akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={(e) => {
                e.preventDefault();
                if (roleToDelete) {
                  onDelete(roleToDelete.id);
                  setRoleToDelete(null);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
