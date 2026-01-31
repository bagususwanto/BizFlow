'use client';

import { WarehouseForm } from '@/components/master-data/warehouses/warehouse-form';

export default function CreateWarehousePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tambah Gudang</h2>
          <p className="text-muted-foreground">
            Buat data gudang baru untuk penyimpanan stok.
          </p>
        </div>
      </div>

      <WarehouseForm />
    </div>
  );
}
