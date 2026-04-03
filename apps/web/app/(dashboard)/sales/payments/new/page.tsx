'use client';

import { use } from 'react';
import { CustomerPaymentForm } from '@/components/sales/payments/customer-payment-form';

export default function NewCustomerPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = use(searchParams);
  const invoiceId = resolvedParams?.invoiceId as string;
  const customerId = resolvedParams?.customerId as string;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <CustomerPaymentForm
        initialData={{
          ...(invoiceId ? { invoiceId } : {}),
          ...(customerId ? { customerId } : {}),
        }}
      />
    </div>
  );
}
