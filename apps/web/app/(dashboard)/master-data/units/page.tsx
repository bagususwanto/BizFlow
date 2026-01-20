'use client';

import { Suspense, useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';

import { UnitsTable } from '@/components/master-data/units/units-table';
import { UnitsToolbar } from '@/components/master-data/units/units-toolbar';
import { UnitsPagination } from '@/components/master-data/units/units-pagination';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useUnits } from '@/hooks';

function UnitsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'name';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';

  // Local state for column visibility (doesn't need to be in URL)
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const {
    units,
    meta,
    summary,
    isLoading,
    isError,
    deleteUnit,
    isDeleting,
    refetch,
  } = useUnits({
    page,
    pageSize,
    search,
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
      <ErrorState title="Gagal memuat data satuan" onRetry={() => refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Satuan</h2>
          <p className="text-muted-foreground">
            Manajemen satuan produk (Unit of Measure).
          </p>
        </div>
        <Button asChild>
          <Link href="/master-data/units/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Satuan
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Satuan</CardTitle>
          <CardDescription>
            Menampilkan semua satuan yang terdaftar dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UnitsToolbar
            search={search}
            onSearchChange={handleSearchChange}
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
              <UnitsTable
                data={units || []}
                onDelete={deleteUnit}
                isDeleting={isDeleting}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                onRefresh={refetch}
              />

              <UnitsPagination
                page={page}
                totalPages={meta?.totalPages || 1}
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

export default function UnitsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <UnitsContent />
    </Suspense>
  );
}
