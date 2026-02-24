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
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useTranslations } from 'next-intl';

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

  const t = useTranslations('products.edit');

  // Set dynamic breadcrumb
  useBreadcrumb(
    `/master-data/products/${resolvedParams.id}`,
    product?.name || t('title'),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !product) {
    return <ErrorState title={t('failedLoad')} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground">
          {t('subtitle', { name: product.name })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('cardTitle')}</CardTitle>
          <CardDescription>{t('cardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm initialData={product} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
