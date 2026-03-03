'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { getColumns } from '@/components/core/roles/columns';
import { ErrorState } from '@/components/common/error-state';
import { useRoles, useDebounce } from '@/hooks';
import { Role, rolesService } from '@/services/roles.service';
import { DataListPage } from '@/components/shared/data-list-page';
import { Box } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useTranslations } from 'next-intl';

function RolesContent() {
  const t = useTranslations('roles');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const isSystemRole = searchParams.get('isSystemRole') || 'all';
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

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
      toast.success(t('delete.successMsg', { count: ids.length }));
      refetch();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : t('delete.errorMsg'),
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      getColumns({
        t,
        onDelete: (role) => setRoleToDelete(role),
      }),
    [t, roles],
  );

  const totalPages = meta?.totalPages || 0;
  const totalItems = meta?.totalItems || 0;

  return (
    <>
      <DataListPage
        title={t('title')}
        description={t('description')}
        createLink="/settings/roles/create"
        createLabel={t('createLabel')}
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
        summaryConfig={[
          { key: 'total', label: t('summary.total'), icon: Box },
          {
            key: 'systemRoles',
            label: t('summary.systemRoles'),
            icon: Box,
            className: 'text-info',
          },
          { key: 'customRoles', label: t('summary.customRoles'), icon: Box },
          {
            key: 'totalUsersAssigned',
            label: t('summary.totalUsersAssigned'),
            icon: Box,
          },
        ]}
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
        searchPlaceholder={t('searchPlaceholder')}
        // Filters
        filterValues={{ isSystemRole }}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        onReset={() => router.push(pathname)}
        filters={[
          {
            key: 'isSystemRole',
            label: t('filter.typeLabel'),
            options: [
              { label: t('filter.typeSystem'), value: 'true' },
              { label: t('filter.typeCustom'), value: 'false' },
            ],
            width: 'w-[220px]',
          },
        ]}
        // Actions
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        onRefresh={refetch}
        isError={isError}
        onDelete={(id) => {
          const role = roles?.find((r) => r.id === id);
          if (role) setRoleToDelete(role);
        }}
      />

      <DeleteConfirmDialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
        title={t('delete.title')}
        description={
          <>
            <p>
              {t.rich('delete.descPermanent1', {
                name: roleToDelete?.name || '',
                bold: (chunks) => (
                  <span className="font-medium text-foreground">{chunks}</span>
                ),
              })}
            </p>
            <p className="mt-2 text-sm text-warning">
              {t('delete.descWarning')}
            </p>
          </>
        }
        cancelLabel={t('delete.cancelBtn')}
        onConfirm={() => {
          if (roleToDelete) {
            deleteRole(roleToDelete.id, {
              onSuccess: () => setRoleToDelete(null),
            });
          }
        }}
        isDeleting={isDeleting}
      />
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
