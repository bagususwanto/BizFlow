'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { OutletForm } from '@/components/core/outlets/outlet-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

export default function CreateOutletPage() {
  useBreadcrumb('/settings/outlets/create', 'Tambah Outlet');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Buat Outlet Baru</h2>
        <p className="text-muted-foreground">
          Tambahkan outlet atau cabang baru ke dalam sistem.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulir Outlet</CardTitle>
          <CardDescription>
            Lengkapi data outlet di bawah ini. Kode outlet harus unik.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OutletForm />
        </CardContent>
      </Card>
    </div>
  );
}
