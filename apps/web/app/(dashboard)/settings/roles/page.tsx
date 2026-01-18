'use client';

import { Suspense, useCallback, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { RolesTable } from '@/components/roles/roles-table';
import { RolesToolbar } from '@/components/roles/roles-toolbar';
import { RolesPagination } from '@/components/roles/roles-pagination';
import { ErrorState } from '@/components/common/error-state';
import { LoadingState } from '@/components/common/loading-state';
import { useRoles } from '@/hooks/use-roles';
import { useDebounce } from '@/hooks/use-debounce';

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

  // Local state for column visibility
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

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

  const handleSearchChange = (value: string) => {
    updateUrl({ search: value, page: 1 });
  };

  const handleRoleTypeChange = (value: string) => {
    updateUrl({ isSystemRole: value, page: 1 });
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      updateUrl({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateUrl({ sortBy: field, sortOrder: 'asc' });
    }
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    updateUrl({ pageSize: newSize, page: 1 });
  };

  const handleReset = () => {
    router.push(pathname);
  };

  if (isError) {
    return (
      <ErrorState title="Gagal memuat data peran" onRetry={() => refetch()} />
    );
  }

  const totalPages = meta?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Peran & Akses</h2>
          <p className="text-muted-foreground">
            Kelola hak akses pengguna aplikasi sesuai perannya.
          </p>
        </div>
        <Button asChild>
          <Link href="/settings/roles/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Peran
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Peran</CardTitle>
          <CardDescription>
            Menampilkan semua peran yang tersedia beserta jumlah penggunanya.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RolesToolbar
            search={search}
            onSearchChange={handleSearchChange}
            roleType={isSystemRole}
            onRoleTypeChange={handleRoleTypeChange}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            onReset={handleReset}
          />

          {isLoading ? (
            <div className="flex justify-center p-8">
              <LoadingState />
            </div>
          ) : (
            <>
              <RolesTable
                data={roles || []}
                onDelete={(id) => deleteRole(id)}
                isDeleting={isDeleting}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                onRefresh={refetch}
              />

              <RolesPagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                summary={summary}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
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
