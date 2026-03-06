'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useTranslations } from 'next-intl';
import { StockOpnameForm } from '@/components/inventory/opname/stock-opname-form';

export default function CreateStockOpnamePage() {
  const t = useTranslations('opname.create');
  useBreadcrumb('/inventory/opname/new', 'Create');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <StockOpnameForm />
      </Suspense>
    </div>
  );
}
