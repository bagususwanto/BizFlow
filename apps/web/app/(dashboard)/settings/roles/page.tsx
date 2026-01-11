'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { useAuthStore } from '@/stores/auth.store';
import { rolesService } from '@/services/roles.service';
import { RolesTable } from '@/components/roles/roles-table';
import { ErrorState } from '@/components/common/error-state';
import { LoadingState } from '@/components/common/loading-state';

export default function RolesPage() {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const {
    data: roles,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: () => {
      if (!token) throw new Error('Unauthorized');
      return rolesService.getAll(token);
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error('Unauthorized');
      return rolesService.delete(id, token);
    },
    onSuccess: () => {
      toast.success('Role berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal memuat data role"
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['roles'] })}
      />
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
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
