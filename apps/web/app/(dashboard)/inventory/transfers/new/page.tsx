'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useTranslations } from 'next-intl';
import { StockTransferForm } from '@/components/inventory/transfers/stock-transfer-form';

export default function CreateStockTransferPage() {
  const t = useTranslations('transfers.create');
  useBreadcrumb('/inventory/transfers/new', 'Create');

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
        <StockTransferForm />
      </Suspense>
    </div>
  );
}
