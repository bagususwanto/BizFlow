'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useProducts, useDeleteProduct } from '@/hooks/use-products';
import {
  productsService,
  ProductWithRelations,
} from '@/services/products.service'; // Fixed import
import { QueryProductsValues } from '@bizflow/types';
import { MasterDataPage } from '@/components/master-data/master-data-page';
import { getColumns } from '@/components/master-data/products/columns';
import { ErrorState } from '@/components/common/error-state';
import { useActiveCategories } from '@/hooks/use-categories';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { toast } from 'sonner';

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
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

  // Fetch Categories for Filter
  const { data: categories = [] } = useActiveCategories();

  const queryParams: QueryProductsValues = {
    page,
    pageSize,
    search,
    categoryId: categoryId !== 'all' ? categoryId : undefined,
    isActive:
      status === 'active' ? true : status === 'inactive' ? false : undefined,
    sortBy: sortBy as any,
    sortOrder,
  };

  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useProducts(queryParams);

  const deleteMutation = useDeleteProduct();

  // Delete Dialog State (Local to Page to handle confirmation)
  const [productToDelete, setProductToDelete] =
    useState<ProductWithRelations | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

  const handleError = () => (
    <ErrorState title="Gagal memuat data produk" onRetry={() => refetch()} />
  );

  const handleBulkDelete = async (ids: string[]) => {
    try {
      setIsBulkDeleting(true);
      // Assuming productsService is imported or define it here if not available in hooks
      // We'll use the imported one or a direct call
      const { productsService } = await import('@/services/products.service');
      const response = await productsService.bulkDelete(ids);
      const message =
        (response as any).data?.message ||
        `${ids.length} produk berhasil dinonaktifkan`;
      toast.success(message);
      refetch();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menghapus produk',
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (product) => setProductToDelete(product),
      }),
    [],
  );

  if (isError) return handleError();

  const products = productsData?.data || [];
  const meta = productsData?.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };
  const summary = productsData?.summary;

  return (
    <>
      <MasterDataPage
        title="Produk"
        description="Manajemen katalog produk dan jasa."
        createLink="/master-data/products/create"
        createLabel="Tambah Produk"
        data={products}
        columns={columns}
        isLoading={isLoading}
        // Pagination
        page={page}
        pageSize={pageSize}
        totalPages={meta.totalPages}
        totalItems={meta.totalItems}
        onPageChange={(p) => updateUrl({ page: p })}
        onPageSizeChange={(s) => updateUrl({ pageSize: s, page: 1 })}
        summary={
          summary
            ? {
                total: summary.totalProducts,
                active: summary.activeProducts,
                service: summary.serviceProducts,
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
        // Search & Filters
        search={search}
        onSearchChange={(v) => updateUrl({ search: v, page: 1 })}
        searchPlaceholder="Cari produk (Nama, SKU, Barcode)..."
        filterValues={{ categoryId, status }}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        onReset={() => router.push(pathname)}
        filters={[
          {
            key: 'categoryId',
            label: 'Kategori',
            options: categories.map((c) => ({ label: c.name, value: c.id })),
            width: 'w-full md:w-[240px]',
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Aktif', value: 'active' },
              { label: 'Nonaktif', value: 'inactive' },
            ],
            width: 'w-full md:w-[150px]',
          },
        ]}
        // Actions
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        onRefresh={refetch}
      />

      {/* Single Delete Dialog - Kept here for custom message */}
      <DeleteConfirmDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        title={
          productToDelete?.isActive
            ? 'Nonaktifkan Produk?'
            : 'Hapus Produk Permanen?'
        }
        description={
          productToDelete?.isActive ? (
            <>
              Produk{' '}
              <span className="font-medium text-foreground">
                {productToDelete?.name}
              </span>{' '}
              akan dinonaktifkan. Data produk tetap tersimpan.
            </>
          ) : (
            <>
              <p>
                Produk{' '}
                <span className="font-medium text-foreground">
                  {productToDelete?.name}
                </span>{' '}
                akan dihapus secara permanen. Tindakan ini tidak dapat
                dibatalkan.
              </p>
              <p className="mt-2 text-sm font-medium text-destructive">
                Peringatan: Produk yang memiliki riwayat transaksi/stok tidak
                dapat dihapus permanen.
              </p>
            </>
          )
        }
        onConfirm={() => {
          if (productToDelete) {
            deleteMutation.mutate(productToDelete.id, {
              onSuccess: () => setProductToDelete(null),
            });
          }
        }}
        isDeleting={deleteMutation.isPending}
        confirmLabel={
          productToDelete?.isActive ? 'Nonaktifkan' : 'Hapus Permanen'
        }
      />
    </>
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
