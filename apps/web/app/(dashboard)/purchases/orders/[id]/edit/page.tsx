'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { purchaseOrdersService } from '@/services/purchase-orders.service';
import { PurchaseOrderForm } from '@/components/purchases/purchase-order-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';

export default function EditPurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
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
    `/purchases/orders/${resolvedParams.id}/edit`,
    `Edit PO ${purchaseOrder?.orderNumber || '...'}`,
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
      <ErrorState
        title="Gagal memuat detail purchase order"
        onRetry={() => refetch()}
      />
    );
  }

  // Transform data for form
  const initialData = {
    ...purchaseOrder,
    supplierId: purchaseOrder.supplierId,
    expectedDate: purchaseOrder.expectedDate
      ? new Date(purchaseOrder.expectedDate)
      : undefined,
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
          Edit Purchase Order
        </h2>
        <p className="text-muted-foreground">
          Edit detail pesanan pembelian: {purchaseOrder.orderNumber}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Pesanan</CardTitle>
          <CardDescription>Perbarui informasi purchase order.</CardDescription>
        </CardHeader>
        <CardContent>
          <PurchaseOrderForm initialData={initialData} />
        </CardContent>
      </Card>
    </div>
  );
}
