'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/fetch-client';
import { createCustomerSchema, CreateCustomerValues } from '@bizflow/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Button,
} from '@bizflow/ui'; // Adjust imports based on your UI library
import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

// Simplified schema for Quick Add - mostly the same but we might want to enforce fewer things or just reuse
const formSchema = createCustomerSchema;

interface QuickAddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (customer: any) => void;
}

export function QuickAddCustomerDialog({
  open,
  onOpenChange,
  onSuccess,
}: QuickAddCustomerDialogProps) {
  const queryClient = useQueryClient();
  const t = useTranslations('pos.quickAddCustomer');

  const form = useForm<CreateCustomerValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      creditLimit: 0,
      isActive: true,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateCustomerValues) => {
      const response = await apiClient.post<any>(
        '/master-data/customers',
        values,
      );
      return response.data;
    },
    onSuccess: (newCustomer) => {
      toast.success(t('success', { name: newCustomer.name }));
      // Invalidate customer list query so it refreshes if needed in background
      queryClient.invalidateQueries({ queryKey: ['customers'] });

      form.reset();
      onSuccess(newCustomer);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed'));
    },
  });

  const onSubmit = (values: CreateCustomerValues) => {
    // Ensure empty strings are treated as undefined/null for optional fields if needed by backend
    // But zod schema handles empty strings for email via .or(z.literal(''))
    mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('fullName')} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t('fullNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('phonePlaceholder')}
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
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('emailPlaceholder')}
                      type="email"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isPending && <Save className="mr-2 h-4 w-4" />}
                {isPending ? t('saving') : t('save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
