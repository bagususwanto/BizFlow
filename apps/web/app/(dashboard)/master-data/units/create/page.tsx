'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { UnitForm } from '@/components/master-data/units/unit-form';

export default function CreateUnitPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buat Satuan Baru</h1>
        <p className="text-muted-foreground">
          Tambahkan satuan baru untuk pengukuran produk.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Satuan</CardTitle>
          <CardDescription>
            Isi detail satuan baru di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnitForm />
        </CardContent>
      </Card>
    </div>
  );
}
