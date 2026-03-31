'use client';

import { CustomerPaymentForm } from '@/components/sales/payments/customer-payment-form';

export default function NewCustomerPaymentPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <CustomerPaymentForm />
    </div>
  );
}
