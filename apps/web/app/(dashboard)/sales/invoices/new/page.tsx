'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { InvoiceForm } from '@/components/sales/invoices/invoice-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useTranslations } from 'next-intl';

function CreateSalesInvoiceContent() {
  return <InvoiceForm />;
}

export default function CreateSalesInvoicePage() {
  const t = useTranslations('sales.invoices');
  useBreadcrumb('/sales/invoices/new', t('createTitle'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('createTitle')}
        </h2>
        <p className="text-muted-foreground">{t('createDescription')}</p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <CreateSalesInvoiceContent />
      </Suspense>
    </div>
  );
}
