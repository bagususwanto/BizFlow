'use client';

import { Card, CardContent, Skeleton } from '@bizflow/ui';
import { WarehouseForm } from '@/components/master-data/warehouses/warehouse-form';
import { useWarehouse } from '@/hooks/use-warehouses';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function EditWarehousePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: warehouse, isLoading, isError } = useWarehouse(id);
  const t = useTranslations('warehouses');

  // Set dynamic breadcrumb
  useBreadcrumb(
    `/master-data/warehouses/${id}`,
    warehouse?.name || t('edit.title'),
  );

  if (isLoading) {
    return <WarehouseFormSkeleton />;
  }

  if (isError || !warehouse) {
    return <div>{t('edit.failedLoad')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('edit.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('edit.subtitle', { name: warehouse.name })}
          </p>
        </div>
      </div>

      <WarehouseForm initialData={warehouse} isEdit />
    </div>
  );
}

function WarehouseFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/4" />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </CardContent>
      </Card>
    </div>
  );
}
