import { PurchaseOrderForm } from '@/components/purchases/purchase-order-form';

export default function CreatePurchaseOrderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Buat Purchase Order
        </h1>
        <p className="text-muted-foreground">
          Buat pesanan pembelian baru untuk supplier
        </p>
      </div>

      <PurchaseOrderForm />
    </div>
  );
}
