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
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@bizflow/ui';
import { CustomerForm } from '@/components/master-data/customers/customer-form';
import { useCustomer } from '@/hooks/use-customers';
import { useParams } from 'next/navigation';

export default function EditCustomerPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: customer, isLoading, isError } = useCustomer(id);

  if (isLoading) {
    return <CustomerFormSkeleton />;
  }

  if (isError || !customer) {
    return <div>Gagal memuat data pelanggan</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/master-data/customers">
              Pelanggan
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Pelanggan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Pelanggan</h2>
          <p className="text-muted-foreground">
            Perbarui informasi data pelanggan.
          </p>
        </div>
      </div>

      <CustomerForm initialData={customer} isEdit />
    </div>
  );
}

function CustomerFormSkeleton() {
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
