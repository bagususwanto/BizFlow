import { PaymentTermForm } from '@/components/master-data/payment-terms/payment-term-form';
import { Card } from '@bizflow/ui';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tambah Termin Pembayaran - BizFlow',
  description: 'Tambah termin pembayaran baru',
};

export default function CreatePaymentTermPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Tambah Termin Pembayaran
          </h2>
          <p className="text-muted-foreground">
            Buat termin pembayaran baru untuk digunakan pada transaksi
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <PaymentTermForm />
      </div>
    </div>
  );
}
