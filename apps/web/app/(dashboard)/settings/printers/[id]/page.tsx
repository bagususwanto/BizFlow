'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

import { PrinterForm } from '@/components/core/printers/printer-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { usePrinter } from '@/hooks';
import { useTranslations } from 'next-intl';

export default function EditPrinterPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('printers');
  const { data: printer, isLoading } = usePrinter(id);

  useBreadcrumb(`/settings/printers/${id}`, t('edit.title'));

  if (isLoading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('edit.title')}</h2>
        <p className="text-muted-foreground">
          {t('edit.subtitle', { name: printer?.name || '' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('edit.cardTitle')}</CardTitle>
          <CardDescription>{t('edit.cardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <PrinterForm initialData={printer} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
