'use client';

import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { UnitForm } from '@/components/master-data/units/unit-form';
import { useUnit } from '@/hooks';

export default function EditUnitPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: unit, isLoading, isError } = useUnit(id);

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !unit) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-muted-foreground">
        Satuan tidak ditemukan
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Satuan</h1>
        <p className="text-muted-foreground">
          Ubah informasi satuan {unit.name}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Edit Satuan</CardTitle>
          <CardDescription>
            Perbarui informasi satuan di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnitForm initialData={unit} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
