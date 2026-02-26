'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { CategoryForm } from '@/components/master-data/categories/category-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

function CreateCategoryContent() {
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parentId');

  return (
    <CategoryForm initialData={parentId ? ({ parentId } as any) : undefined} />
  );
}

export default function CreateCategoryPage() {
  const t = useTranslations('categories');
  useBreadcrumb('/master-data/categories/create', t('createLabel'));

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
          <Suspense
            fallback={
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <CreateCategoryContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
