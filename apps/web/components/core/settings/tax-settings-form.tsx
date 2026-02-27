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
} from '@bizflow/ui';
import { AppSetting } from '@bizflow/types';
import { useUpdateSettings } from '@/hooks';
import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

const taxSettingsSchema = z.object({
  default_tax_rate: z.coerce.number().min(0, 'settings.tax.rateError'),
  tax_inclusive: z.boolean(),
});

type TaxSettingsValues = z.infer<typeof taxSettingsSchema>;

interface TaxSettingsFormProps {
  settings: AppSetting[];
}

export function TaxSettingsForm({ settings }: TaxSettingsFormProps) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const t = useTranslations('settings');

  const form = useForm<TaxSettingsValues>({
    resolver: zodResolver(taxSettingsSchema) as any,
    defaultValues: {
      default_tax_rate: 0,
      tax_inclusive: false,
    },
  });

  useEffect(() => {
    if (settings.length > 0) {
      const values: any = {};
      settings.forEach((setting) => {
        if (setting.key === 'default_tax_rate') {
          values[setting.key] = parseFloat(setting.value) || 0;
        } else if (setting.key === 'tax_inclusive') {
          values[setting.key] = setting.value === 'true';
        }
      });
      form.reset(values);
    }
  }, [settings, form]);

  const onSubmit = (data: TaxSettingsValues) => {
    const updateData = [
      { key: 'default_tax_rate', value: data.default_tax_rate.toString() },
      { key: 'tax_inclusive', value: data.tax_inclusive.toString() },
    ];

    updateSettings({ settings: updateData });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tax.title')}</CardTitle>
        <CardDescription>{t('tax.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="default_tax_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('tax.rateLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('tax.ratePlaceholder')}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>{t('tax.rateDesc')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tax_inclusive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('tax.inclusiveLabel')}
                    </FormLabel>
                    <FormDescription>{t('tax.inclusiveDesc')}</FormDescription>
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
