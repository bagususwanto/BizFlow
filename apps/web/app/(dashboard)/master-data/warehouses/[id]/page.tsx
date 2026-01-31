'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Card,
  CardContent,
  Skeleton,
} from '@bizflow/ui';
import { WarehouseForm } from '@/components/master-data/warehouses/warehouse-form';
import { useWarehouse } from '@/hooks/use-warehouses';
import { useParams } from 'next/navigation';

export default function EditWarehousePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: warehouse, isLoading, isError } = useWarehouse(id);

  if (isLoading) {
    return <WarehouseFormSkeleton />;
  }

  if (isError || !warehouse) {
    return <div>Gagal memuat data gudang</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/master-data/warehouses">
              Gudang
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Gudang</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Gudang</h2>
          <p className="text-muted-foreground">
            Perbarui informasi data gudang.
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
