'use client';

import { Card, CardContent, Skeleton } from '@bizflow/ui';
import { CustomerForm } from '@/components/master-data/customers/customer-form';
import { useCustomer } from '@/hooks/use-customers';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function EditCustomerPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: customer, isLoading, isError } = useCustomer(id);
  const t = useTranslations('customers');

  // Set dynamic breadcrumb
  useBreadcrumb(
    `/master-data/customers/${id}`,
    customer?.name || t('edit.title'),
  );

  if (isLoading) {
    return <CustomerFormSkeleton />;
  }

  if (isError || !customer) {
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
            {t('edit.subtitle', { name: customer.name })}
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
