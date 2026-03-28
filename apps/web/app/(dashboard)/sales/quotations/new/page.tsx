'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { QuotationForm } from '@/components/sales/quotations/quotation-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useTranslations } from 'next-intl';

function CreateQuotationContent() {
  return <QuotationForm />;
}

export default function CreateQuotationPage() {
  const t = useTranslations('sales.quotations');
  useBreadcrumb('/sales/quotations/new', t('form.createTitle'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('form.createTitle')}
        </h2>
        <p className="text-muted-foreground">{t('form.createSubtitle')}</p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <CreateQuotationContent />
      </Suspense>
    </div>
  );
}
