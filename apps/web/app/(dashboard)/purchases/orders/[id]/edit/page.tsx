'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { purchaseOrdersService } from '@/services/purchase-orders.service';
import { PurchaseOrderForm } from '@/components/purchases/purchase-order-form';

import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useTranslations } from 'next-intl';

export default function EditPurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const t = useTranslations('purchases.orders');
  const {
    data: purchaseOrder,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['purchase-orders', resolvedParams.id],
    queryFn: () => purchaseOrdersService.getById(resolvedParams.id),
  });

  useBreadcrumb(
    `/purchases/orders/${resolvedParams.id}`,
    purchaseOrder?.orderNumber || t('actions.detail'),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !purchaseOrder) {
    return (
      <ErrorState title={t('detail.failedLoad')} onRetry={() => refetch()} />
    );
  }

  // Transform data for form
  const initialData = {
    ...purchaseOrder,
    supplierId: purchaseOrder.supplierId,
    expectedDate: purchaseOrder.expectedDate
      ? new Date(purchaseOrder.expectedDate)
      : undefined,
    discountPercent: Number(purchaseOrder.discountPercent),
    discountAmount: Number(purchaseOrder.discountAmount),
    taxPercent: Number(purchaseOrder.taxPercent),
    taxAmount: Number(purchaseOrder.taxAmount),
    items: (purchaseOrder.items || []).map((item: any) => ({
      variantId: item.variantId,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      notes: item.notes,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('form.editTitle')}
        </h2>
        <p className="text-muted-foreground">
          {t('form.editTitle')}: {purchaseOrder.orderNumber}
        </p>
      </div>

      <PurchaseOrderForm initialData={initialData} />
    </div>
  );
}
