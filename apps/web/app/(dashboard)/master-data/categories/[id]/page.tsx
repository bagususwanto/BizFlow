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
import { useCategory } from '@/hooks';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { CategoryForm } from '@/components/master-data/categories/category-form';
import { useTranslations } from 'next-intl';

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: category, isLoading, isError } = useCategory(id);
  const t = useTranslations('categories');

  // Set dynamic breadcrumb
  useBreadcrumb(
    `/master-data/categories/${id}`,
    category?.name || t('edit.title'),
  );

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !category) {
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
          {t('edit.subtitle', { name: category.name })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('edit.cardTitle')}</CardTitle>
          <CardDescription>{t('edit.cardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm initialData={category} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
