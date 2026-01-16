'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useOutlets } from '@/hooks/use-outlets';
import { OutletsTable } from '@/components/outlets/outlets-table';
import { OutletsToolbar } from '@/components/outlets/outlets-toolbar';
import { OutletsPagination } from '@/components/outlets/outlets-pagination';

export default function OutletsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<
    'code' | 'name' | 'createdAt' | 'updatedAt' | 'userCount'
  >('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [status, setStatus] = useState<string>('all');
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({
    address: true,
    phone: true,
  });

  // Debounce search input would be better but keeping simple for now
  const {
    outlets,
    meta,
    summary,
    isLoading,
    deleteOutlet,
    isDeleting,
    refetch,
  } = useOutlets({
    page,
    pageSize,
    search,
    isActive:
      status === 'active' ? true : status === 'inactive' ? false : undefined,
    sortBy,
    sortOrder,
  });

  const handleSortChange = (field: string) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field as any);
      setSortOrder('asc');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page
  };

  const handleStatusFilterChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Outlets</h2>
          <p className="text-muted-foreground">
            Kelola data outlet dan cabang perusahaan.
          </p>
        </div>
        <Button asChild>
          <Link href="/settings/outlets/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Outlet
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Outlet</CardTitle>
          <CardDescription>
            Menampilkan semua outlet yang terdaftar dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <OutletsToolbar
            search={search}
            onSearchChange={handleSearchChange}
            status={status}
            onStatusFilterChange={handleStatusFilterChange}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
          />

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <OutletsTable
                data={outlets || []}
                onDelete={deleteOutlet}
                isDeleting={isDeleting}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                onRefresh={refetch}
              />

              <OutletsPagination
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
