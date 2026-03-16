'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { SalesOrderForm } from '@/components/sales/sales-order-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useTranslations } from 'next-intl';

function CreateSalesOrderContent() {
  return <SalesOrderForm />;
}

export default function CreateSalesOrderPage() {
  const t = useTranslations('sales.orders');
  useBreadcrumb('/sales/orders/new', t('form.createTitle'));

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
        <CreateSalesOrderContent />
      </Suspense>
    </div>
  );
}
