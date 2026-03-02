'use client';

import { use } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { Loader2 } from 'lucide-react';
import { useOutlet } from '@/hooks';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { OutletForm } from '@/components/core/outlets/outlet-form';
import { useTranslations } from 'next-intl';

export default function EditOutletPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: outlet, isLoading, isError } = useOutlet(id);
  const t = useTranslations('outlets');

  // Set dynamic breadcrumb
  useBreadcrumb(`/settings/outlets/${id}`, outlet?.name || t('edit.title'));

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !outlet) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-destructive">
        {t('edit.failedLoad')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('edit.title')}</h2>
        <p className="text-muted-foreground">
          {t('edit.subtitle', { name: outlet.name })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('edit.cardTitle')}</CardTitle>
          <CardDescription>{t('edit.cardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <OutletForm initialData={outlet} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
