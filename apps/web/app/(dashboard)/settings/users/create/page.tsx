'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { UserForm } from '@/components/core/users/user-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useTranslations } from 'next-intl';

export default function CreateUserPage() {
  const t = useTranslations('users');
  useBreadcrumb('/settings/users/create', t('create.title'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
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
          <UserForm />
        </CardContent>
      </Card>
    </div>
  );
}
