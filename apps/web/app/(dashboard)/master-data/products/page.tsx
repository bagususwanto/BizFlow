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
import { ProductsTable } from '@/components/master-data/products/products-table';
import { ProductsToolbar } from '@/components/master-data/products/products-toolbar';
import { ProductsPagination } from '@/components/master-data/products/products-pagination';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import {
  useProducts,
  useDeleteProduct,
  useBulkDeleteProducts,
} from '@/hooks/use-products';
import { QueryProductsValues } from '@bizflow/types';

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || 'all';
  const status = searchParams.get('status') || 'all';

  // Local state
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const queryParams: QueryProductsValues = {
    page,
    pageSize,
    search,
    categoryId: categoryId !== 'all' ? categoryId : undefined,
    isActive:
      status === 'active' ? true : status === 'inactive' ? false : undefined,
    sortBy: 'name',
    sortOrder: 'asc',
  };

  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useProducts(queryParams);

  const deleteMutation = useDeleteProduct();

  const handleCreateQueryString = useCallback(
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
    const queryString = handleCreateQueryString(params);
    router.push(`${pathname}?${queryString}`);
  };

  const handleSearchChange = (value: string) => {
    updateUrl({ search: value, page: 1 });
  };

  const handleCategoryFilterChange = (value: string) => {
    updateUrl({ categoryId: value, page: 1 });
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

  if (isError) {
    return (
      <ErrorState title="Gagal memuat data produk" onRetry={() => refetch()} />
    );
  }

  const handleDelete = (product: any) => {
    // In a real app we might want a confirmation dialog here
    if (
      confirm(`Yakin ingin menonaktifkan/menghapus produk ${product.name}?`)
    ) {
      deleteMutation.mutate(product.id);
    }
  };

  const products = productsData?.data || [];
  const meta = productsData?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Produk</h2>
          <p className="text-muted-foreground">
            Manajemen katalog produk dan jasa.
          </p>
        </div>
        <Button asChild>
          <Link href="/master-data/products/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Menampilkan semua produk yang terdaftar dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProductsToolbar
            search={search}
            onSearchChange={handleSearchChange}
            categoryId={categoryId}
            onCategoryFilterChange={handleCategoryFilterChange}
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
              <ProductsTable
                data={products}
                isLoading={isLoading}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                onDelete={handleDelete}
              />

              {meta && (
                <ProductsPagination
                  page={page}
                  pageSize={pageSize}
                  totalPages={meta.totalPages}
                  totalItems={meta.totalItems}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
