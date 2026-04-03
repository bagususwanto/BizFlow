'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesReturnsService } from '@/services/sales-returns.service';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useTranslations } from 'next-intl';
import { SalesReturnDetail } from '@/components/sales/returns/sales-return-detail';

export default function SalesReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const t = useTranslations('sales.returns.detail');

  const {
    data: ret,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ['sales-returns', resolvedParams.id],
    queryFn: () => salesReturnsService.getById(resolvedParams.id),
  });

  useBreadcrumb(
    `/sales/returns/${resolvedParams.id}`,
    ret?.returnNumber || t('title'),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !ret) {
    return <ErrorState title={t('failedLoad')} onRetry={() => refetch()} />;
  }

  return <SalesReturnDetail ret={ret} refetch={refetch} />;
}
