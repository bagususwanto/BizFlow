'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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

export default function RolesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isSystemRole, setIsSystemRole] = useState<string>('all'); // all, true, false
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            roleType={isSystemRole}
            onRoleTypeChange={(value) => {
              setIsSystemRole(value);
              setPage(1);
            }}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
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
                onSortChange={(field) => {
                  if (sortBy === field) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(field);
                    setSortOrder('asc');
                  }
                }}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                onRefresh={refetch}
              />

              <RolesPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                summary={summary}
                pageSize={pageSize}
                onPageSizeChange={(value) => {
                  setPageSize(value);
                  setPage(1);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
