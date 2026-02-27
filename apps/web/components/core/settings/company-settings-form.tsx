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
  Textarea,
} from '@bizflow/ui';
import { AppSetting } from '@bizflow/types';
import { useUpdateSettings } from '@/hooks';
import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

const companySettingsSchema = z.object({
  company_name: z.string().min(1, 'settings.company.nameError'),
  company_address: z.string().optional(),
  company_phone: z.string().optional(),
  company_email: z
    .string()
    .email('settings.company.emailError')
    .optional()
    .or(z.literal('')),
  company_tax_id: z.string().optional(),
  company_logo: z
    .string()
    .url('settings.company.logoError')
    .optional()
    .or(z.literal('')),
});

type CompanySettingsValues = z.infer<typeof companySettingsSchema>;

interface CompanySettingsFormProps {
  settings: AppSetting[];
}

export function CompanySettingsForm({ settings }: CompanySettingsFormProps) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const t = useTranslations('settings');

  const form = useForm<CompanySettingsValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      company_name: '',
      company_address: '',
      company_phone: '',
      company_email: '',
      company_tax_id: '',
      company_logo: '',
    },
  });

  // Populate form with settings values
  useEffect(() => {
    if (settings.length > 0) {
      const values: any = {};
      settings.forEach((setting) => {
        if (setting.key in companySettingsSchema.shape) {
          values[setting.key] = setting.value;
        }
      });
      form.reset(values);
    }
  }, [settings, form]);

  const onSubmit = (data: CompanySettingsValues) => {
    const updateData = Object.entries(data).map(([key, value]) => ({
      key,
      value: value || '',
    }));

    updateSettings({ settings: updateData });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('company.title')}</CardTitle>
        <CardDescription>{t('company.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('company.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('company.namePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="company_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('company.emailLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('company.emailPlaceholder')}
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>{t('company.phoneLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('company.phonePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="company_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>{t('company.addressLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('company.addressPlaceholder')}
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
              name="company_tax_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>{t('company.taxIdLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('company.taxIdPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>{t('company.logoLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('company.logoPlaceholder')}
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
