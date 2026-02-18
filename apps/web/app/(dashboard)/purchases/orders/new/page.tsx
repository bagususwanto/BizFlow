'use client';

import { PurchaseOrderForm } from '@/components/purchases/purchase-order-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

export default function CreatePurchaseOrderPage() {
  useBreadcrumb('/purchases/orders/new', 'Buat PO');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Buat Purchase Order
        </h2>
        <p className="text-muted-foreground">
          Buat pesanan pembelian baru ke supplier.
        </p>
      </div>

      <PurchaseOrderForm />
    </div>
  );
}
