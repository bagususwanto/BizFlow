'use client';

import { use } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { ProductForm } from '@/components/master-data/products/product-form';
import { useProduct } from '@/hooks/use-products';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useProduct(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <ErrorState
        title="Gagal memuat detail produk"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Produk</h2>
        <p className="text-muted-foreground">
          Ubah informasi produk {product.name}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Informasi Produk</CardTitle>
          <CardDescription>Lakukan perubahan pada data produk.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm initialData={product} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
