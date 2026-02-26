'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { UnitForm } from '@/components/master-data/units/unit-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useTranslations } from 'next-intl';

export default function CreateUnitPage() {
  const t = useTranslations('units');
  useBreadcrumb('/master-data/units/create', t('createLabel'));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('create.title')}
        </h1>
        <p className="text-muted-foreground">{t('create.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('create.cardTitle')}</CardTitle>
          <CardDescription>{t('create.cardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <UnitForm />
        </CardContent>
      </Card>
    </div>
  );
}
