'use client';

import { CustomerForm } from '@/components/master-data/customers/customer-form';

export default function CreateCustomerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Tambah Pelanggan
          </h2>
          <p className="text-muted-foreground">
            Buat data pelanggan baru untuk transaksi.
          </p>
        </div>
      </div>

      <CustomerForm />
    </div>
  );
}
