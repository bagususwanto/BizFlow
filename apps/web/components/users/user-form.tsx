'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@bizflow/ui';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserValues,
  type UpdateUserValues,
  type User,
} from '@bizflow/types';
import { usersService } from '@/services/users.service';
import { useRoles } from '@/hooks/use-roles';
import { useActiveOutlets } from '@/hooks/use-outlets';
import { MultiSelect } from '@/components/common/multi-select';

interface UserFormProps {
  initialData?: User;
  isEdit?: boolean;
}

export function UserForm({ initialData, isEdit = false }: UserFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { roles, isLoading: isLoadingRoles } = useRoles();
  const { data: outlets = [], isLoading: isLoadingOutlets } =
    useActiveOutlets();

  const form = useForm<CreateUserValues | UpdateUserValues>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema) as any,
    defaultValues: isEdit
      ? {
          name: initialData?.name || '',
          email: initialData?.email || '',
          roleId: initialData?.roleId || initialData?.role?.id || '',
          isActive: initialData?.isActive ?? true,
          outletIds: initialData?.outletIds || [],
        }
      : {
          username: '',
          email: '',
          password: '',
          pin: '',
          name: '',
          roleId: '',
          isActive: true,
          outletIds: [],
        },
  });

  const { isSubmitting } = form.formState;

  const outletOptions = outlets.map((outlet) => ({
    label: outlet.name,
    value: outlet.id,
  }));

  const onSubmit = async (data: CreateUserValues | UpdateUserValues) => {
    try {
      if (isEdit && initialData) {
        await usersService.update(initialData.id, data as UpdateUserValues);
        toast.success('User berhasil diperbarui');
      } else {
        await usersService.create(data as CreateUserValues);
        toast.success('User berhasil dibuat');
      }

      // Invalidate users query to refresh data on the list page
      queryClient.invalidateQueries({ queryKey: ['users'] });

      router.back();
      router.refresh();
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* ... existing fields ... */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="johndoe"
                    {...field}
                    value={field.value as string}
                    disabled={isEdit}
                  />
                </FormControl>
                {isEdit && (
                  <FormDescription>
                    Username tidak dapat diubah.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Opsional)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  disabled={isLoadingRoles}
                  onValueChange={field.onChange}
                  defaultValue={field.value as string}
                  value={field.value as string}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="outletIds"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Assign ke Outlet</FormLabel>
                <FormControl>
                  <MultiSelect
                    selected={field.value as string[]}
                    options={outletOptions}
                    onChange={field.onChange}
                    placeholder="Pilih Outlet..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isEdit && (
            <>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="******"
                        {...field}
                        value={field.value as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        inputMode="numeric"
                        placeholder="123456"
                        maxLength={6}
                        {...field}
                        value={field.value as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Status Aktif</FormLabel>
                <div className="text-sm text-muted-foreground">
                  User yang nonaktif tidak dapat login ke sistem.
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Simpan Perubahan' : 'Buat User'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
