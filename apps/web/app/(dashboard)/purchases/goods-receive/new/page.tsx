'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { GoodsReceiveForm } from '@/components/inventory/goods-receive-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

export default function CreateGoodsReceivePage() {
  useBreadcrumb('/purchases/goods-receive/new', 'Terima Barang');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Penerimaan Barang Baru
        </h2>
        <p className="text-muted-foreground">
          Catat penerimaan barang dari pemasok berdasarkan Purchase Order.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <GoodsReceiveForm />
      </Suspense>
    </div>
  );
}
