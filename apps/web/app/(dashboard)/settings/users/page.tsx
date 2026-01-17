'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';

import { UsersTable } from '@/components/users/users-table';
import { UsersToolbar } from '@/components/users/users-toolbar';
import { UsersPagination } from '@/components/users/users-pagination';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useUsers } from '@/hooks/use-users';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState<
    'username' | 'name' | 'email' | 'createdAt' | 'updatedAt' | 'lastLogin'
  >('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const {
    users,
    meta,
    summary,
    isLoading,
    isError,
    deleteUser,
    isDeleting,
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

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleId(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field as any);
      setSortOrder('asc'); // Default to asc when changing sort field
    }
  };

  const handleReset = () => {
    setSearch('');
    setRoleId('all');
    setStatus('all');
    setPage(1);
  };

  if (isError) {
    return (
      <ErrorState
        title="Gagal memuat data pengguna"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pengguna</h2>
          <p className="text-muted-foreground">
            Manajemen pengguna yang terdaftar di sistem.
          </p>
        </div>
        <Button asChild>
          <Link href="/settings/users/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengguna
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            Menampilkan semua pengguna yang terdaftar dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UsersToolbar
            search={search}
            onSearchChange={handleSearchChange}
            roleId={roleId}
            onRoleFilterChange={handleRoleFilterChange}
            status={status}
            onStatusFilterChange={handleStatusFilterChange}
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
              <UsersTable
                data={users || []}
                onDelete={deleteUser}
                isDeleting={isDeleting}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                onRefresh={refetch}
              />

              <UsersPagination
                page={page}
                totalPages={meta?.totalPages || 1}
                onPageChange={setPage}
                summary={summary}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size);
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
