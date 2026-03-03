'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@bizflow/ui';
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from '@bizflow/types';
import { authService } from '@/services/auth.service';
import { useTranslations } from 'next-intl';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const t = useTranslations('profile');
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ChangePasswordValues) => {
    try {
      await authService.changePassword(data);
      toast.success(t('passwordDialog.successMsg'));
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : t('passwordDialog.errorMsg'),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('passwordDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('passwordDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t('passwordDialog.currentLabel')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('passwordDialog.currentPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('passwordDialog.newLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('passwordDialog.newPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('passwordDialog.newDesc')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t('passwordDialog.confirmLabel')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('passwordDialog.confirmPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('passwordDialog.cancelBtn')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {!isSubmitting && <Save className="mr-2 h-4 w-4" />}
                {t('passwordDialog.saveBtn')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
