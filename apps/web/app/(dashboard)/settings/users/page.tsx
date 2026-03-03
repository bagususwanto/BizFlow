'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
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
import { useUsers, useRoles } from '@/hooks';
import { usersService, UserWithUsage } from '@/services/users.service';
import { User } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useTranslations } from 'next-intl';

function UsersContent() {
  const t = useTranslations('users');
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
      | 'status') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

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

  // Fetch roles for filter
  const { roles: rolesList } = useRoles({ page: 1, pageSize: 100 });
  const roleOptions =
    rolesList?.map((role) => ({
      label: role.name,
      value: role.id,
    })) || [];

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
          <span>{t('resetPassword.successTitle')}</span>
          <span className="font-mono bg-muted p-1 rounded select-all">
            {newPassword}
          </span>
          <span className="text-xs text-muted-foreground">
            {t('resetPassword.successCopy')}
          </span>
        </div>,
        { duration: 10000 },
      );

      setUserToReset(null);
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : t('resetPassword.errorMsg'),
      );
    } finally {
      setIsResetting(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToChangePin || !newPin) return;

    if (!/^\d{6}$/.test(newPin)) {
      toast.error(t('changePin.validationMsg'));
      return;
    }

    try {
      setIsChangingPin(true);
      await usersService.changePin(userToChangePin.id, {
        newPin,
      });
      toast.success(t('changePin.successMsg'));
      setUserToChangePin(null);
      setNewPin('');
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : t('changePin.errorMsg'),
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
        t,
      }),
    [t],
  );

  const data = (users || []) as UserWithUsage[];
  const metaData = meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  return (
    <>
      <DataListPage
        title={t('title')}
        description={t('description')}
        createLink="/settings/users/create"
        createLabel={t('createLabel')}
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
        searchPlaceholder={t('searchPlaceholder')}
        // Filters
        filterValues={{ roleId, status }}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        onReset={() => router.push(pathname)}
        filters={[
          {
            key: 'roleId',
            label: t('filter.roleLabel'),
            options: roleOptions,
            // For now leaving generic, but we need to check if we can populate roles options.
            // If UsersToolbar fetched roles, we need to fetch them here or pass empty for now.
          },
          {
            key: 'status',
            label: t('filter.statusLabel'),
            options: [
              { label: t('filter.statusActive'), value: 'active' },
              { label: t('filter.statusInactive'), value: 'inactive' },
            ],
            width: 'w-[150px]',
          },
        ]}
        // Actions
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        onRefresh={refetch}
        isError={isError}
        onDelete={(id) => {
          const user = data.find((u) => u.id === id);
          if (user) setUserToDelete(user);
        }}
      />

      <DeleteConfirmDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title={
          userToDelete?.isActive
            ? t('delete.titleDeactivate')
            : t('delete.titleDelete')
        }
        description={
          userToDelete?.isActive ? (
            <>
              {t.rich('delete.descDeactivate1', {
                username: userToDelete?.username || '',
                bold: (chunks) => (
                  <span className="font-medium text-foreground">{chunks}</span>
                ),
              })}
            </>
          ) : (
            <>
              <p>
                {t.rich('delete.descPermanent1', {
                  username: userToDelete?.username || '',
                  bold: (chunks) => (
                    <span className="font-medium text-foreground">
                      {chunks}
                    </span>
                  ),
                })}
              </p>
              <p className="mt-2 text-sm text-warning">
                {t('delete.descWarning')}
              </p>
            </>
          )
        }
        confirmLabel={
          userToDelete?.isActive
            ? t('delete.deactivateBtn')
            : t('delete.deleteBtn')
        }
        cancelLabel={t('delete.cancelBtn')}
        isDeleting={isDeleting}
        onConfirm={() => {
          if (userToDelete) {
            deleteUser(userToDelete.id, {
              onSuccess: () => setUserToDelete(null),
            });
          }
        }}
      />

      <DeleteConfirmDialog
        open={!!userToReset}
        onOpenChange={(open) => !open && setUserToReset(null)}
        title={t('resetPassword.title')}
        description={
          <>
            {t.rich('resetPassword.description', {
              username: userToReset?.username || '',
              bold: (chunks) => (
                <span className="font-medium text-foreground">{chunks}</span>
              ),
            })}
          </>
        }
        confirmLabel={t('resetPassword.resetBtn')}
        cancelLabel={t('delete.cancelBtn')}
        variant="default"
        isDeleting={isResetting}
        onConfirm={handleResetPassword}
      />

      {/* Change PIN Dialog */}
      <Dialog
        open={!!userToChangePin}
        onOpenChange={(open) => !open && setUserToChangePin(null)}
      >
        <DialogContent>
          <form onSubmit={handleChangePin}>
            <DialogHeader>
              <DialogTitle>{t('changePin.title')}</DialogTitle>
              <DialogDescription>
                {t.rich('changePin.description', {
                  username: userToChangePin?.username || '',
                  bold: (chunks) => (
                    <span className="font-medium text-foreground">
                      {chunks}
                    </span>
                  ),
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pin" className="text-right">
                  {t('changePin.newPinLabel')}
                </Label>
                <Input
                  id="pin"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder={t('changePin.newPinPlaceholder')}
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
                {t('changePin.cancelBtn')}
              </Button>
              <Button
                type="submit"
                disabled={isChangingPin || newPin.length !== 6}
              >
                {isChangingPin
                  ? t('changePin.savingBtn')
                  : t('changePin.saveBtn')}
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
