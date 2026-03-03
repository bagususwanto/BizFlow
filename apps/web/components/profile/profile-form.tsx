'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock, Save } from 'lucide-react';
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
import { useTranslations } from 'next-intl';

interface ProfileFormProps {
  initialData: User;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const t = useTranslations('profile');
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
      toast.success(t('form.successMsg'));
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : t('form.errorMsg'));
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
                  <FormLabel required>{t('form.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.namePlaceholder')}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>{t('form.usernameLabel')}</Label>
              <Input value={initialData.username} disabled />
              <p className="text-sm text-muted-foreground">
                {t('form.usernameDesc')}
              </p>
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>{t('form.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('form.emailPlaceholder')}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>{t('form.roleLabel')}</Label>
              <Input
                value={initialData.role?.name || '-'}
                disabled
                className="capitalize"
              />
              <p className="text-sm text-muted-foreground">
                {t('form.roleDesc')}
              </p>
            </div>
          </div>

          <div className="flex justify-start">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {!isSubmitting && <Save className="mr-2 h-4 w-4" />}
              {isSubmitting ? t('form.savingBtn') : t('form.saveBtn')}
            </Button>
          </div>
        </form>
      </Form>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">{t('security.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('security.description')}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => setShowPasswordDialog(true)}
          >
            <Lock className="mr-2 h-4 w-4" />
            {t('security.btnPassword')}
          </Button>

          <Button
            variant="outline"
            type="button"
            onClick={() => setShowPinDialog(true)}
          >
            <Lock className="mr-2 h-4 w-4" />
            {t('security.btnPin')}
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
