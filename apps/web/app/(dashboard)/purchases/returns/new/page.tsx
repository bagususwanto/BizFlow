'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { PurchaseReturnForm } from '@/components/purchases/returns/purchase-return-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

export default function CreatePurchaseReturnPage() {
  useBreadcrumb('/purchases/returns/new', 'Buat Return');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Buat Retur Pembelian
        </h2>
        <p className="text-muted-foreground">
          Buat retur pembelian baru dari purchase order yang sudah diterima.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <PurchaseReturnForm />
      </Suspense>
    </div>
  );
}
