'use client';

import { useQuery } from '@tanstack/react-query';
import { purchaseOrdersService } from '@/services/purchase-orders.service';
import { Loader2 } from 'lucide-react';
import { PurchaseOrderForm } from '@/components/purchases/purchase-order-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

export default function EditPurchaseOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: purchaseOrder, isLoading } = useQuery({
    queryKey: ['purchase-orders', params.id],
    queryFn: () => purchaseOrdersService.getById(params.id),
  });

  useBreadcrumb(
    `/purchases/orders/${params.id}/edit`,
    `Edit PO ${purchaseOrder?.orderNumber || '...'}`,
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!purchaseOrder) {
    return <div>Purchase Order tidak ditemukan</div>;
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
