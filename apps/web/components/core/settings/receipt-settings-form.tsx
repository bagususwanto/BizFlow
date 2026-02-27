import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Switch,
  FormDescription,
  Textarea,
} from '@bizflow/ui';
import { AppSetting } from '@bizflow/types';
import { useUpdateSettings } from '@/hooks';
import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

const receiptSettingsSchema = z.object({
  receipt_header: z.string().optional(),
  receipt_footer: z.string().optional(),
  receipt_show_logo: z.boolean(),
});

type ReceiptSettingsValues = z.infer<typeof receiptSettingsSchema>;

interface ReceiptSettingsFormProps {
  settings: AppSetting[];
}

export function ReceiptSettingsForm({ settings }: ReceiptSettingsFormProps) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const t = useTranslations('settings');

  const form = useForm<ReceiptSettingsValues>({
    resolver: zodResolver(receiptSettingsSchema),
    defaultValues: {
      receipt_header: '',
      receipt_footer: '',
      receipt_show_logo: true,
    },
  });

  useEffect(() => {
    if (settings.length > 0) {
      const values: any = {};
      settings.forEach((setting) => {
        if (setting.key === 'receipt_show_logo') {
          values[setting.key] = setting.value === 'true';
        } else if (['receipt_header', 'receipt_footer'].includes(setting.key)) {
          values[setting.key] = setting.value;
        }
      });
      form.reset(values);
    }
  }, [settings, form]);

  const onSubmit = (data: ReceiptSettingsValues) => {
    const updateData = [
      { key: 'receipt_header', value: data.receipt_header || '' },
      { key: 'receipt_footer', value: data.receipt_footer || '' },
      { key: 'receipt_show_logo', value: data.receipt_show_logo.toString() },
    ];

    updateSettings({ settings: updateData });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('receipt.title')}</CardTitle>
        <CardDescription>{t('receipt.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="receipt_show_logo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('receipt.showLogoLabel')}
                    </FormLabel>
                    <FormDescription>
                      {t('receipt.showLogoDesc')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receipt_header"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>{t('receipt.headerLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('receipt.headerPlaceholder')}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receipt_footer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>{t('receipt.footerLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('receipt.footerPlaceholder')}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  t('savingBtn')
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('saveBtn')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
