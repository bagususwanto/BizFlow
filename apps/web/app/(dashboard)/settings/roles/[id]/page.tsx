'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
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
import type { UpdateRoleValues } from '@bizflow/types';

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const {
    data: permissionData,
    isLoading: isLoadingPermissions,
    isError: isErrorPermissions,
  } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => {
      // Token handled by apiClient
      return rolesService.getPermissions();
    },
    enabled: !!token,
  });

  const {
    data: role,
    isLoading: isLoadingRole,
    isError: isErrorRole,
  } = useQuery({
    queryKey: ['role', id],
    queryFn: () => {
      // Token handled by apiClient
      return rolesService.getById(id);
    },
    enabled: !!token && !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (values: UpdateRoleValues) => {
      // Token handled by apiClient
      return rolesService.update(id, values);
    },
    onSuccess: () => {
      toast.success('Role berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', id] });
      router.back();
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isLoading = isLoadingPermissions || isLoadingRole;
  const isError = isErrorPermissions || isErrorRole;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !permissionData || !role) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        Gagal memuat data role
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Role</h2>
        <p className="text-muted-foreground">
          Ubah detail role dan sesuaikan hak aksesnya.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Role: {role.name}</CardTitle>
          <CardDescription>
            {role.isSystemRole
              ? 'Role sistem memiliki batasan pengeditan.'
              : 'Sesuaikan informasi dan hak akses role ini.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleForm
            initialData={role}
            permissionData={permissionData}
            onSubmit={async (values) => {
              updateMutation.mutate(values as UpdateRoleValues);
            }}
            isSubmitting={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
