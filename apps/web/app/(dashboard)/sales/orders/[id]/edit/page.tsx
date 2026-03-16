'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesOrdersService } from '@/services/sales-orders.service';
import { SalesOrderForm } from '@/components/sales/sales-order-form';

import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useTranslations } from 'next-intl';

export default function EditSalesOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const t = useTranslations('sales.orders');
  const {
    data: salesOrder,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['sales-orders', resolvedParams.id],
    queryFn: () => salesOrdersService.getById(resolvedParams.id),
  });

  useBreadcrumb(
    `/sales/orders/${resolvedParams.id}`,
    salesOrder?.orderNumber || t('actions.detail'),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !salesOrder) {
    return (
      <ErrorState title={t('detail.failedLoad')} onRetry={() => refetch()} />
    );
  }

  // Transform data for form
  const initialData = {
    ...salesOrder,
    customerId: salesOrder.customerId,
    orderDate: salesOrder.orderDate
      ? new Date(salesOrder.orderDate)
      : undefined,
    dueDate: salesOrder.dueDate
      ? new Date(salesOrder.dueDate)
      : undefined,
    discountPercent: Number(salesOrder.discountPercent),
    discountAmount: Number(salesOrder.discountAmount),
    taxPercent: Number(salesOrder.taxPercent),
    taxAmount: Number(salesOrder.taxAmount),
    items: (salesOrder.items || []).map((item: any) => ({
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
          {t('form.editTitle')}: {salesOrder.orderNumber}
        </p>
      </div>

      <SalesOrderForm initialData={initialData} />
    </div>
  );
}
