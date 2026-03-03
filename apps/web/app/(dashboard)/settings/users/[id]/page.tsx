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
import { UserForm } from '@/components/core/users/user-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useUser } from '@/hooks';
import { useTranslations } from 'next-intl';

export default function EditUserPage() {
  const t = useTranslations('users');
  const params = useParams();
  const id = params?.id as string;
  const { data: user, isLoading, isError } = useUser(id);

  // Set dynamic breadcrumb
  useBreadcrumb(`/settings/users/${id}`, user?.name || t('edit.title'));

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        {t('edit.errorMsg')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('edit.title')}</h2>
        <p className="text-muted-foreground">{t('edit.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t('edit.cardTitle', { username: user.username })}
          </CardTitle>
          <CardDescription>{t('edit.cardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm initialData={user} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
