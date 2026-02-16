'use client';

import { SupplierForm } from '@/components/master-data/suppliers/supplier-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

export default function CreateSupplierPage() {
  useBreadcrumb('/master-data/suppliers/create', 'Tambah Pemasok');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tambah Pemasok</h2>
          <p className="text-muted-foreground">
            Buat data pemasok baru untuk pembelian.
          </p>
        </div>
      </div>

      <SupplierForm />
    </div>
  );
}
