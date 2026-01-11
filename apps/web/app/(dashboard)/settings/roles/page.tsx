'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { RolesTable } from '@/components/roles/roles-table';
import { ErrorState } from '@/components/common/error-state';
import { LoadingState } from '@/components/common/loading-state';
import { useRoles } from '@/hooks/use-roles';

export default function RolesPage() {
  const { roles, isLoading, isError, deleteRole, isDeleting, refetch } =
    useRoles();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState title="Gagal memuat data role" onRetry={() => refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Role & Permission
          </h2>
          <p className="text-muted-foreground">
            Kelola hak akses pengguna aplikasi sesuai perannya.
          </p>
        </div>
        <Button asChild>
          <Link href="/settings/roles/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Role
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Role</CardTitle>
          <CardDescription>
            Menampilkan semua role yang tersedia beserta jumlah penggunanya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RolesTable
            data={roles || []}
            onDelete={(id) => deleteRole(id)}
            isDeleting={isDeleting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
