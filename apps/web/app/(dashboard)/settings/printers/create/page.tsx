'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { PrinterForm } from '@/components/core/printers/printer-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

export default function CreatePrinterPage() {
  useBreadcrumb('/settings/printers/create', 'Tambah Printer');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tambah Printer</h2>
        <p className="text-muted-foreground">
          Konfigurasi printer thermal baru untuk outlet.
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
          <PrinterForm />
        </CardContent>
      </Card>
    </div>
  );
}
