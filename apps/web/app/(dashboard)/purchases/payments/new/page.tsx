'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { SupplierPaymentForm } from '@/components/purchases/payments/supplier-payment-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

export default function CreateSupplierPaymentPage() {
  useBreadcrumb('/purchases/payments/new', 'Buat Pembayaran');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Buat Pembayaran Supplier
        </h2>
        <p className="text-muted-foreground">
          Catat pembayaran ke supplier untuk purchase order atau transaksi
          lainnya.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <SupplierPaymentForm />
      </Suspense>
    </div>
  );
}
