'use client';

import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { UnitForm } from '@/components/master-data/units/unit-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useUnit } from '@/hooks';
import { useTranslations } from 'next-intl';

export default function EditUnitPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: unit, isLoading, isError } = useUnit(id);
  const t = useTranslations('units');

  // Set dynamic breadcrumb
  useBreadcrumb(`/master-data/units/${id}`, unit?.name || t('edit.title'));

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !unit) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-muted-foreground">
        {t('edit.failedLoad')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('edit.title')}</h1>
        <p className="text-muted-foreground">
          {t('edit.subtitle', { name: unit.name })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('edit.cardTitle')}</CardTitle>
          <CardDescription>{t('edit.cardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <UnitForm initialData={unit} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
