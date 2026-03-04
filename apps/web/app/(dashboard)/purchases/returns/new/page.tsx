'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { PurchaseReturnForm } from '@/components/purchases/returns/purchase-return-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useTranslations } from 'next-intl';

export default function CreatePurchaseReturnPage() {
  const t = useTranslations('purchases.returns.form');
  useBreadcrumb('/purchases/returns/new', t('actions.submit'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('createTitle')}
        </h2>
        <p className="text-muted-foreground">{t('createSubtitle')}</p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <PurchaseReturnForm />
      </Suspense>
    </div>
  );
}
