'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { OutletForm } from '@/components/outlets/outlet-form';

export default function CreateOutletPage() {
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
