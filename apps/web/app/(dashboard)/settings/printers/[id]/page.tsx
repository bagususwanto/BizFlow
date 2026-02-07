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

export default function EditPrinterPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: printer, isLoading } = usePrinter(id);

  useBreadcrumb(`/settings/printers/${id}`, 'Edit Printer');

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
        <h2 className="text-3xl font-bold tracking-tight">Edit Printer</h2>
        <p className="text-muted-foreground">
          Ubah konfigurasi printer thermal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Printer</CardTitle>
          <CardDescription>
            Atur koneksi dan preferensi printer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrinterForm initialData={printer} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
