'use client';

import { Suspense, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { QuotationForm } from '@/components/sales/quotations/quotation-form';
import { quotationsService } from '@/services/quotations.service';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { ErrorState } from '@/components/common/error-state';
import { useTranslations } from 'next-intl';

function EditQuotationContent({ id }: { id: string }) {
  const {
    data: quotation,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['quotations', id],
    queryFn: () => quotationsService.getById(id),
  });

  const t = useTranslations('sales.quotations');
  useBreadcrumb(`/sales/quotations/${id}/edit`, t('form.editTitle'));

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !quotation) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return <QuotationForm initialData={quotation} />;
}

export default function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const t = useTranslations('sales.quotations');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('form.editTitle')}
        </h2>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <EditQuotationContent id={resolvedParams.id} />
      </Suspense>
    </div>
  );
}
