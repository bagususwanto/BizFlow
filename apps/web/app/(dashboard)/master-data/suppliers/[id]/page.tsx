'use client';

import { Card, CardContent, Skeleton } from '@bizflow/ui';
import { SupplierForm } from '@/components/master-data/suppliers/supplier-form';
import { useSupplier } from '@/hooks/use-suppliers';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useParams } from 'next/navigation';

export default function EditSupplierPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: supplier, isLoading, isError } = useSupplier(id);

  // Set dynamic breadcrumb
  useBreadcrumb(
    `/master-data/suppliers/${id}`,
    supplier?.name || 'Edit Pemasok',
  );

  if (isLoading) {
    return <SupplierFormSkeleton />;
  }

  if (isError || !supplier) {
    return <div>Gagal memuat data pemasok</div>;
  }

  return (
    <SupplierForm
      initialData={supplier}
      title="Edit Pemasok"
      description="Perbarui informasi data pemasok."
    />
  );
}

function SupplierFormSkeleton() {
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
