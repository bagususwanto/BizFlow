'use client';

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
          Catat penerimaan barang dari supplier berdasarkan Purchase Order.
        </p>
      </div>

      <GoodsReceiveForm />
    </div>
  );
}
