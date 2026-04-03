'use client';

import { useTranslations } from 'next-intl';
import { SalesReturnForm } from '@/components/sales/returns/sales-return-form';

export default function NewSalesReturnPage() {
  const t = useTranslations('sales.returns.form');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('createTitle')}</h1>
        <p className="text-muted-foreground">{t('createSubtitle')}</p>
      </div>

      <SalesReturnForm />
    </div>
  );
}
