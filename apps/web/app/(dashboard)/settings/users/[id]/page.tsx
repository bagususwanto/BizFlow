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
import { UserForm } from '@/components/core/users/user-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useUser } from '@/hooks';

export default function EditUserPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: user, isLoading, isError } = useUser(id);

  // Set dynamic breadcrumb
  useBreadcrumb(`/settings/users/${id}`, user?.username || 'Edit Pengguna');

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-muted-foreground">
        User tidak ditemukan
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground">
          Ubah informasi user {user.username}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Edit User</CardTitle>
          <CardDescription>
            Perbarui informasi pengguna di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm initialData={user} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
