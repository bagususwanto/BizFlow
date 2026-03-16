'use client';

import { Suspense, use } from 'react';
import { InvoiceForm } from '@/components/sales/invoices/invoice-form';
import { useSalesInvoice } from '@/hooks/use-sales-invoices';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useRouter } from 'next/navigation';
import { Button } from '@bizflow/ui';
import { formatCurrency } from '@bizflow/ui';
import { useFormatDate } from '@/hooks';

function EditInvoiceContent({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations('sales.invoices');
  const { data: invoice, isLoading } = useSalesInvoice(id);
  const { formatDateTime } = useFormatDate();

  useBreadcrumb(
    `/sales/invoices/${id}`,
    invoice?.invoiceNumber || t('detailTitle')
  );

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <h2 className="text-xl font-semibold">Invoice tidak ditemukan</h2>
      </div>
    );
  }

  const isDraft = invoice.status === 'draft';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/sales/invoices')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {invoice.invoiceNumber}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{formatDateTime(invoice.createdAt)}</span>
              <span>•</span>
              <span className="font-medium uppercase">{invoice.status}</span>
            </div>
          </div>
        </div>
      </div>

      {isDraft ? (
         <InvoiceForm initialData={invoice} />
      ) : (
         <div className="rounded-md border p-8 space-y-4 bg-card text-card-foreground shadow-sm">
            <h2 className="text-xl font-semibold">Detail Mode (Read Only)</h2>
            <p className="text-muted-foreground">
              Invoice ini tidak dapat diedit karena statusnya sudah <strong>{invoice.status}</strong>.
            </p>
            <div className="mt-4">
              <p>Total Tagihan: <span className="font-bold">{formatCurrency(Number(invoice.total))}</span></p>
              <p>Sisa Pembayaran: <span className="font-bold text-destructive">{formatCurrency(Number(invoice.total) - Number(invoice.paidAmount))}</span></p>
            </div>
         </div>
      )}
    </div>
  );
}

export default function EditSalesInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <EditInvoiceContent id={resolvedParams.id} />
    </Suspense>
  );
}
