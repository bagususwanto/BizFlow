'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import { toast } from 'sonner';

import { getColumns } from '@/components/core/roles/columns';
import { ErrorState } from '@/components/common/error-state';
import { useRoles, useDebounce } from '@/hooks';
import { Role, rolesService } from '@/services/roles.service';
import { SettingsPage } from '@/components/settings/settings-page';

function RolesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const isSystemRole = searchParams.get('isSystemRole') || 'all';
  const sortBy = searchParams.get('sortBy') || 'name';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';

  const debouncedSearch = useDebounce(search, 500);

  const {
    roles,
    meta,
    summary,
    isLoading,
    isError,
    deleteRole,
    isDeleting,
    refetch,
  } = useRoles({
    page,
    pageSize,
    search: debouncedSearch,
    isSystemRole: isSystemRole === 'all' ? undefined : isSystemRole === 'true',
    sortBy,
    sortOrder,
  });

  // Local state
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === '' || value === 'all') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams],
  );

  const updateUrl = (params: Record<string, string | number | null>) => {
    const queryString = createQueryString(params);
    router.push(`${pathname}?${queryString}`);
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      setIsBulkDeleting(true);
      await rolesService.bulkDelete(ids);
      toast.success(`${ids.length} role berhasil dihapus`);
      refetch();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menghapus role',
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns = useMemo(() => getColumns({ onDelete: setRoleToDelete }), []);

  if (isError) {
    return (
      <ErrorState title="Gagal memuat data peran" onRetry={() => refetch()} />
    );
  }

  const totalPages = meta?.totalPages || 1;
  const totalItems = meta?.totalItems || 0;

  return (
    <>
      <SettingsPage
        title="Peran & Akses"
        description="Kelola hak akses pengguna aplikasi sesuai perannya."
        createLink="/settings/roles/create"
        createLabel="Tambah Peran"
        data={roles || []}
        columns={columns}
        isLoading={isLoading}
        // Pagination
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={(p) => updateUrl({ page: p })}
        onPageSizeChange={(s) => updateUrl({ pageSize: s, page: 1 })}
        summary={
          summary
            ? {
                total: summary.totalRoles,
                systemRoles: summary.systemRoles,
                customRoles: summary.customRoles,
                totalUsersAssigned: summary.totalUsersAssigned,
              }
            : undefined
        }
        // Sorting
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(field) => {
          if (sortBy === field) {
            updateUrl({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
          } else {
            updateUrl({ sortBy: field, sortOrder: 'asc' });
          }
        }}
        // Search
        search={search} // Note: search here is the immediate value, but useRoles uses debounced.
        // If we want immediate feedback in input, we use 'search'.
        onSearchChange={(v) => updateUrl({ search: v, page: 1 })}
        searchPlaceholder="Cari peran..."
        // Filters
        filterValues={{ isSystemRole }}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        onReset={() => router.push(pathname)}
        filters={[
          {
            key: 'isSystemRole',
            label: 'Tipe Role',
            options: [
              { label: 'System', value: 'true' },
              { label: 'Custom', value: 'false' },
            ],
            width: 'w-[220px]',
          },
        ]}
        // Actions
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        onRefresh={refetch}
        onDelete={(id) => {
          const role = roles?.find((r) => r.id === id);
          if (role) setRoleToDelete(role);
        }}
      />

      {/* Single Delete Dialog */}
      <AlertDialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {(roleToDelete?.userCount || 0) > 0
                ? 'Gagal Menghapus'
                : 'Hapus Role?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(roleToDelete?.userCount || 0) > 0 ? (
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
                  akan dihapus secara permanen. Tindakan ini tidak dapat
                  dibatalkan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {(roleToDelete?.userCount || 0) > 0 ? 'Tutup' : 'Batal'}
            </AlertDialogCancel>
            {(roleToDelete?.userCount || 0) === 0 && (
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/80 "
                onClick={(e) => {
                  e.preventDefault();
                  if (roleToDelete) {
                    deleteRole(roleToDelete.id, {
                      onSuccess: () => setRoleToDelete(null),
                    });
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function RolesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <RolesContent />
    </Suspense>
  );
}
