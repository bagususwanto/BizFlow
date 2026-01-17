'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { useAuthStore } from '@/stores/auth.store';
import { rolesService } from '@/services/roles.service';
import { RoleForm } from '@/components/roles/role-form';
import type { CreateRoleValues } from '@bizflow/types';

export default function CreateRolePage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const {
    data: permissionData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => {
      // Token handled by apiClient
      return rolesService.getPermissions();
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateRoleValues) => {
      // Token handled by apiClient
      return rolesService.create(values);
    },
    onSuccess: () => {
      toast.success('Role berhasil dibuat');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      router.back();
      router.refresh();
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

  if (isError || !permissionData) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        Gagal memuat data permissions
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Buat Peran Baru</h2>
        <p className="text-muted-foreground">
          Buat peran baru dan tentukan hak aksesnya.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Peran</CardTitle>
          <CardDescription>
            Isi detail peran dan pilih hak akses yang sesuai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleForm
            permissionData={permissionData}
            onSubmit={async (values) => {
              createMutation.mutate(values as CreateRoleValues);
            }}
            isSubmitting={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
