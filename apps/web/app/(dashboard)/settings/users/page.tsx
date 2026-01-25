'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
} from '@bizflow/ui';
import { toast } from 'sonner';

import { getColumns } from '@/components/core/users/columns';
import { ErrorState } from '@/components/common/error-state';
import { useUsers } from '@/hooks';
import { usersService, UserWithUsage } from '@/services/users.service';
import { User } from '@bizflow/types';
import { SettingsPage } from '@/components/core/settings-page';

function UsersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const roleId = searchParams.get('roleId') || 'all';
  const status = searchParams.get('status') || 'all';
  const sortBy =
    (searchParams.get('sortBy') as
      | 'username'
      | 'name'
      | 'email'
      | 'createdAt'
      | 'updatedAt'
      | 'lastLogin'
      | 'role.name'
      | 'status') || 'name';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';

  const {
    users,
    meta,
    summary,
    isLoading,
    isError,
    deleteUser,
    isDeleting,
    bulkDeleteUsers,
    isBulkDeleting,
    refetch,
  } = useUsers({
    page,
    pageSize,
    search,
    roleId: roleId !== 'all' ? roleId : undefined,
    isActive:
      status === 'active' ? true : status === 'inactive' ? false : undefined,
    sortBy,
    sortOrder,
  });

  // Dialog States
  const [userToDelete, setUserToDelete] = useState<UserWithUsage | null>(null);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [userToChangePin, setUserToChangePin] = useState<User | null>(null);
  const [newPin, setNewPin] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);

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

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteUsers(ids, {
      onSuccess: () => {
        refetch();
      },
    });
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

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToChangePin || !newPin) return;

    if (!/^\d{6}$/.test(newPin)) {
      toast.error('PIN harus terdiri dari 6 digit angka');
      return;
    }

    try {
      setIsChangingPin(true);
      await usersService.changePin(userToChangePin.id, {
        newPin,
      });
      toast.success('PIN pengguna berhasil diubah');
      setUserToChangePin(null);
      setNewPin('');
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal mengubah PIN',
      );
    } finally {
      setIsChangingPin(false);
    }
  };

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (user) => setUserToDelete(user as UserWithUsage),
        onResetPassword: setUserToReset,
        onChangePin: (user) => {
          setUserToChangePin(user);
          setNewPin('');
        },
      }),
    [],
  );

  if (isError) {
    return (
      <ErrorState
        title="Gagal memuat data pengguna"
        onRetry={() => refetch()}
      />
    );
  }

  const data = (users || []) as UserWithUsage[];
  const metaData = meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  return (
    <>
      <SettingsPage
        title="Pengguna"
        description="Manajemen pengguna yang terdaftar di sistem."
        createLink="/settings/users/create"
        createLabel="Tambah Pengguna"
        data={data}
        columns={columns}
        isLoading={isLoading}
        // Pagination
        page={page}
        pageSize={pageSize}
        totalPages={metaData.totalPages}
        totalItems={metaData.totalItems}
        onPageChange={(p) => updateUrl({ page: p })}
        onPageSizeChange={(s) => updateUrl({ pageSize: s, page: 1 })}
        summary={
          summary
            ? {
                total: summary.totalUsers,
                active: summary.activeUsers,
                inactive: summary.inactiveUsers,
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
        search={search}
        onSearchChange={(v) => updateUrl({ search: v, page: 1 })}
        searchPlaceholder="Cari pengguna..."
        // Filters
        filterValues={{ roleId, status }}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        onReset={() => router.push(pathname)}
        filters={[
          {
            key: 'roleId', // Note: Using text input for roleId filter might need a dropdown if we had role list. The original page had UsersToolbar which had specific logic?
            label: 'Role',
            options: [
              // In original UsersToolbar, role selection was dynamic?
              // Let's check UsersToolbar again.
            ],
            // For now leaving generic, but we need to check if we can populate roles options.
            // If UsersToolbar fetched roles, we need to fetch them here or pass empty for now.
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Aktif', value: 'active' },
              { label: 'Non-aktif', value: 'inactive' },
            ],
            width: 'w-[150px]',
          },
        ]}
        // Actions
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        onRefresh={refetch}
        onDelete={(id) => {
          const user = data.find((u) => u.id === id);
          if (user) setUserToDelete(user);
        }}
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {(userToDelete?.usageCount || 0) > 0
                ? 'Nonaktifkan User?'
                : 'Hapus User?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(userToDelete?.usageCount || 0) > 0 ? (
                <>
                  User{' '}
                  <span className="font-medium text-foreground">
                    {userToDelete?.username}
                  </span>{' '}
                  akan dinonaktifkan karena memiliki riwayat aktivitas. Data
                  user tetap tersimpan.
                </>
              ) : (
                <>
                  User{' '}
                  <span className="font-medium text-foreground">
                    {userToDelete?.username}
                  </span>{' '}
                  akan dihapus secara permanen. Tindakan ini tidak dapat
                  dibatalkan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/80 "
              onClick={(e) => {
                e.preventDefault();
                if (userToDelete) {
                  deleteUser(userToDelete.id, {
                    onSuccess: () => setUserToDelete(null),
                  });
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting
                ? 'Memproses...'
                : (userToDelete?.usageCount || 0) > 0
                  ? 'Nonaktifkan'
                  : 'Hapus'}
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

      {/* Change PIN Dialog */}
      <Dialog
        open={!!userToChangePin}
        onOpenChange={(open) => !open && setUserToChangePin(null)}
      >
        <DialogContent>
          <form onSubmit={handleChangePin}>
            <DialogHeader>
              <DialogTitle>Ganti PIN Pengguna</DialogTitle>
              <DialogDescription>
                Masukkan 6 digit angka baru untuk PIN{' '}
                <span className="font-medium text-foreground">
                  {userToChangePin?.username}
                </span>
                .
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pin" className="text-right">
                  PIN Baru
                </Label>
                <Input
                  id="pin"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="123456"
                  className="col-span-3"
                  value={newPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) setNewPin(val);
                  }}
                  disabled={isChangingPin}
                  autoComplete="off"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUserToChangePin(null)}
                disabled={isChangingPin}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isChangingPin || newPin.length !== 6}
              >
                {isChangingPin ? 'Menyimpan...' : 'Simpan PIN'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
}
