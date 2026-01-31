'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { UserForm } from '@/components/core/users/user-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

export default function CreateUserPage() {
  useBreadcrumb('/settings/users/create', 'Tambah Pengguna');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Buat Pengguna Baru
        </h1>
        <p className="text-muted-foreground">
          Buat pengguna baru untuk mengakses sistem.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Pengguna</CardTitle>
          <CardDescription>
            Isi detail pengguna baru di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm />
        </CardContent>
      </Card>
    </div>
  );
}
