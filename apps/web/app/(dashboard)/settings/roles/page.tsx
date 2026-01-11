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
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h3 className="text-lg font-semibold text-destructive">
          Gagal memuat data role
        </h3>
        <p className="text-muted-foreground">
          Terjadi kesalahan saat mengambil data dari server.
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['roles'] })}
        >
          Coba Lagi
        </Button>
      </div>
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
