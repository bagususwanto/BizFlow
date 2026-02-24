'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { ProductForm } from '@/components/master-data/products/product-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useTranslations } from 'next-intl';

export default function CreateProductPage() {
  const t = useTranslations('products.create');
  useBreadcrumb('/master-data/products/create', t('title'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('cardTitle')}</CardTitle>
          <CardDescription>{t('cardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
