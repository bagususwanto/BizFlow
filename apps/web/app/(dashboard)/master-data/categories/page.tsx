'use client';

import { Suspense, useCallback, useState } from 'react';
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
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useCategories, useDeleteCategory } from '@/hooks/use-categories';
import {
  CategoriesTable,
  CategoriesToolbar,
  CategoriesPagination,
} from '@/components/master-data/categories';

function CategoriesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const sortBy = searchParams.get('sortBy') || 'name';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';

  // Local state for column visibility
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({
    description: true,
    productCount: true,
  });

  const {
    data: categoriesResponse,
    isLoading,
    refetch,
  } = useCategories({
    page,
    pageSize,
    search,
    isActive:
      status === 'active' ? true : status === 'inactive' ? false : undefined,
    sortBy: sortBy as 'name' | 'productCount' | 'createdAt' | 'updatedAt',
    sortOrder,
  });

  // Extract data from response structure
  const categories = categoriesResponse?.data || [];
  const meta = categoriesResponse?.meta;
  const summary = categoriesResponse?.summary;

  // Delete hook
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

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

  const handleSortChange = (field: string) => {
    if (field === sortBy) {
      updateUrl({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateUrl({ sortBy: field, sortOrder: 'asc' });
    }
  };

  const handleSearchChange = (value: string) => {
    updateUrl({ search: value, page: 1 });
  };

  const handleStatusFilterChange = (value: string) => {
    updateUrl({ status: value, page: 1 });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kategori</h2>
          <p className="text-muted-foreground">
            Kelola kategori produk dan hierarkinya.
          </p>
        </div>
        <Button asChild>
          <Link href="/master-data/categories/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kategori
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>
            Menampilkan semua kategori produk yang terdaftar dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CategoriesToolbar
            search={search}
            onSearchChange={handleSearchChange}
            status={status}
            onStatusFilterChange={handleStatusFilterChange}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            onReset={handleReset}
          />

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <CategoriesTable
                data={categories}
                onDelete={deleteCategory}
                isDeleting={isDeleting}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                onRefresh={refetch}
              />

              <CategoriesPagination
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

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
