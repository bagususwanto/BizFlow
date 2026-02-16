'use client';

import { SupplierForm } from '@/components/master-data/suppliers/supplier-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

export default function CreateSupplierPage() {
  useBreadcrumb('/master-data/suppliers/create', 'Tambah Pemasok');

  return (
    <SupplierForm
      title="Tambah Pemasok"
      description="Buat data pemasok baru untuk pembelian."
    />
  );
}
