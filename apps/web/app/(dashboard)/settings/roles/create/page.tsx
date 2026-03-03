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
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { RoleForm } from '@/components/core/roles/role-form';
import type { CreateRoleValues } from '@bizflow/types';
import { useTranslations } from 'next-intl';

export default function CreateRolePage() {
  const t = useTranslations('roles');
  useBreadcrumb('/settings/roles/create', t('create.title'));

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
      toast.success(t('create.successMsg'));
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
        {t('create.errorMsg')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('create.title')}
        </h2>
        <p className="text-muted-foreground">{t('create.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('create.cardTitle')}</CardTitle>
          <CardDescription>{t('create.cardDesc')}</CardDescription>
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
