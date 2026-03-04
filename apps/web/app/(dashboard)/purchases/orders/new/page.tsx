'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PurchaseOrderForm } from '@/components/purchases/purchase-order-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useTranslations } from 'next-intl';

function CreatePurchaseOrderContent() {
  const searchParams = useSearchParams();
  const variantId = searchParams.get('variantId');
  const variantIdsParam = searchParams.get('variantIds');
  const warehouseId = searchParams.get('warehouseId');

  // Combine single variantId (if any) with bulk variantIds
  const allVariantIds = new Set<string>();
  if (variantId) allVariantIds.add(variantId);
  if (variantIdsParam) {
    variantIdsParam.split(',').forEach((id) => id && allVariantIds.add(id));
  }

  const uniqueVariantIds = Array.from(allVariantIds);

  const prefilledData =
    uniqueVariantIds.length > 0
      ? {
          items: uniqueVariantIds.map((vid) => ({
            variantId: vid,
            quantity: 1, // Default, will be updated by form logic if possible
            unitPrice: 0,
            notes: '',
          })),
          // usage of warehouseId would be in notes or internal logic if PO supported it directly
          // Currently PO is per supplier, not per warehouse (receive is per warehouse)
          // We can put it in notes for now
          notes: warehouseId
            ? `[Auto-generated from Stock Alert for Warehouse ID: ${warehouseId}]`
            : '',
        }
      : undefined;

  return <PurchaseOrderForm initialData={prefilledData} />;
}

export default function CreatePurchaseOrderPage() {
  const t = useTranslations('purchases.orders');
  useBreadcrumb('/purchases/orders/new', t('form.createTitle'));

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
        <CreatePurchaseOrderContent />
      </Suspense>
    </div>
  );
}
