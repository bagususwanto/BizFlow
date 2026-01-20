'use client';

import { use } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { Loader2 } from 'lucide-react';
import { useOutlet } from '@/hooks';
import { OutletForm } from '@/components/outlets/outlet-form';

export default function EditOutletPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: outlet, isLoading, isError } = useOutlet(id);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !outlet) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-red-500">
        Gagal memuat data outlet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Outlet</h2>
        <p className="text-muted-foreground">
          Ubah informasi outlet {outlet.name}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulir Edit Outlet</CardTitle>
          <CardDescription>
            Silakan ubah data outlet di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OutletForm initialData={outlet} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
