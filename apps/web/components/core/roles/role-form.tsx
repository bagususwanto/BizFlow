import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoleSchema, updateRoleSchema } from '@bizflow/types';
import type { CreateRoleValues, UpdateRoleValues } from '@bizflow/types';
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@bizflow/ui';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { PermissionMatrix } from './permission-matrix';
import type { PermissionData, Role } from '@/services/roles.service';

interface RoleFormProps {
  initialData?: Role;
  permissionData: PermissionData;
  onSubmit: (values: CreateRoleValues | UpdateRoleValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function RoleForm({
  initialData,
  permissionData,
  onSubmit,
  isSubmitting = false,
}: RoleFormProps) {
  const t = useTranslations('roles');
  const router = useRouter();
  const isEditing = !!initialData;
  const isSystemRole = initialData?.isSystemRole;

  // Choose schema based on mode
  const schema = isEditing ? updateRoleSchema : createRoleSchema;

  const form = useForm<CreateRoleValues>({
    // @ts-ignore - Resolver types mismatch due to strict/loose zod types but structure is compatible
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      permissions: initialData?.permissions || [],
    },
  });

  const handleSubmit = async (values: CreateRoleValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit as any)}
        className="space-y-8"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control as any}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('form.nameLabel')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('form.namePlaceholder')}
                    {...field}
                    disabled={isSubmitting || (isEditing && isSystemRole)}
                  />
                </FormControl>
                <FormDescription>
                  {t('form.nameDesc1')}
                  {isEditing && isSystemRole && t('form.nameDescSystem')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel optional>{t('form.descLabel')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('form.descPlaceholder')}
                    {...field}
                    disabled={isSubmitting}
                  />
                  {/* Note: Using Input as Textarea is missing in UI package for now */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control as any}
          name="permissions"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('form.permissionsLabel')}</FormLabel>
              <FormControl>
                <PermissionMatrix
                  data={permissionData}
                  selectedPermissions={field.value || []}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            {t('form.cancelBtn')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isSubmitting && <Save className="mr-2 h-4 w-4" />}
            {isEditing ? t('form.saveBtn') : t('form.createBtn')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
