'use client';

import { PaymentTermForm } from '@/components/master-data/payment-terms/payment-term-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useTranslations } from 'next-intl';

export default function CreatePaymentTermPage() {
  const t = useTranslations('paymentTerms');
  useBreadcrumb('/master-data/payment-terms/create', t('createLabel'));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('create.title')}
          </h2>
          <p className="text-muted-foreground">{t('create.subtitle')}</p>
        </div>
      </div>

      <PaymentTermForm />
    </div>
  );
}
