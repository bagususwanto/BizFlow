'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
  Label,
} from '@bizflow/ui';
import {
  updateUserSchema,
  type UpdateUserValues,
  type User,
} from '@bizflow/types';
import { usersService } from '@/services/users.service';
import { ChangePasswordDialog } from './dialog/change-password-dialog';
import { ChangePinDialog } from './dialog/change-pin-dialog';

interface ProfileFormProps {
  initialData: User;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const form = useForm<UpdateUserValues>({
    // @ts-ignore - reuse preprocess schema logic
    resolver: zodResolver(updateUserSchema) as any,
    defaultValues: {
      name: initialData.name,
      email: initialData.email || '',
      // Role & Status are handled by admin, not here
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: UpdateUserValues) => {
    try {
      // Filter out sensitive fields just in case script injection
      // Although schema validation handles it, we strictly send only allowed fields for profile
      await usersService.update(initialData.id, {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
      });
      toast.success('Profil berhasil diperbarui');
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal memperbarui profil',
      );
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama Lengkap"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={initialData.username} disabled />
              <p className="text-sm text-muted-foreground">
                Username tidak dapat diubah.
              </p>
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={initialData.role?.name || '-'}
                disabled
                className="capitalize"
              />
              <p className="text-sm text-muted-foreground">
                Hubungi admin untuk mengubah role.
              </p>
            </div>
          </div>

          <div className="flex justify-start">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Simpan Profil
            </Button>
          </div>
        </form>
      </Form>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Keamanan</h3>
          <p className="text-sm text-muted-foreground">
            Kelola password dan PIN untuk login.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => setShowPasswordDialog(true)}
          >
            <Lock className="mr-2 h-4 w-4" />
            Ganti Password
          </Button>

          <Button
            variant="outline"
            type="button"
            onClick={() => setShowPinDialog(true)}
          >
            <Lock className="mr-2 h-4 w-4" />
            Ganti PIN
          </Button>
        </div>
      </div>

      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />

      <ChangePinDialog
        userId={initialData.id}
        open={showPinDialog}
        onOpenChange={setShowPinDialog}
      />
    </div>
  );
}
