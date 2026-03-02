'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { OutletForm } from '@/components/core/outlets/outlet-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useTranslations } from 'next-intl';

export default function CreateOutletPage() {
  const t = useTranslations('outlets');
  const tCommon = useTranslations('common');

  useBreadcrumb('/settings/outlets/create', t('create.title'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t('create.title')}
        </h2>
        <p className="text-muted-foreground">{t('create.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('create.cardTitle')}</CardTitle>
          <CardDescription>{t('create.cardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <OutletForm />
        </CardContent>
      </Card>
    </div>
  );
}
