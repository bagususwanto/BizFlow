'use client';

import {
  Plus,
  Search,
  SlidersHorizontal,
  UserCog,
  Users,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Separator,
  Badge,
} from '@bizflow/ui';
import { RolesTable } from '@/components/roles/roles-table';
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
      <ErrorState title="Gagal memuat data role" onRetry={() => refetch()} />
    );
  }

  const totalPages = meta?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Role & Permission
          </h2>
          <p className="text-muted-foreground">
            Kelola hak akses pengguna aplikasi sesuai perannya.
          </p>
        </div>
        <Button asChild>
          <Link href="/settings/roles/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Role
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Role</CardTitle>
          <CardDescription>
            Menampilkan semua role yang tersedia beserta jumlah penggunanya.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari role..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1); // Reset page on search
                  }}
                  className="pl-8"
                />
              </div>
              <Select
                value={isSystemRole}
                onValueChange={(value) => {
                  setIsSystemRole(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Tipe Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="true">System Role</SelectItem>
                  <SelectItem value="false">Custom Role</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Baris per halaman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per hal</SelectItem>
                  <SelectItem value="10">10 per hal</SelectItem>
                  <SelectItem value="20">20 per hal</SelectItem>
                  <SelectItem value="50">50 per hal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
              />

              <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
                {/* Summary Section - Bottom Left */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {summary && (
                    <>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          Total:{' '}
                          <span className="font-medium text-foreground">
                            {summary.totalRoles}
                          </span>
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                        <span>
                          System:{' '}
                          <span className="font-medium text-foreground">
                            {summary.systemRoles}
                          </span>
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-green-500" />
                        <span>
                          Custom:{' '}
                          <span className="font-medium text-foreground">
                            {summary.customRoles}
                          </span>
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Pengguna Aktif:{' '}
                          <span className="font-medium text-foreground">
                            {summary.totalUsersAssigned}
                          </span>
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Pagination - Bottom Right */}
                <Pagination className="justify-end w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) setPage(page - 1);
                        }}
                        className={
                          page <= 1 ? 'pointer-events-none opacity-50' : ''
                        }
                      />
                    </PaginationItem>
                    {/* Basic Only Page Count for now */}
                    <PaginationItem>
                      <span className="flex h-9 items-center justify-center px-4 text-sm">
                        Halaman {page} dari {totalPages}
                      </span>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages) setPage(page + 1);
                        }}
                        className={
                          page >= totalPages
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
